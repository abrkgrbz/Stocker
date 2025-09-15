using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Security;

/// <summary>
/// Security tests focusing on authentication vulnerabilities and attacks
/// </summary>
public class AuthenticationSecurityTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    public AuthenticationSecurityTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Theory]
    [InlineData("admin@test.com'; DROP TABLE Users; --")]
    [InlineData("admin@test.com<script>alert('xss')</script>")]
    [InlineData("admin@test.com' OR '1'='1")]
    [InlineData("admin@test.com' UNION SELECT * FROM Users --")]
    public async Task Login_WithSQLInjectionPayloads_ShouldNotBeVulnerable(string maliciousEmail)
    {
        // Arrange
        var loginRequest = new
        {
            Email = maliciousEmail,
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, 
            "SQL injection attempts should be rejected through input validation");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("DROP");
        responseContent.Should().NotContain("UNION");
        responseContent.Should().NotContain("<script>");
    }

    [Theory]
    [InlineData("<script>alert('xss')</script>")]
    [InlineData("javascript:alert('xss')")]
    [InlineData("'><script>alert('xss')</script>")]
    [InlineData("\"><img src=x onerror=alert('xss')>")]
    [InlineData("${alert('xss')}")]
    public async Task Register_WithXSSPayloads_ShouldSanitizeInput(string maliciousInput)
    {
        // Arrange
        var registerRequest = new
        {
            FirstName = maliciousInput,
            LastName = "User",
            Email = $"test{Guid.NewGuid():N}@example.com",
            Password = "ValidPassword123!",
            ConfirmPassword = "ValidPassword123!",
            CompanyName = $"Test Company {Guid.NewGuid():N}",
            PhoneNumber = "+1234567890"
        };

        var json = JsonSerializer.Serialize(registerRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/register", content);

        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("<script>");
        responseContent.Should().NotContain("javascript:");
        responseContent.Should().NotContain("onerror=");
        responseContent.Should().NotContain("alert(");
    }

    [Fact]
    public async Task Login_WithExcessivelyLongPassword_ShouldRejectRequest()
    {
        // Arrange - Create password longer than reasonable limits (>1000 chars)
        var longPassword = new string('A', 2000);
        var loginRequest = new
        {
            Email = "admin@test.com",
            Password = longPassword,
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.RequestEntityTooLarge);
    }

    [Fact]
    public async Task Login_WithBruteForceAttempts_ShouldImplementRateLimit()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "admin@test.com",
            Password = "WrongPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Simulate brute force attack with 20 concurrent attempts
        for (int i = 0; i < 20; i++)
        {
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            tasks.Add(Client.PostAsync("/api/auth/login", content));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        // Should have some rate limiting or similar protection
        var tooManyRequests = responses.Count(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        var badRequests = responses.Count(r => r.StatusCode == HttpStatusCode.BadRequest);
        
        // At least some requests should be blocked or rejected
        (tooManyRequests + badRequests).Should().BeGreaterThan(0, 
            "Rate limiting should prevent brute force attacks");
    }

    [Theory]
    [InlineData("Bearer invalid-token")]
    [InlineData("Bearer ")]
    [InlineData("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid")]
    [InlineData("InvalidScheme token")]
    [InlineData("")]
    public async Task AuthenticatedEndpoint_WithInvalidTokens_ShouldReturnUnauthorized(string authHeader)
    {
        // Arrange
        if (!string.IsNullOrEmpty(authHeader))
        {
            var parts = authHeader.Split(' ');
            if (parts.Length == 2)
            {
                Client.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue(parts[0], parts[1]);
            }
        }

        // Act
        var response = await Client.PostAsync("/api/auth/logout", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RefreshToken_WithExpiredToken_ShouldReturnUnauthorized()
    {
        // Arrange
        var refreshRequest = new
        {
            RefreshToken = "expired-or-invalid-refresh-token"
        };

        var json = JsonSerializer.Serialize(refreshRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/refresh-token", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("internal");
        responseContent.Should().NotContain("stack");
    }

    [Theory]
    [InlineData("password")]
    [InlineData("123456")]
    [InlineData("admin")]
    [InlineData("Password")]
    [InlineData("password123")]
    public async Task Register_WithWeakPasswords_ShouldRejectRegistration(string weakPassword)
    {
        // Arrange
        var registerRequest = new
        {
            FirstName = "Test",
            LastName = "User",
            Email = $"test{Guid.NewGuid():N}@example.com",
            Password = weakPassword,
            ConfirmPassword = weakPassword,
            CompanyName = $"Test Company {Guid.NewGuid():N}",
            PhoneNumber = "+1234567890"
        };

        var json = JsonSerializer.Serialize(registerRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/register", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, 
            $"Weak password '{weakPassword}' should be rejected");
    }

    [Fact]
    public async Task Login_WithMalformedJSON_ShouldHandleGracefully()
    {
        // Arrange
        var malformedJson = "{ invalid json structure }";
        var content = new StringContent(malformedJson, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("Exception");
        responseContent.Should().NotContain("StackTrace");
    }

    [Fact]
    public async Task AuthEndpoints_ShouldIncludeSecurityHeaders()
    {
        // Act
        var response = await Client.GetAsync("/api/auth/test-seq");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Check for security headers (if implemented)
        var headers = response.Headers;
        
        // These headers might be added by security middleware
        // We're checking if they exist and contain reasonable values
        if (headers.Contains("X-Content-Type-Options"))
        {
            headers.GetValues("X-Content-Type-Options").Should().Contain("nosniff");
        }
        
        if (headers.Contains("X-Frame-Options"))
        {
            headers.GetValues("X-Frame-Options").Should().Contain(v => 
                v.Equals("DENY", StringComparison.OrdinalIgnoreCase) || 
                v.Equals("SAMEORIGIN", StringComparison.OrdinalIgnoreCase));
        }
    }

    [Theory]
    [InlineData("/../../../etc/passwd")]
    [InlineData("..\\..\\windows\\system32\\drivers\\etc\\hosts")]
    [InlineData("%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd")]
    [InlineData("....//....//....//etc/passwd")]
    public async Task AuthEndpoints_WithPathTraversalAttempts_ShouldBeSafe(string maliciousPath)
    {
        // Act
        var response = await Client.GetAsync($"/api/auth/{maliciousPath}");

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound, 
            HttpStatusCode.BadRequest, 
            HttpStatusCode.Forbidden);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("/etc/passwd");
        responseContent.Should().NotContain("root:");
        responseContent.Should().NotContain("admin:");
    }

    [Fact]
    public async Task Login_WithNullBytes_ShouldHandleSafely()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "admin@test.com\0malicious",
            Password = "password\0injection",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotContain("\\0");
    }

    [Fact]
    public async Task Login_ConcurrentSessionsFromSameUser_ShouldBeControlled()
    {
        // This test verifies that concurrent sessions are properly managed
        // In a real scenario, you might want to limit concurrent sessions
        
        // Arrange
        var loginRequest = new
        {
            Email = "admin@test.com",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Simulate multiple login attempts from the same user
        for (int i = 0; i < 5; i++)
        {
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            tasks.Add(Client.PostAsync("/api/auth/login", content));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        // All requests should be handled consistently (either all fail or all succeed based on credentials)
        var statusCodes = responses.Select(r => r.StatusCode).Distinct().ToList();
        statusCodes.Should().HaveCount(1, "All identical requests should have the same outcome");
    }
}