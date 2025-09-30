using Microsoft.Extensions.Logging;
using Moq;
using System;

namespace Stocker.UnitTests.Common.TestHelpers;

public static class MockFactory
{
    public static Mock<ILogger<T>> CreateLogger<T>()
    {
        var logger = new Mock<ILogger<T>>();

        // Capture logged messages for verification
        logger.Setup(x => x.Log(
            It.IsAny<LogLevel>(),
            It.IsAny<EventId>(),
            It.IsAny<It.IsAnyType>(),
            It.IsAny<Exception>(),
            It.IsAny<Func<It.IsAnyType, Exception?, string>>()))
            .Callback((LogLevel level, EventId eventId, object state, Exception exception, Delegate formatter) =>
            {
                // Can be used to verify logging behavior in tests
            });

        return logger;
    }

    public static Mock<T> CreateMock<T>() where T : class
    {
        return new Mock<T>(MockBehavior.Strict);
    }

    public static Mock<T> CreateLooseMock<T>() where T : class
    {
        return new Mock<T>(MockBehavior.Loose);
    }
}