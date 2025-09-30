using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity;

public class LoginCommandHandlerTests
{
    private readonly Mock<ILogger<LoginCommandHandler>> _loggerMock;
    private readonly Mock<IAuthenticationService> _authenticationServiceMock;
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _loggerMock = new Mock<ILogger<LoginCommandHandler>>();
        _authenticationServiceMock = new Mock<IAuthenticationService>();
        _handler = new LoginCommandHandler(_loggerMock.Object, _authenticationServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCredentials_ShouldReturnSuccess()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "ValidPassword123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "valid-token",
            RefreshToken = "refresh-token",
            User = new UserInfo { Email = command.Email }
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
        _authenticationServiceMock.Verify(
            x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidCredentials_ShouldReturnFailure()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "WrongPassword"
        };

        var error = Error.Validation("Auth.InvalidCredentials", "Invalid email or password");
        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(error));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(error);
    }

    [Theory]
    [InlineData("admin@stoocker.app")]
    [InlineData("superuser@admin.stocker.app")]
    [InlineData("master@STOOCKER.APP")]
    public async Task Handle_WithMasterAdminEmail_ShouldUseMasterAuthentication(string email)
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = email,
            Password = "MasterPassword123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "master-token",
            RefreshToken = "master-refresh-token",
            User = new UserInfo { Email = command.Email }
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateMasterUserAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
        _authenticationServiceMock.Verify(
            x => x.AuthenticateMasterUserAsync(command.Email, command.Password, It.IsAny<CancellationToken>()), 
            Times.Once);
        _authenticationServiceMock.Verify(
            x => x.AuthenticateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), 
            Times.Never);
    }

    [Fact]
    public async Task Handle_WhenAuthenticationServiceThrowsException_ShouldReturnFailure()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "Password123!"
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database connection failed"));

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
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Error during login")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithSuccessfulLogin_ShouldLogInformation()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "token",
            RefreshToken = "refresh",
            User = new UserInfo { Email = command.Email }
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
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Login attempt")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("logged in successfully")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithFailedLogin_ShouldLogWarning()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "WrongPassword"
        };

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(Error.Validation("Auth.Invalid", "Invalid credentials")));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Failed login attempt")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithCancellation_ShouldPassCancellationToken()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "user@example.com",
            Password = "Password123!"
        };

        var cts = new CancellationTokenSource();
        var cancellationToken = cts.Token;

        _authenticationServiceMock
            .Setup(x => x.AuthenticateAsync(command.Email, command.Password, cancellationToken))
            .ReturnsAsync(Result.Success(new AuthResponse()));

        // Act
        await _handler.Handle(command, cancellationToken);

        // Assert
        _authenticationServiceMock.Verify(
            x => x.AuthenticateAsync(command.Email, command.Password, cancellationToken), 
            Times.Once);
    }
}