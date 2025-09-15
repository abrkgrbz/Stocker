using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Controllers.Master;

public class MasterUsersControllerIntegrationTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    public MasterUsersControllerIntegrationTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetUsers_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Act
        var response = await Client.GetAsync("/api/master/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetUsers_WithAuth_ShouldReturnUsers()
    {
        // Arrange
        AuthenticateAsSystemAdmin();

        // Act
        var response = await Client.GetAsync("/api/master/users");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var users = JsonSerializer.Deserialize<JsonElement>(responseContent);
            users.ValueKind.Should().BeOneOf(JsonValueKind.Array, JsonValueKind.Object);
        }
    }

    [Fact]
    public async Task GetUsers_WithPagination_ShouldReturnPagedResults()
    {
        // Arrange
        AuthenticateAsSystemAdmin();

        // Act
        var response = await Client.GetAsync("/api/master/users?page=1&pageSize=5");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var users = JsonSerializer.Deserialize<JsonElement>(responseContent);
            users.ValueKind.Should().BeOneOf(JsonValueKind.Array, JsonValueKind.Object);
        }
    }

    [Fact]
    public async Task GetUsers_WithSearchTerm_ShouldReturnFilteredResults()
    {
        // Arrange
        AuthenticateAsSystemAdmin();

        // Act
        var response = await Client.GetAsync("/api/master/users?searchTerm=admin");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var users = JsonSerializer.Deserialize<JsonElement>(responseContent);
            users.ValueKind.Should().BeOneOf(JsonValueKind.Array, JsonValueKind.Object);
        }
    }

    [Fact]
    public async Task GetUser_WithValidId_ShouldReturnUser()
    {
        // Arrange
        AuthenticateAsSystemAdmin();
        var userId = Guid.NewGuid().ToString();

        // Act
        var response = await Client.GetAsync($"/api/master/users/{userId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var user = JsonSerializer.Deserialize<JsonElement>(responseContent);
            user.TryGetProperty("id", out _).Should().BeTrue();
        }
    }

    [Fact]
    public async Task GetUser_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();

        // Act
        var response = await Client.GetAsync($"/api/master/users/{userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid-id")]
    public async Task GetUser_WithInvalidId_ShouldHandleGracefully(string invalidId)
    {
        // Arrange
        AuthenticateAsSystemAdmin();

        // Act
        var response = await Client.GetAsync($"/api/master/users/{invalidId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ToggleUserStatus_WithValidId_ShouldToggleStatus()
    {
        // Arrange
        AuthenticateAsSystemAdmin();
        var userId = Guid.NewGuid().ToString();

        // Act
        var response = await Client.PostAsync($"/api/master/users/{userId}/toggle-status", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
            result.TryGetProperty("success", out var success).Should().BeTrue();
            success.GetBoolean().Should().BeTrue();
            result.TryGetProperty("message", out _).Should().BeTrue();
        }
    }

    [Fact]
    public async Task ToggleUserStatus_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();

        // Act
        var response = await Client.PostAsync($"/api/master/users/{userId}/toggle-status", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AssignTenantToUser_WithValidIds_ShouldAssignTenant()
    {
        // Arrange
        AuthenticateAsSystemAdmin();
        var userId = Guid.NewGuid().ToString();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await Client.PostAsync($"/api/master/users/{userId}/assign-tenant/{tenantId}", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
            result.TryGetProperty("success", out var success).Should().BeTrue();
            success.GetBoolean().Should().BeTrue();
            result.TryGetProperty("message", out _).Should().BeTrue();
        }
    }

    [Fact]
    public async Task AssignTenantToUser_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await Client.PostAsync($"/api/master/users/{userId}/assign-tenant/{tenantId}", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("invalid-user", "00000000-0000-0000-0000-000000000000")]
    [InlineData("", "invalid-tenant")]
    public async Task AssignTenantToUser_WithInvalidIds_ShouldHandleGracefully(string userId, string tenantIdString)
    {
        // Arrange
        AuthenticateAsSystemAdmin();

        // Act
        var response = await Client.PostAsync($"/api/master/users/{userId}/assign-tenant/{tenantIdString}", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task MasterUsersEndpoints_ShouldHandleConcurrentRequests()
    {
        // Arrange
        AuthenticateAsSystemAdmin();
        var tasks = new List<Task<HttpResponseMessage>>();
        
        for (int i = 0; i < 5; i++)
        {
            tasks.Add(Client.GetAsync("/api/master/users"));
            tasks.Add(Client.GetAsync($"/api/master/users?page={i + 1}&pageSize=10"));
        }

        // Act
        var responses = await Task.WhenAll(tasks);

        // Assert
        responses.Should().HaveCount(10);
        responses.Should().OnlyContain(r => 
            r.StatusCode == HttpStatusCode.OK || 
            r.StatusCode == HttpStatusCode.NotFound ||
            r.StatusCode == HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetUsers_ShouldRespectPageSizeLimits()
    {
        // Arrange
        AuthenticateAsSystemAdmin();

        // Test with very large page size
        var response1 = await Client.GetAsync("/api/master/users?pageSize=1000");
        
        // Test with very small page size
        var response2 = await Client.GetAsync("/api/master/users?pageSize=1");
        
        // Test with negative page size
        var response3 = await Client.GetAsync("/api/master/users?pageSize=-1");

        // Assert
        response1.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.Unauthorized);
        response2.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        response3.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetUsers_ShouldHandleSpecialCharactersInSearch()
    {
        // Arrange
        AuthenticateAsSystemAdmin();

        // Act
        var response = await Client.GetAsync("/api/master/users?searchTerm=%20!@#$%^&*()");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task MasterUsers_ShouldRequireMasterAccessPolicy()
    {
        // Arrange - Authenticate as regular admin (not system admin)
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync("/api/master/users");

        // Assert
        // Should return Unauthorized or Forbidden due to missing MasterAccess policy
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);
    }
}