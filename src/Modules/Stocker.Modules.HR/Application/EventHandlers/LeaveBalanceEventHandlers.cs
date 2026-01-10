using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region LeaveBalance Event Handlers

public class LeaveBalanceAllocatedEventHandler : INotificationHandler<LeaveBalanceAllocatedDomainEvent>
{
    private readonly ILogger<LeaveBalanceAllocatedEventHandler> _logger;

    public LeaveBalanceAllocatedEventHandler(ILogger<LeaveBalanceAllocatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveBalanceAllocatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave balance allocated: {EmployeeName} - {LeaveTypeName}, Days: {AllocatedDays}, Year: {Year}",
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.AllocatedDays,
            notification.Year);

        return Task.CompletedTask;
    }
}

public class LeaveBalanceAdjustedEventHandler : INotificationHandler<LeaveBalanceAdjustedDomainEvent>
{
    private readonly ILogger<LeaveBalanceAdjustedEventHandler> _logger;

    public LeaveBalanceAdjustedEventHandler(ILogger<LeaveBalanceAdjustedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveBalanceAdjustedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave balance adjusted: {EmployeeName} - {LeaveTypeName}, {OldBalance} → {NewBalance}, Reason: {AdjustmentReason}",
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.OldBalance,
            notification.NewBalance,
            notification.AdjustmentReason);

        return Task.CompletedTask;
    }
}

public class LeaveBalanceUsedEventHandler : INotificationHandler<LeaveBalanceUsedDomainEvent>
{
    private readonly ILogger<LeaveBalanceUsedEventHandler> _logger;

    public LeaveBalanceUsedEventHandler(ILogger<LeaveBalanceUsedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveBalanceUsedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave balance used: {EmployeeName} - {LeaveTypeName}, Used: {DaysUsed}, Remaining: {RemainingBalance}",
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.DaysUsed,
            notification.RemainingBalance);

        return Task.CompletedTask;
    }
}

public class LeaveBalanceCarriedForwardEventHandler : INotificationHandler<LeaveBalanceCarriedForwardDomainEvent>
{
    private readonly ILogger<LeaveBalanceCarriedForwardEventHandler> _logger;

    public LeaveBalanceCarriedForwardEventHandler(ILogger<LeaveBalanceCarriedForwardEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveBalanceCarriedForwardDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave balance carried forward: {EmployeeName} - {LeaveTypeName}, Days: {CarriedForwardDays}, {FromYear} → {ToYear}",
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.CarriedForwardDays,
            notification.FromYear,
            notification.ToYear);

        return Task.CompletedTask;
    }
}

public class LeaveBalanceExpiredEventHandler : INotificationHandler<LeaveBalanceExpiredDomainEvent>
{
    private readonly ILogger<LeaveBalanceExpiredEventHandler> _logger;

    public LeaveBalanceExpiredEventHandler(ILogger<LeaveBalanceExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveBalanceExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Leave balance expired: {EmployeeName} - {LeaveTypeName}, Expired: {ExpiredDays} days",
            notification.EmployeeName,
            notification.LeaveTypeName,
            notification.ExpiredDays);

        return Task.CompletedTask;
    }
}

#endregion
