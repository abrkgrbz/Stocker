using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Features.Identity.Commands.RefreshToken;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity;

public class RefreshTokenCommandHandlerTests
{
    private readonly Mock<ILogger<RefreshTokenCommandHandler>> _loggerMock;
    private readonly Mock<IAuthenticationService> _authenticationServiceMock;
    private readonly RefreshTokenCommandHandler _handler;

    public RefreshTokenCommandHandlerTests()
    {
        _loggerMock = new Mock<ILogger<RefreshTokenCommandHandler>>();
        _authenticationServiceMock = new Mock<IAuthenticationService>();
        _handler = new RefreshTokenCommandHandler(_loggerMock.Object, _authenticationServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidRefreshToken_ShouldReturnNewTokens()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = "valid-refresh-token"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "new-access-token",
            RefreshToken = "new-refresh-token",
            User = new UserInfo 
            { 
                Email = "user@example.com",
                FullName = "Test User"
            }
        };

        _authenticationServiceMock
            .Setup(x => x.RefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
        result.Value.AccessToken.Should().Be("new-access-token");
        result.Value.RefreshToken.Should().Be("new-refresh-token");
        
        _authenticationServiceMock.Verify(
            x => x.RefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidRefreshToken_ShouldReturnFailure()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = "invalid-refresh-token"
        };

        var error = Error.Validation("Auth.InvalidToken", "Invalid or expired refresh token");
        _authenticationServiceMock
            .Setup(x => x.RefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(error));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(error);
        result.Error.Code.Should().Be("Auth.InvalidToken");
    }

    [Fact]
    public async Task Handle_WithEmptyRefreshToken_ShouldReturnValidationError()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = ""
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidToken");
        result.Error.Description.Should().Be("Refresh token is required");
        
        _authenticationServiceMock.Verify(
            x => x.RefreshTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), 
            Times.Never);
    }

    [Fact]
    public async Task Handle_WithNullRefreshToken_ShouldReturnValidationError()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = null
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidToken");
        result.Error.Description.Should().Be("Refresh token is required");
        
        _authenticationServiceMock.Verify(
            x => x.RefreshTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), 
            Times.Never);
    }

    [Fact]
    public async Task Handle_WhenAuthenticationServiceThrowsException_ShouldReturnFailure()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = "valid-token"
        };

        _authenticationServiceMock
            .Setup(x => x.RefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.RefreshError");
        result.Error.Description.Should().Be("An error occurred during token refresh");
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Error during token refresh")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithSuccessfulRefresh_ShouldLogInformation()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = "valid-token"
        };

        var expectedResponse = new AuthResponse
        {
            AccessToken = "new-token",
            RefreshToken = "new-refresh",
            User = new UserInfo { Email = "user@example.com" }
        };

        _authenticationServiceMock
            .Setup(x => x.RefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(expectedResponse));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Refresh token attempt")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Token refreshed successfully")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithFailedRefresh_ShouldLogWarning()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = "expired-token"
        };

        _authenticationServiceMock
            .Setup(x => x.RefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(Error.Validation("Auth.ExpiredToken", "Token expired")));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Failed to refresh token")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithCancellation_ShouldPassCancellationToken()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = "valid-token"
        };

        var cts = new CancellationTokenSource();
        var cancellationToken = cts.Token;

        _authenticationServiceMock
            .Setup(x => x.RefreshTokenAsync(command.RefreshToken, cancellationToken))
            .ReturnsAsync(Result.Success(new AuthResponse()));

        // Act
        await _handler.Handle(command, cancellationToken);

        // Assert
        _authenticationServiceMock.Verify(
            x => x.RefreshTokenAsync(command.RefreshToken, cancellationToken), 
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithExpiredToken_ShouldReturnSpecificError()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = "expired-refresh-token"
        };

        var error = Error.Validation("Auth.TokenExpired", "Refresh token has expired");
        _authenticationServiceMock
            .Setup(x => x.RefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(error));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.TokenExpired");
        result.Error.Description.Should().Be("Refresh token has expired");
    }

    [Fact]
    public async Task Handle_WithRevokedToken_ShouldReturnSpecificError()
    {
        // Arrange
        var command = new RefreshTokenCommand
        {
            RefreshToken = "revoked-refresh-token"
        };

        var error = Error.Validation("Auth.TokenRevoked", "Refresh token has been revoked");
        _authenticationServiceMock
            .Setup(x => x.RefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<AuthResponse>(error));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.TokenRevoked");
        result.Error.Description.Should().Be("Refresh token has been revoked");
    }
}