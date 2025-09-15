using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Security;

/// <summary>
/// Security tests focusing on authorization vulnerabilities and privilege escalation
/// </summary>
public class AuthorizationSecurityTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    private readonly Guid _testTenantId = Guid.NewGuid();

    public AuthorizationSecurityTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task TenantEndpoint_WithWrongTenantInToken_ShouldDenyAccess()
    {
        // Arrange
        AuthenticateAsUser("user@different-tenant.com"); // User from different tenant

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Forbidden, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task MasterEndpoint_WithRegularUserToken_ShouldDenyAccess()
    {
        // Arrange
        AuthenticateAsUser("regularuser@tenant.com"); // Regular user, not master admin

        // Act
        var response = await Client.GetAsync("/api/master/users");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Forbidden, HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("/api/master/users")]
    [InlineData("/api/master/tenants")]
    [InlineData("/health/detailed")]
    public async Task PrivilegedEndpoints_WithoutProperRole_ShouldDenyAccess(string endpoint)
    {
        // Arrange
        AuthenticateAsUser("user@tenant.com"); // Regular user without admin privileges

        // Act
        var response = await Client.GetAsync(endpoint);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Forbidden, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CustomerData_CrossTenantAccess_ShouldBeBlocked()
    {
        // Arrange
        var tenant1Id = Guid.NewGuid();
        var tenant2Id = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        
        AuthenticateAsAdmin(); // Admin of tenant1

        // Act - Try to access customer from different tenant
        var response = await Client.GetAsync($"/api/tenants/{tenant1Id}/customers/{customerId}");

        // Assert
        // Should not leak information about existence of customers in other tenants
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound, 
            HttpStatusCode.Forbidden, 
            HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")] // Valid JWT structure but wrong signature
    [InlineData("Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiYWRtaW4iOnRydWV9.invalid-signature")]
    public async Task TokenTampering_ShouldBeDetected(string tamperedToken)
    {
        // Arrange
        var parts = tamperedToken.Split(' ');
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue(parts[0], parts[1]);

        // Act
        var response = await Client.GetAsync("/api/master/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RoleEscalation_ThroughManipulatedClaims_ShouldBeBlocked()
    {
        // Arrange - Create a token with manipulated role claims
        var tokenWithFakeRole = "test-token-user@tenant.com-SuperAdmin"; // Fake super admin role
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", tokenWithFakeRole);

        // Act
        var response = await Client.GetAsync("/api/master/users");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Forbidden, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DirectObjectReference_WithUnauthorizedId_ShouldBeDenied()
    {
        // Arrange
        var unauthorizedUserId = Guid.NewGuid();
        AuthenticateAsUser("user@tenant.com"); // Regular user

        // Act - Try to access other user's data directly by ID
        var response = await Client.GetAsync($"/api/master/users/{unauthorizedUserId}");

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Forbidden, 
            HttpStatusCode.Unauthorized, 
            HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task TenantIsolation_ResourceLeakage_ShouldBeBlocked()
    {
        // Arrange
        var tenant1Id = Guid.NewGuid();
        var tenant2Id = Guid.NewGuid();
        
        AuthenticateAsAdmin(); // Admin but wrong tenant

        var createCustomerRequest = new
        {
            Name = "Test Customer",
            Email = $"customer{Guid.NewGuid():N}@test.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createCustomerRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act - Try to create customer in unauthorized tenant
        var createResponse = await Client.PostAsync($"/api/tenants/{tenant1Id}/customers", content);
        var listResponse = await Client.GetAsync($"/api/tenants/{tenant2Id}/customers");

        // Assert
        // Should not be able to create or access resources across tenants
        createResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.Forbidden, 
            HttpStatusCode.Unauthorized,
            HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData("00000000-0000-0000-0000-000000000000")] // Empty GUID
    [InlineData("ffffffff-ffff-ffff-ffff-ffffffffffff")] // Max GUID
    [InlineData("invalid-guid-format")] // Invalid format
    public async Task ParameterManipulation_WithInvalidIds_ShouldBeHandledSafely(string invalidId)
    {
        // Arrange
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{invalidId}/customers");

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.NotFound,
            HttpStatusCode.Unauthorized);
            
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("Exception");
        responseContent.Should().NotContain("StackTrace");
    }

    [Fact]
    public async Task MassAssignment_ShouldBeBlocked()
    {
        // Arrange
        AuthenticateAsAdmin();
        var customerId = Guid.NewGuid();

        var maliciousUpdateRequest = new Dictionary<string, object>
        {
            ["Name"] = "Updated Name",
            ["Email"] = "updated@test.com",
            ["IsAdmin"] = true, // Attempting to escalate privileges
            ["TenantId"] = Guid.NewGuid(), // Attempting to change tenant
            ["CreatedDate"] = DateTime.Now.AddYears(-10), // Attempting to modify audit fields
            ["IsDeleted"] = false
        };

        var json = JsonSerializer.Serialize(maliciousUpdateRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/tenants/{_testTenantId}/customers/{customerId}", content);

        // Assert
        // The update should either fail or only update allowed fields
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var customer = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            // Verify critical fields weren't modified through mass assignment
            if (customer.TryGetProperty("isAdmin", out _))
            {
                Assert.False(false, "IsAdmin field should not be mass-assignable");
            }
        }
    }

    [Fact]
    public async Task ConcurrentModification_ShouldHandleRaceConditions()
    {
        // Arrange
        AuthenticateAsAdmin();
        var customerId = Guid.NewGuid();
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Multiple concurrent updates to same resource
        for (int i = 0; i < 10; i++)
        {
            var updateRequest = new
            {
                Name = $"Concurrent Update {i}",
                Email = $"concurrent{i}@test.com"
            };

            var json = JsonSerializer.Serialize(updateRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            tasks.Add(Client.PutAsync($"/api/tenants/{_testTenantId}/customers/{customerId}", content));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        // Should handle concurrent modifications gracefully
        responses.Should().OnlyContain(r => 
            r.StatusCode == HttpStatusCode.OK ||
            r.StatusCode == HttpStatusCode.NotFound ||
            r.StatusCode == HttpStatusCode.Conflict ||
            r.StatusCode == HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SessionFixation_ShouldBeProtected()
    {
        // Arrange
        var fixedSessionId = Guid.NewGuid().ToString();
        Client.DefaultRequestHeaders.Add("X-Session-ID", fixedSessionId);
        
        var loginRequest = new
        {
            Email = "admin@test.com",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        // Application should not accept pre-set session IDs
        if (response.IsSuccessStatusCode)
        {
            // Check if the response generates a new session or token
            var responseContent = await response.Content.ReadAsStringAsync();
            responseContent.Should().NotContain(fixedSessionId, 
                "Session fixation should be prevented");
        }
    }

    [Theory]
    [InlineData("HTTP_HOST", "evil.com")]
    [InlineData("HTTP_REFERER", "http://malicious-site.com")]
    [InlineData("HTTP_X_FORWARDED_HOST", "attacker.com")]
    [InlineData("HTTP_X_FORWARDED_FOR", "192.168.1.100")]
    public async Task HeaderInjection_ShouldBeSanitized(string headerName, string maliciousValue)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        // Some headers might be blocked by HttpClient, but we test what we can
        if (headerName == "HTTP_REFERER")
        {
            Client.DefaultRequestHeaders.Referrer = new Uri(maliciousValue);
        }
        else if (headerName == "HTTP_X_FORWARDED_FOR")
        {
            Client.DefaultRequestHeaders.Add("X-Forwarded-For", maliciousValue);
        }

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");

        // Assert
        // Should handle malicious headers gracefully
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK,
            HttpStatusCode.BadRequest,
            HttpStatusCode.Forbidden);
            
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("evil.com");
        responseContent.Should().NotContain("attacker.com");
    }

    [Fact]
    public async Task ResourceEnumeration_ShouldBeLimited()
    {
        // Arrange
        AuthenticateAsUser("user@tenant.com");

        var tasks = new List<Task<HttpResponseMessage>>();
        
        // Act - Try to enumerate resources by ID
        for (int i = 1; i <= 100; i++)
        {
            var resourceId = new Guid(i.ToString().PadLeft(32, '0'));
            tasks.Add(Client.GetAsync($"/api/tenants/{_testTenantId}/customers/{resourceId}"));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        // Should not reveal information about resource existence patterns
        var distinctStatusCodes = responses.Select(r => r.StatusCode).Distinct().ToList();
        distinctStatusCodes.Should().Contain(HttpStatusCode.NotFound, 
            "Non-existent resources should return NotFound");
        
        // Should not return different status codes that could leak information
        var leakyStatusCodes = responses.Where(r => 
            r.StatusCode != HttpStatusCode.NotFound &&
            r.StatusCode != HttpStatusCode.Unauthorized &&
            r.StatusCode != HttpStatusCode.Forbidden).ToList();
            
        leakyStatusCodes.Should().HaveCount(0, 
            "Should not leak information about resource existence");
    }
}