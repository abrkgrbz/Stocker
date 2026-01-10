using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;
using Stocker.Modules.HR.Domain.Services;

namespace Stocker.Modules.HR.Application.EventHandlers;

/// <summary>
/// Handler for employee created events
/// </summary>
public sealed class EmployeeCreatedEventHandler : INotificationHandler<EmployeeCreatedDomainEvent>
{
    private readonly ILogger<EmployeeCreatedEventHandler> _logger;

    public EmployeeCreatedEventHandler(ILogger<EmployeeCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee created: {EmployeeId} - {EmployeeCode} - {FullName}, Department: {DepartmentName}, Position: {PositionName}",
            notification.EmployeeId,
            notification.EmployeeCode,
            notification.FullName,
            notification.DepartmentName,
            notification.PositionName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee updated events
/// </summary>
public sealed class EmployeeUpdatedEventHandler : INotificationHandler<EmployeeUpdatedDomainEvent>
{
    private readonly ILogger<EmployeeUpdatedEventHandler> _logger;

    public EmployeeUpdatedEventHandler(ILogger<EmployeeUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee updated: {EmployeeId} - {FullName}",
            notification.EmployeeId,
            notification.FullName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee department changed events
/// </summary>
public sealed class EmployeeDepartmentChangedEventHandler : INotificationHandler<EmployeeDepartmentChangedDomainEvent>
{
    private readonly ILogger<EmployeeDepartmentChangedEventHandler> _logger;

    public EmployeeDepartmentChangedEventHandler(ILogger<EmployeeDepartmentChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeDepartmentChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee department changed: {EmployeeId} - {EmployeeName}, {OldDepartmentName} → {NewDepartmentName}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.OldDepartmentName,
            notification.NewDepartmentName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee promoted events
/// </summary>
public sealed class EmployeePromotedEventHandler : INotificationHandler<EmployeePromotedDomainEvent>
{
    private readonly ILogger<EmployeePromotedEventHandler> _logger;

    public EmployeePromotedEventHandler(ILogger<EmployeePromotedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeePromotedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🎉 Employee promoted: {EmployeeId} - {EmployeeName}, {OldPositionName} → {NewPositionName}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.OldPositionName,
            notification.NewPositionName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee salary updated events
/// </summary>
public sealed class EmployeeSalaryUpdatedEventHandler : INotificationHandler<EmployeeSalaryUpdatedDomainEvent>
{
    private readonly ILogger<EmployeeSalaryUpdatedEventHandler> _logger;

    public EmployeeSalaryUpdatedEventHandler(ILogger<EmployeeSalaryUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeSalaryUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee salary updated: {EmployeeId} - {EmployeeName}, {OldSalary} → {NewSalary} {Currency}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.OldSalary,
            notification.NewSalary,
            notification.Currency);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee terminated events
/// </summary>
public sealed class EmployeeTerminatedEventHandler : INotificationHandler<EmployeeTerminatedDomainEvent>
{
    private readonly ILogger<EmployeeTerminatedEventHandler> _logger;

    public EmployeeTerminatedEventHandler(ILogger<EmployeeTerminatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeTerminatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Employee terminated: {EmployeeId} - {EmployeeName}, Date: {TerminationDate:d}, Reason: {Reason}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.TerminationDate,
            notification.Reason ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee resigned events
/// </summary>
public sealed class EmployeeResignedEventHandler : INotificationHandler<EmployeeResignedDomainEvent>
{
    private readonly ILogger<EmployeeResignedEventHandler> _logger;

    public EmployeeResignedEventHandler(ILogger<EmployeeResignedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeResignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee resigned: {EmployeeId} - {EmployeeName}, Date: {ResignationDate:d}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ResignationDate);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee probation completed events
/// </summary>
public sealed class EmployeeProbationCompletedEventHandler : INotificationHandler<EmployeeProbationCompletedDomainEvent>
{
    private readonly ILogger<EmployeeProbationCompletedEventHandler> _logger;

    public EmployeeProbationCompletedEventHandler(ILogger<EmployeeProbationCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeProbationCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        if (notification.IsSuccessful)
        {
            _logger.LogInformation(
                "✅ Employee probation completed successfully: {EmployeeId} - {EmployeeName}",
                notification.EmployeeId,
                notification.EmployeeName);
        }
        else
        {
            _logger.LogWarning(
                "❌ Employee probation failed: {EmployeeId} - {EmployeeName}",
                notification.EmployeeId,
                notification.EmployeeName);
        }

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee probation ending events - sends notification to manager
/// </summary>
public sealed class EmployeeProbationEndingEventHandler : INotificationHandler<EmployeeProbationEndingDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<EmployeeProbationEndingEventHandler> _logger;

    public EmployeeProbationEndingEventHandler(
        IHrNotificationService notificationService,
        ILogger<EmployeeProbationEndingEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(EmployeeProbationEndingDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⏰ Employee probation ending: {EmployeeId} - {EmployeeName}, End Date: {ProbationEndDate:d} ({DaysRemaining} days remaining)",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ProbationEndDate,
            notification.DaysRemaining);

        await _notificationService.SendProbationEndingAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ProbationEndDate,
            notification.DaysRemaining,
            notification.ManagerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for employee contract expiring events - sends notification to manager
/// </summary>
public sealed class EmployeeContractExpiringEventHandler : INotificationHandler<EmployeeContractExpiringDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<EmployeeContractExpiringEventHandler> _logger;

    public EmployeeContractExpiringEventHandler(
        IHrNotificationService notificationService,
        ILogger<EmployeeContractExpiringEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(EmployeeContractExpiringDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⏰ Employee contract expiring: {EmployeeId} - {EmployeeName}, End Date: {ContractEndDate:d} ({DaysRemaining} days remaining)",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ContractEndDate,
            notification.DaysRemaining);

        await _notificationService.SendContractExpiringAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ContractEndDate,
            notification.DaysRemaining,
            notification.ManagerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for employee work anniversary events
/// </summary>
public sealed class EmployeeWorkAnniversaryEventHandler : INotificationHandler<EmployeeWorkAnniversaryDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<EmployeeWorkAnniversaryEventHandler> _logger;

    public EmployeeWorkAnniversaryEventHandler(
        IHrNotificationService notificationService,
        ILogger<EmployeeWorkAnniversaryEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(EmployeeWorkAnniversaryDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🎂 Employee work anniversary: {EmployeeId} - {EmployeeName}, {YearsOfService} years on {AnniversaryDate:d}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.YearsOfService,
            notification.AnniversaryDate);

        await _notificationService.SendWorkAnniversaryAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.YearsOfService,
            notification.AnniversaryDate,
            cancellationToken);
    }
}

/// <summary>
/// Handler for employee birthday events
/// </summary>
public sealed class EmployeeBirthdayEventHandler : INotificationHandler<EmployeeBirthdayDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<EmployeeBirthdayEventHandler> _logger;

    public EmployeeBirthdayEventHandler(
        IHrNotificationService notificationService,
        ILogger<EmployeeBirthdayEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(EmployeeBirthdayDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🎉 Employee birthday: {EmployeeId} - {EmployeeName} on {BirthDate:d}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.BirthDate);

        await _notificationService.SendBirthdayReminderAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.BirthDate,
            cancellationToken);
    }
}
