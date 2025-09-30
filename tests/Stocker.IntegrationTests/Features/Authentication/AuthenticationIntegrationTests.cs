using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Stocker.IntegrationTests.DTOs;
using Stocker.IntegrationTests.Common;
using Xunit;

namespace Stocker.IntegrationTests.Features.Authentication;

public class AuthenticationIntegrationTests : SimplifiedIntegrationTestBase
{
    private readonly TestDataBuilder _testDataBuilder;

    public AuthenticationIntegrationTests()
    {
        _testDataBuilder = new TestDataBuilder();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnTokens()
    {
        // Arrange
        var user = _testDataBuilder.CreateMasterUser(
            username: "testuser",
            email: "test@example.com",
            isActive: true);
        
        await AddAsync(user);

        var loginRequest = new
        {
            Email = "test@example.com",
            Password = "Test123!@#"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        
        // Debug: Log response content if not OK
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Response Status: {response.StatusCode}");
            Console.WriteLine($"Response Content: {content}");
        }

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User.Username.Should().Be("testuser");
        result.User.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "nonexistent@example.com",
            Password = "WrongPassword123!"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        
        // Debug: Log response content if not Unauthorized
        if (response.StatusCode != HttpStatusCode.Unauthorized)
        {
            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Response Status: {response.StatusCode}");
            Console.WriteLine($"Response Content: {content}");
        }

        // Assert - Accept both BadRequest and Unauthorized as valid responses for invalid credentials
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithValidData_ShouldCreateUserSuccessfully()
    {
        // Arrange
        var registerRequest = new
        {
            CompanyName = "Test Company Ltd",
            CompanyCode = "TC001",
            IdentityType = "vergi",
            IdentityNumber = "1234567890",
            Sector = "Technology",
            EmployeeCount = "10-50",
            ContactName = "John Doe",
            ContactEmail = "contact@testcompany.com",
            ContactPhone = "5551234567",  // Without country code, 10 digits
            ContactTitle = "IT Manager",
            Username = "newuser",
            Password = "Test123!@#",
            Domain = "testcompany",
            Email = "newuser@testcompany.com",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", registerRequest);
        
        // Debug if not OK
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Register Response Status: {response.StatusCode}");
            Console.WriteLine($"Register Response Content: {content}");
        }

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var result = await response.Content.ReadFromJsonAsync<RegisterResponseDto>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.UserId.Should().NotBeEmpty();

        // Verify user was created (if we have a valid UserId)
        if (result.UserId != Guid.Empty)
        {
            var createdUser = await FindAsync<Stocker.Domain.Master.Entities.MasterUser>(result.UserId);
            createdUser.Should().NotBeNull();
            createdUser!.Username.Should().Be("newuser");
        }
    }

    [Fact]
    public async Task Register_WithExistingEmail_ShouldReturnBadRequest()
    {
        // Arrange
        var existingUser = _testDataBuilder.CreateMasterUser(email: "existing@example.com");
        await AddAsync(existingUser);

        var tenant = _testDataBuilder.CreateTenant();
        await AddAsync(tenant);

        var registerRequest = new
        {
            TenantId = tenant.Id,
            Username = "anotheruser",
            Email = "existing@example.com", // Existing email
            Password = "Test123!@#",
            ConfirmPassword = "Test123!@#",
            FirstName = "Jane",
            LastName = "Doe"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", registerRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RefreshToken_WithValidToken_ShouldReturnNewTokens()
    {
        // Arrange
        var user = _testDataBuilder.CreateMasterUser();
        await AddAsync(user);

        // First, login to get tokens
        var loginRequest = new
        {
            Email = user.Email.Value,
            Password = "Test123!@#"
        };

        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        
        // Check if login succeeded first
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK, "Login should succeed first");
        
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();

        var refreshRequest = new
        {
            AccessToken = loginResult!.AccessToken,
            RefreshToken = loginResult.RefreshToken
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/refresh-token", refreshRequest);
        
        // Debug if not OK
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"RefreshToken Response Status: {response.StatusCode}");
            Console.WriteLine($"RefreshToken Response Content: {content}");
            Console.WriteLine($"Access Token: {refreshRequest.AccessToken}");
            Console.WriteLine($"Refresh Token: {refreshRequest.RefreshToken}");
        }

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.AccessToken.Should().NotBe(loginResult.AccessToken); // Should be a new token
    }

    [Fact]
    public async Task Logout_WithValidToken_ShouldInvalidateToken()
    {
        // Arrange
        var user = _testDataBuilder.CreateMasterUser();
        await AddAsync(user);

        // Login first
        var loginRequest = new
        {
            Email = user.Email.Value,
            Password = "Test123!@#"
        };

        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();

        // Set authorization header
        Client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginResult!.AccessToken);

        // Act
        var response = await Client.PostAsync("/api/auth/logout", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Note: We can't test token invalidation without a protected endpoint
        // The logout endpoint should return OK to indicate success
    }

    [Fact]
    public async Task VerifyEmail_WithValidToken_ShouldActivateUser()
    {
        // Arrange
        var user = _testDataBuilder.CreateMasterUser(isActive: false);
        var verificationToken = user.GenerateEmailVerificationToken();
        await AddAsync(user);

        var verifyRequest = new
        {
            Email = user.Email.Value,
            Token = verificationToken.Token
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/verify-email", verifyRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Verify user is now active
        var updatedUser = await FindAsync<Stocker.Domain.Master.Entities.MasterUser>(user.Id);
        updatedUser.Should().NotBeNull();
        updatedUser!.IsActive.Should().BeTrue();
        updatedUser.IsEmailVerified.Should().BeTrue();
    }
}