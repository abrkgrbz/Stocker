using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;
using Stocker.Modules.HR.Domain.Services;

namespace Stocker.Modules.HR.Application.EventHandlers;

/// <summary>
/// Handler for training program created events
/// </summary>
public sealed class TrainingProgramCreatedEventHandler : INotificationHandler<TrainingProgramCreatedDomainEvent>
{
    private readonly ILogger<TrainingProgramCreatedEventHandler> _logger;

    public TrainingProgramCreatedEventHandler(ILogger<TrainingProgramCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TrainingProgramCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Training program created: {TrainingId} - {TrainingName}, Type: {TrainingType}, {StartDate:d} - {EndDate:d}",
            notification.TrainingId,
            notification.TrainingName,
            notification.TrainingType,
            notification.StartDate,
            notification.EndDate);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for employee enrolled in training events - sends notification to employee
/// </summary>
public sealed class EmployeeEnrolledInTrainingEventHandler : INotificationHandler<EmployeeEnrolledInTrainingDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<EmployeeEnrolledInTrainingEventHandler> _logger;

    public EmployeeEnrolledInTrainingEventHandler(
        IHrNotificationService notificationService,
        ILogger<EmployeeEnrolledInTrainingEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(EmployeeEnrolledInTrainingDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee enrolled in training: {EmployeeId} - {EmployeeName}, Training: {TrainingName}, Start: {StartDate:d}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.TrainingName,
            notification.StartDate);

        await _notificationService.SendTrainingEnrollmentAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.TrainingName,
            notification.StartDate,
            cancellationToken);
    }
}

/// <summary>
/// Handler for training completed events
/// </summary>
public sealed class TrainingCompletedEventHandler : INotificationHandler<TrainingCompletedDomainEvent>
{
    private readonly ILogger<TrainingCompletedEventHandler> _logger;

    public TrainingCompletedEventHandler(ILogger<TrainingCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TrainingCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        if (notification.Passed)
        {
            _logger.LogInformation(
                "✅ Training completed: {EmployeeId} - {EmployeeName}, Training: {TrainingName}, Score: {Score}",
                notification.EmployeeId,
                notification.EmployeeName,
                notification.TrainingName,
                notification.Score);
        }
        else
        {
            _logger.LogWarning(
                "❌ Training failed: {EmployeeId} - {EmployeeName}, Training: {TrainingName}, Score: {Score}",
                notification.EmployeeId,
                notification.EmployeeName,
                notification.TrainingName,
                notification.Score);
        }

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for training cancelled events
/// </summary>
public sealed class TrainingCancelledEventHandler : INotificationHandler<TrainingCancelledDomainEvent>
{
    private readonly ILogger<TrainingCancelledEventHandler> _logger;

    public TrainingCancelledEventHandler(ILogger<TrainingCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TrainingCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Training cancelled: {TrainingId} - {TrainingName}, Affected participants: {AffectedParticipants}, Reason: {CancellationReason}",
            notification.TrainingId,
            notification.TrainingName,
            notification.AffectedParticipants,
            notification.CancellationReason ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for training deadline approaching events - sends notification to employee
/// </summary>
public sealed class TrainingDeadlineApproachingEventHandler : INotificationHandler<TrainingDeadlineApproachingDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<TrainingDeadlineApproachingEventHandler> _logger;

    public TrainingDeadlineApproachingEventHandler(
        IHrNotificationService notificationService,
        ILogger<TrainingDeadlineApproachingEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TrainingDeadlineApproachingDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⏰ Training deadline approaching: {EmployeeId} - {EmployeeName}, Training: {TrainingName}, Deadline: {Deadline:d} ({DaysRemaining} days)",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.TrainingName,
            notification.Deadline,
            notification.DaysRemaining);

        await _notificationService.SendTrainingDeadlineApproachingAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.TrainingName,
            notification.Deadline,
            notification.DaysRemaining,
            cancellationToken);
    }
}

/// <summary>
/// Handler for mandatory training overdue events - sends notification to manager
/// </summary>
public sealed class MandatoryTrainingOverdueEventHandler : INotificationHandler<MandatoryTrainingOverdueDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<MandatoryTrainingOverdueEventHandler> _logger;

    public MandatoryTrainingOverdueEventHandler(
        IHrNotificationService notificationService,
        ILogger<MandatoryTrainingOverdueEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(MandatoryTrainingOverdueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "🚨 Mandatory training overdue: {EmployeeId} - {EmployeeName}, Training: {TrainingName}, {DaysOverdue} days overdue",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.TrainingName,
            notification.DaysOverdue);

        await _notificationService.SendMandatoryTrainingOverdueAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.TrainingName,
            notification.DaysOverdue,
            notification.ManagerId,
            cancellationToken);
    }
}
