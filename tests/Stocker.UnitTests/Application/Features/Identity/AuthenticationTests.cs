using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity;

/// <summary>
/// Simplified authentication tests focusing on handler logic
/// </summary>
public class AuthenticationTests  
{
    private readonly Mock<ILogger<LoginCommandHandler>> _loggerMock;
    private readonly Mock<IAuthenticationService> _authServiceMock;
    private readonly LoginCommandHandler _handler;

    public AuthenticationTests()
    {
        _loggerMock = new Mock<ILogger<LoginCommandHandler>>();
        _authServiceMock = new Mock<IAuthenticationService>();
        _handler = new LoginCommandHandler(_loggerMock.Object, _authServiceMock.Object);
    }

    [Fact]
    public async Task LoginHandler_ValidCredentials_ReturnsSuccess()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@company.com",
            Password = "ValidPassword123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "valid-jwt-token",
            RefreshToken = "refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserInfo
            {
                Id = Guid.NewGuid(),
                Email = command.Email,
                Username = "testuser",
                FullName = "Test User"
            }
        };

        _authServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.AccessToken.Should().Be("valid-jwt-token");
        result.Value.User.Email.Should().Be(command.Email);
    }

    [Fact]
    public async Task LoginHandler_InvalidCredentials_ReturnsFailure()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@company.com",
            Password = "WrongPassword"
        };

        var error = Error.Validation("Auth.InvalidCredentials", "Invalid email or password");
        
        _authServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(error));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Auth.InvalidCredentials");
    }

    [Theory]
    [InlineData("admin@stoocker.app")]
    [InlineData("master@admin.stocker.app")]
    public async Task LoginHandler_MasterAdminEmail_CallsMasterAuthentication(string masterEmail)
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = masterEmail,
            Password = "MasterPassword123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "master-jwt-token",
            RefreshToken = "master-refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(2),
            User = new UserInfo
            {
                Id = Guid.NewGuid(),
                Email = command.Email,
                Username = "master",
                FullName = "Master Admin",
                Roles = new System.Collections.Generic.List<string> { "MasterAdmin" }
            }
        };

        _authServiceMock
            .Setup(x => x.AuthenticateMasterUserAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.User.Roles.Should().Contain("MasterAdmin");
        
        _authServiceMock.Verify(x => x.AuthenticateMasterUserAsync(
            command.Email, 
            command.Password, 
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task LoginHandler_ServiceThrowsException_ReturnsFailure()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@company.com",
            Password = "Password123!"
        };

        _authServiceMock
            .Setup(x => x.AuthenticateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Auth.LoginError");
        result.Error.Description.Should().Be("An error occurred during login");
    }

    [Fact]
    public async Task LoginHandler_EmptyEmail_ReturnsFailure()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "",
            Password = "Password123!"
        };

        var error = Error.Validation("Auth.InvalidInput", "Email is required");
        
        _authServiceMock
            .Setup(x => x.AuthenticateAsync("", command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(error));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Auth.InvalidInput");
    }

    [Fact]
    public async Task LoginHandler_SuccessfulLogin_LogsInformation()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@company.com",
            Password = "Password123!"
        };

        var response = new AuthResponse
        {
            AccessToken = "token",
            RefreshToken = "refresh",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserInfo { Id = Guid.NewGuid(), Email = command.Email }
        };

        _authServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(response));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains("Login attempt")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task LoginHandler_FailedLogin_LogsWarning()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@company.com",
            Password = "WrongPassword"
        };

        _authServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(Error.Unauthorized("Auth.Failed", "Failed")));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains("Failed login attempt")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }
}