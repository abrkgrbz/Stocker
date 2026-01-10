using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;
using Stocker.Modules.HR.Domain.Services;

namespace Stocker.Modules.HR.Application.EventHandlers;

/// <summary>
/// Handler for leave request created events - sends notification to manager
/// </summary>
public sealed class LeaveRequestCreatedEventHandler : INotificationHandler<LeaveRequestCreatedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<LeaveRequestCreatedEventHandler> _logger;

    public LeaveRequestCreatedEventHandler(
        IHrNotificationService notificationService,
        ILogger<LeaveRequestCreatedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeaveRequestCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave request created: {LeaveId} - {EmployeeName}, Type: {LeaveTypeName}, {StartDate:d} - {EndDate:d} ({TotalDays} days)",
            notification.LeaveId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.StartDate,
            notification.EndDate,
            notification.TotalDays);

        await _notificationService.SendLeaveRequestSubmittedAsync(
            notification.TenantId,
            notification.LeaveId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.StartDate,
            notification.EndDate,
            notification.TotalDays,
            notification.ManagerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for leave request approved events - sends notification to employee
/// </summary>
public sealed class LeaveRequestApprovedEventHandler : INotificationHandler<LeaveRequestApprovedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<LeaveRequestApprovedEventHandler> _logger;

    public LeaveRequestApprovedEventHandler(
        IHrNotificationService notificationService,
        ILogger<LeaveRequestApprovedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeaveRequestApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "✅ Leave request approved: {LeaveId} - {EmployeeName}, Type: {LeaveTypeName}, Approved by: {ApprovedByName}",
            notification.LeaveId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.ApprovedByName);

        await _notificationService.SendLeaveRequestApprovedAsync(
            notification.TenantId,
            notification.LeaveId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.StartDate,
            notification.EndDate,
            cancellationToken);
    }
}

/// <summary>
/// Handler for leave request rejected events - sends notification to employee
/// </summary>
public sealed class LeaveRequestRejectedEventHandler : INotificationHandler<LeaveRequestRejectedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<LeaveRequestRejectedEventHandler> _logger;

    public LeaveRequestRejectedEventHandler(
        IHrNotificationService notificationService,
        ILogger<LeaveRequestRejectedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeaveRequestRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "❌ Leave request rejected: {LeaveId} - {EmployeeName}, Type: {LeaveTypeName}, Reason: {RejectionReason}",
            notification.LeaveId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.RejectionReason);

        await _notificationService.SendLeaveRequestRejectedAsync(
            notification.TenantId,
            notification.LeaveId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.RejectionReason,
            cancellationToken);
    }
}

/// <summary>
/// Handler for leave request cancelled events
/// </summary>
public sealed class LeaveRequestCancelledEventHandler : INotificationHandler<LeaveRequestCancelledDomainEvent>
{
    private readonly ILogger<LeaveRequestCancelledEventHandler> _logger;

    public LeaveRequestCancelledEventHandler(ILogger<LeaveRequestCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveRequestCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave request cancelled: {LeaveId} - {EmployeeName}, Type: {LeaveTypeName}",
            notification.LeaveId,
            notification.EmployeeName,
            notification.LeaveTypeName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for leave balance low events - sends notification to employee
/// </summary>
public sealed class LeaveBalanceLowEventHandler : INotificationHandler<LeaveBalanceLowDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<LeaveBalanceLowEventHandler> _logger;

    public LeaveBalanceLowEventHandler(
        IHrNotificationService notificationService,
        ILogger<LeaveBalanceLowEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeaveBalanceLowDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⚠️ Leave balance low: {EmployeeId} - {EmployeeName}, Type: {LeaveTypeName}, Remaining: {RemainingDays} days (threshold: {ThresholdDays})",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.RemainingDays,
            notification.ThresholdDays);

        await _notificationService.SendLeaveBalanceLowAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.RemainingDays,
            cancellationToken);
    }
}

/// <summary>
/// Handler for leave balance expiring events - sends notification to employee
/// </summary>
public sealed class LeaveBalanceExpiringEventHandler : INotificationHandler<LeaveBalanceExpiringDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<LeaveBalanceExpiringEventHandler> _logger;

    public LeaveBalanceExpiringEventHandler(
        IHrNotificationService notificationService,
        ILogger<LeaveBalanceExpiringEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeaveBalanceExpiringDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⏰ Leave balance expiring: {EmployeeId} - {EmployeeName}, Type: {LeaveTypeName}, {ExpiringDays} days expiring on {ExpiryDate:d}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.ExpiringDays,
            notification.ExpiryDate);

        await _notificationService.SendLeaveBalanceExpiringAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.ExpiringDays,
            notification.ExpiryDate,
            cancellationToken);
    }
}
