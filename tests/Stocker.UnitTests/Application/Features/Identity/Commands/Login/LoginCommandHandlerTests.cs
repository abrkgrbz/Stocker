using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;
using System.Security.Claims;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity.Commands.Login;

public class LoginCommandHandlerTests
{
    private readonly Mock<ILogger<LoginCommandHandler>> _loggerMock;
    private readonly Mock<IAuthenticationService> _authenticationServiceMock;
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _loggerMock = new Mock<ILogger<LoginCommandHandler>>();
        _authenticationServiceMock = new Mock<IAuthenticationService>();
        _handler = new LoginCommandHandler(
            _loggerMock.Object,
            _authenticationServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCredentials_ShouldReturnSuccessWithToken()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "access-token-123",
            RefreshToken = "refresh-token-456",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            TokenType = "Bearer",
            User = new UserInfo
            {
                Id = Guid.NewGuid(),
                Email = command.Email,
                Username = "testuser",
                FullName = "Test User",
                Roles = new List<string> { "User" },
                TenantId = Guid.NewGuid(),
                TenantName = "Test Company"
            }
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.AccessToken.Should().Be("access-token-123");
        result.Value.RefreshToken.Should().Be("refresh-token-456");
        result.Value.TokenType.Should().Be("Bearer");
        result.Value.User.Email.Should().Be(command.Email);
        result.Value.User.FullName.Should().Be("Test User");

        _authenticationServiceMock.Verify(
            x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()),
            Times.Once);
        
        _authenticationServiceMock.Verify(
            x => x.AuthenticateMasterUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WithInvalidPassword_ShouldReturnFailure()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "WrongPassword"
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(
                Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password")));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidCredentials");
        result.Error.Description.Should().Be("Invalid email or password");

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Failed login attempt for email: {command.Email}")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Theory]
    [InlineData("admin@stoocker.app")]
    [InlineData("superadmin@admin.stocker.app")]
    [InlineData("master@stoocker.app")]
    public async Task Handle_WithMasterAdminEmail_ShouldUseMasterAuthentication(string masterEmail)
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = masterEmail,
            Password = "MasterPassword123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "master-token-123",
            RefreshToken = "master-refresh-456",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            TokenType = "Bearer",
            User = new UserInfo
            {
                Id = Guid.NewGuid(),
                Email = command.Email,
                Username = "masteradmin",
                FullName = "Master Admin",
                Roles = new List<string> { "MasterAdmin" }
            }
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateMasterUserAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.AccessToken.Should().Be("master-token-123");
        result.Value.User.Roles.Should().Contain("MasterAdmin");

        _authenticationServiceMock.Verify(
            x => x.AuthenticateMasterUserAsync(command.Email, command.Password, It.IsAny<CancellationToken>()),
            Times.Once);
        
        _authenticationServiceMock.Verify(
            x => x.AuthenticateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WithNonExistentEmail_ShouldReturnFailure()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "nonexistent@example.com",
            Password = "Password123!"
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(
                Error.NotFound("Auth.UserNotFound", "User not found")));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.UserNotFound");
        result.Error.Description.Should().Be("User not found");
    }

    [Fact]
    public async Task Handle_WithLockedAccount_ShouldReturnFailure()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "locked@example.com",
            Password = "Password123!"
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(
                Error.Forbidden("Auth.AccountLocked", "Account has been locked due to multiple failed login attempts")));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.AccountLocked");
        result.Error.Description.Should().Contain("locked");
    }

    [Fact]
    public async Task Handle_WithInactiveAccount_ShouldReturnFailure()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "inactive@example.com",
            Password = "Password123!"
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(
                Error.Forbidden("Auth.AccountInactive", "Account is inactive. Please contact support")));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.AccountInactive");
        result.Error.Description.Should().Contain("inactive");
    }

    [Fact]
    public async Task Handle_WhenExceptionOccurs_ShouldReturnFailureAndLogError()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "Password123!"
        };

        var exception = new Exception("Database connection failed");
        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ThrowsAsync(exception);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.LoginError");
        result.Error.Description.Should().Be("An error occurred during login");

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Error during login for email: {command.Email}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_SuccessfulLogin_ShouldLogInformation()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "token-123",
            RefreshToken = "refresh-456",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserInfo
            {
                Id = Guid.NewGuid(),
                Email = command.Email,
                Username = "testuser"
            }
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Login attempt for email: {command.Email}")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"User {command.Email} logged in successfully")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_MasterAdminSuccessfulLogin_ShouldLogMasterAdminLogin()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "admin@stoocker.app",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "master-token-123",
            RefreshToken = "master-refresh-456",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserInfo
            {
                Id = Guid.NewGuid(),
                Email = command.Email,
                Roles = new List<string> { "MasterAdmin" }
            }
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateMasterUserAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Master admin {command.Email} logged in successfully")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithNullTenantId_ShouldStillReturnSuccess()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "access-token-123",
            RefreshToken = "refresh-token-456",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            TokenType = "Bearer",
            User = new UserInfo
            {
                Id = Guid.NewGuid(),
                Email = command.Email,
                Username = "testuser",
                FullName = "Test User",
                Roles = new List<string> { "User" },
                TenantId = null, // No tenant assigned
                TenantName = null
            }
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.User.TenantId.Should().BeNull();
        result.Value.User.TenantName.Should().BeNull();
    }
}