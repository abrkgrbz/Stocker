using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Holiday Event Handlers

public class HolidayCreatedEventHandler : INotificationHandler<HolidayCreatedDomainEvent>
{
    private readonly ILogger<HolidayCreatedEventHandler> _logger;

    public HolidayCreatedEventHandler(ILogger<HolidayCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(HolidayCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Holiday created: {Name}, Date: {Date:d}, Recurring: {IsRecurring}",
            notification.Name,
            notification.Date,
            notification.IsRecurring);

        return Task.CompletedTask;
    }
}

public class HolidayUpdatedEventHandler : INotificationHandler<HolidayUpdatedDomainEvent>
{
    private readonly ILogger<HolidayUpdatedEventHandler> _logger;

    public HolidayUpdatedEventHandler(ILogger<HolidayUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(HolidayUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Holiday updated: {Name}, Date: {Date:d}",
            notification.Name,
            notification.Date);

        return Task.CompletedTask;
    }
}

public class HolidayDeletedEventHandler : INotificationHandler<HolidayDeletedDomainEvent>
{
    private readonly ILogger<HolidayDeletedEventHandler> _logger;

    public HolidayDeletedEventHandler(ILogger<HolidayDeletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(HolidayDeletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Holiday deleted: {Name}, Date: {Date:d}",
            notification.Name,
            notification.Date);

        return Task.CompletedTask;
    }
}

public class HolidaysImportedEventHandler : INotificationHandler<HolidaysImportedDomainEvent>
{
    private readonly ILogger<HolidaysImportedEventHandler> _logger;

    public HolidaysImportedEventHandler(ILogger<HolidaysImportedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(HolidaysImportedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Holidays imported: Year {Year}, Count: {HolidayCount}",
            notification.Year,
            notification.HolidayCount);

        return Task.CompletedTask;
    }
}

#endregion
