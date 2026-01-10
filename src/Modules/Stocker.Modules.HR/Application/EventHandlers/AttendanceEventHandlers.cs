using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;
using Stocker.Modules.HR.Domain.Services;

namespace Stocker.Modules.HR.Application.EventHandlers;

/// <summary>
/// Handler for employee checked in events
/// </summary>
public sealed class EmployeeCheckedInEventHandler : INotificationHandler<EmployeeCheckedInDomainEvent>
{
    private readonly ILogger<EmployeeCheckedInEventHandler> _logger;

    public EmployeeCheckedInEventHandler(ILogger<EmployeeCheckedInEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeCheckedInDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee checked in: {EmployeeId} - {EmployeeName} at {CheckInTime:t}, Location: {Location}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.CheckInTime,
            notification.Location ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee checked out events
/// </summary>
public sealed class EmployeeCheckedOutEventHandler : INotificationHandler<EmployeeCheckedOutDomainEvent>
{
    private readonly ILogger<EmployeeCheckedOutEventHandler> _logger;

    public EmployeeCheckedOutEventHandler(ILogger<EmployeeCheckedOutEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeCheckedOutDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee checked out: {EmployeeId} - {EmployeeName} at {CheckOutTime:t}, Total hours: {TotalHours}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.CheckOutTime,
            notification.TotalHours);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee late arrival events - sends notification to manager
/// </summary>
public sealed class EmployeeLateArrivalEventHandler : INotificationHandler<EmployeeLateArrivalDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<EmployeeLateArrivalEventHandler> _logger;

    public EmployeeLateArrivalEventHandler(
        IHrNotificationService notificationService,
        ILogger<EmployeeLateArrivalEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(EmployeeLateArrivalDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⏰ Employee late arrival: {EmployeeId} - {EmployeeName}, Expected: {ExpectedTime:t}, Actual: {ActualTime:t}, Late by: {LateBy}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ExpectedTime,
            notification.ActualTime,
            notification.LateBy);

        await _notificationService.SendLateArrivalAlertAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ExpectedTime,
            notification.ActualTime,
            notification.LateBy,
            notification.ManagerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for employee absent events - sends notification to manager
/// </summary>
public sealed class EmployeeAbsentEventHandler : INotificationHandler<EmployeeAbsentDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<EmployeeAbsentEventHandler> _logger;

    public EmployeeAbsentEventHandler(
        IHrNotificationService notificationService,
        ILogger<EmployeeAbsentEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(EmployeeAbsentDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "🚨 Employee absent: {EmployeeId} - {EmployeeName} on {Date:d}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.Date);

        await _notificationService.SendAbsenceAlertAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.Date,
            notification.ManagerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for overtime detected events - sends notification to manager
/// </summary>
public sealed class OvertimeDetectedEventHandler : INotificationHandler<OvertimeDetectedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<OvertimeDetectedEventHandler> _logger;

    public OvertimeDetectedEventHandler(
        IHrNotificationService notificationService,
        ILogger<OvertimeDetectedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(OvertimeDetectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "⏱️ Overtime detected: {EmployeeId} - {EmployeeName} on {Date:d}, Overtime: {OvertimeHours}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.Date,
            notification.OvertimeHours);

        await _notificationService.SendOvertimeAlertAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.Date,
            notification.OvertimeHours,
            notification.ManagerId,
            cancellationToken);
    }
}
