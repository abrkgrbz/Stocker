using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region TimeSheet Event Handlers

public class TimeSheetSubmittedEventHandler : INotificationHandler<TimeSheetSubmittedDomainEvent>
{
    private readonly ILogger<TimeSheetSubmittedEventHandler> _logger;

    public TimeSheetSubmittedEventHandler(ILogger<TimeSheetSubmittedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TimeSheetSubmittedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "TimeSheet submitted: {EmployeeName}, Hours: {TotalHours}",
            notification.EmployeeName,
            notification.TotalHours);

        return Task.CompletedTask;
    }
}

public class TimeSheetApprovedEventHandler : INotificationHandler<TimeSheetApprovedDomainEvent>
{
    private readonly ILogger<TimeSheetApprovedEventHandler> _logger;

    public TimeSheetApprovedEventHandler(ILogger<TimeSheetApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TimeSheetApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "TimeSheet approved: {EmployeeName}, Hours: {TotalHours}",
            notification.EmployeeName,
            notification.TotalHours);

        return Task.CompletedTask;
    }
}

public class TimeSheetRejectedEventHandler : INotificationHandler<TimeSheetRejectedDomainEvent>
{
    private readonly ILogger<TimeSheetRejectedEventHandler> _logger;

    public TimeSheetRejectedEventHandler(ILogger<TimeSheetRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TimeSheetRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "TimeSheet rejected: {EmployeeName}, Reason: {RejectionReason}",
            notification.EmployeeName,
            notification.RejectionReason);

        return Task.CompletedTask;
    }
}

#endregion
