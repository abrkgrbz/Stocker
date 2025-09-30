using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.Features.Identity.Commands.Logout;
using Stocker.SharedKernel.Results;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity;

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
    public async Task Handle_ShouldReturnSuccess()
    {
        // Arrange
        var command = new LogoutCommand
        {
            UserId = Guid.NewGuid().ToString()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ShouldLogInformation()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var command = new LogoutCommand
        {
            UserId = userId
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("logged out")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithCancellationToken_ShouldComplete()
    {
        // Arrange
        var command = new LogoutCommand
        {
            UserId = Guid.NewGuid().ToString()
        };
        var cts = new CancellationTokenSource();

        // Act
        var result = await _handler.Handle(command, cts.Token);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_MultipleCallsWithSameUser_ShouldAllSucceed()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var command = new LogoutCommand { UserId = userId };

        // Act
        var result1 = await _handler.Handle(command, CancellationToken.None);
        var result2 = await _handler.Handle(command, CancellationToken.None);
        var result3 = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
        result3.IsSuccess.Should().BeTrue();
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("logged out")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Exactly(3));
    }

    [Fact]
    public async Task Handle_WithDifferentUsers_ShouldLogEachUser()
    {
        // Arrange
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();
        var command1 = new LogoutCommand { UserId = userId1.ToString() };
        var command2 = new LogoutCommand { UserId = userId2.ToString() };

        // Act
        await _handler.Handle(command1, CancellationToken.None);
        await _handler.Handle(command2, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains($"User {userId1} logged out")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains($"User {userId2} logged out")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}