namespace Stocker.Application.Common.Interfaces;

public interface IDateTime
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
    DateTimeOffset NowOffset { get; }
    DateTimeOffset UtcNowOffset { get; }
    DateOnly Today { get; }
    TimeOnly TimeOfDay { get; }
}