using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Infrastructure.Services;

public class DateTimeService : IDateTimeService, IDateTime
{
    public DateTime Now => DateTime.UtcNow;
    public DateTime UtcNow => DateTime.UtcNow;
    public DateTimeOffset NowOffset => DateTimeOffset.UtcNow;
    public DateTimeOffset UtcNowOffset => DateTimeOffset.UtcNow;
    public DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);
    public TimeOnly TimeOfDay => TimeOnly.FromDateTime(DateTime.UtcNow);
}