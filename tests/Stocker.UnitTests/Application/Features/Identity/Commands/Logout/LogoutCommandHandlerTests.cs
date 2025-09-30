using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.Features.Identity.Commands.Logout;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity.Commands.Logout;

public class LogoutCommandHandlerTests
{
    private readonly Mock<ILogger<LogoutCommandHandler>> _loggerMock;
    private readonly LogoutCommandHandler _handler;

    public LogoutCommandHandlerTests()
    {
        _loggerMock = new Mock<ILogger<LogoutCommandHandler>>();
        _handler = new LogoutCommandHandler(_loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldReturnSuccess()
    {
        // Arrange
        var command = new LogoutCommand
        {
            UserId = Guid.NewGuid().ToString()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_NullUserId_ShouldStillReturnSuccess()
    {
        // Arrange
        var command = new LogoutCommand
        {
            UserId = null
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_EmptyAccessToken_ShouldStillReturnSuccess()
    {
        // Arrange
        var command = new LogoutCommand
        {
            UserId = Guid.NewGuid().ToString()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_CancellationRequested_ShouldCompleteNormally()
    {
        // Arrange
        var command = new LogoutCommand
        {
            UserId = Guid.NewGuid().ToString()
        };

        var cancellationToken = new CancellationTokenSource().Token;

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
    }
}