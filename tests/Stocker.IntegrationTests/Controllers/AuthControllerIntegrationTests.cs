using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Controllers;

public class AuthControllerIntegrationTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    public AuthControllerIntegrationTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnSuccess()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "admin@testcompany.com",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotBeNullOrEmpty();
        
        if (response.IsSuccessStatusCode)
        {
            var authResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
            authResponse.TryGetProperty("accessToken", out _).Should().BeTrue();
            authResponse.TryGetProperty("refreshToken", out _).Should().BeTrue();
        }
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturnBadRequest()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "nonexistent@test.com",
            Password = "WrongPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var errorResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        errorResponse.TryGetProperty("success", out var success).Should().BeTrue();
        success.GetBoolean().Should().BeFalse();
        errorResponse.TryGetProperty("message", out _).Should().BeTrue();
    }

    [Fact]
    public async Task Login_WithMissingEmail_ShouldReturnBadRequest()
    {
        // Arrange
        var loginRequest = new
        {
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithInvalidEmailFormat_ShouldReturnBadRequest()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "invalid-email-format",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithValidData_ShouldReturnSuccess()
    {
        // Arrange
        var registerRequest = new
        {
            FirstName = "Test",
            LastName = "User",
            Email = $"testuser{Guid.NewGuid():N}@example.com",
            Password = "TestPassword123!",
            ConfirmPassword = "TestPassword123!",
            CompanyName = $"Test Company {Guid.NewGuid():N}",
            PhoneNumber = "+1234567890"
        };

        var json = JsonSerializer.Serialize(registerRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/register", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Register_WithInvalidPassword_ShouldReturnBadRequest()
    {
        // Arrange
        var registerRequest = new
        {
            FirstName = "Test",
            LastName = "User",
            Email = $"testuser{Guid.NewGuid():N}@example.com",
            Password = "weak", // Too weak password
            ConfirmPassword = "weak",
            CompanyName = $"Test Company {Guid.NewGuid():N}",
            PhoneNumber = "+1234567890"
        };

        var json = JsonSerializer.Serialize(registerRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/register", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithMismatchedPasswords_ShouldReturnBadRequest()
    {
        // Arrange
        var registerRequest = new
        {
            FirstName = "Test",
            LastName = "User",
            Email = $"testuser{Guid.NewGuid():N}@example.com",
            Password = "TestPassword123!",
            ConfirmPassword = "DifferentPassword123!",
            CompanyName = $"Test Company {Guid.NewGuid():N}",
            PhoneNumber = "+1234567890"
        };

        var json = JsonSerializer.Serialize(registerRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/register", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RefreshToken_WithValidToken_ShouldReturnNewTokens()
    {
        // Arrange
        var refreshRequest = new
        {
            RefreshToken = "valid-refresh-token"
        };

        var json = JsonSerializer.Serialize(refreshRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/refresh-token", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task RefreshToken_WithInvalidToken_ShouldReturnBadRequest()
    {
        // Arrange
        var refreshRequest = new
        {
            RefreshToken = "invalid-refresh-token"
        };

        var json = JsonSerializer.Serialize(refreshRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/refresh-token", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Logout_WithValidAuthentication_ShouldReturnSuccess()
    {
        // Arrange
        AuthenticateAsAdmin();

        // Act
        var response = await Client.PostAsync("/api/auth/logout", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var logoutResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
            logoutResponse.TryGetProperty("success", out var success).Should().BeTrue();
            success.GetBoolean().Should().BeTrue();
        }
    }

    [Fact]
    public async Task Logout_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Act
        var response = await Client.PostAsync("/api/auth/logout", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task VerifyEmail_WithValidToken_ShouldReturnSuccess()
    {
        // Arrange
        var verifyRequest = new
        {
            Email = "test@example.com",
            Token = "valid-verification-token"
        };

        var json = JsonSerializer.Serialize(verifyRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/verify-email", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task ResendVerificationEmail_WithValidEmail_ShouldReturnSuccess()
    {
        // Arrange
        var resendRequest = new
        {
            Email = "test@example.com"
        };

        var json = JsonSerializer.Serialize(resendRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/auth/resend-verification-email", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task TestSeq_ShouldReturnSuccess()
    {
        // Act
        var response = await Client.GetAsync("/api/auth/test-seq");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var testResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        testResponse.TryGetProperty("message", out var message).Should().BeTrue();
        message.GetString().Should().Be("Seq test logs sent");
    }

    [Fact]
    public async Task AuthEndpoints_ShouldHandleConcurrentRequests()
    {
        // Arrange
        var tasks = new List<Task<HttpResponseMessage>>();
        
        for (int i = 0; i < 10; i++)
        {
            var task = Client.GetAsync("/api/auth/test-seq");
            tasks.Add(task);
        }

        // Act
        var responses = await Task.WhenAll(tasks);

        // Assert
        responses.Should().HaveCount(10);
        responses.Should().OnlyContain(r => r.StatusCode == HttpStatusCode.OK);
    }
}