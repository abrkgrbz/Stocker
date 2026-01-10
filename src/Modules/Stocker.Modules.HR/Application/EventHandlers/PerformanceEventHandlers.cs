using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;
using Stocker.Modules.HR.Domain.Services;

namespace Stocker.Modules.HR.Application.EventHandlers;

/// <summary>
/// Handler for performance review created events
/// </summary>
public sealed class PerformanceReviewCreatedEventHandler : INotificationHandler<PerformanceReviewCreatedDomainEvent>
{
    private readonly ILogger<PerformanceReviewCreatedEventHandler> _logger;

    public PerformanceReviewCreatedEventHandler(ILogger<PerformanceReviewCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PerformanceReviewCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Performance review created: {ReviewId} - {EmployeeName}, Reviewer: {ReviewerName}, Period: {ReviewPeriod}",
            notification.ReviewId,
            notification.EmployeeName,
            notification.ReviewerName,
            notification.ReviewPeriod);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for performance review submitted events - sends notification to employee
/// </summary>
public sealed class PerformanceReviewSubmittedEventHandler : INotificationHandler<PerformanceReviewSubmittedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<PerformanceReviewSubmittedEventHandler> _logger;

    public PerformanceReviewSubmittedEventHandler(
        IHrNotificationService notificationService,
        ILogger<PerformanceReviewSubmittedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(PerformanceReviewSubmittedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Performance review submitted: {ReviewId} - {EmployeeName}, Reviewer: {ReviewerName}, Rating: {OverallRating}",
            notification.ReviewId,
            notification.EmployeeName,
            notification.ReviewerName,
            notification.OverallRating);

        await _notificationService.SendPerformanceReviewSubmittedAsync(
            notification.TenantId,
            notification.ReviewId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ReviewerName,
            notification.ReviewPeriod,
            cancellationToken);
    }
}

/// <summary>
/// Handler for performance review acknowledged events
/// </summary>
public sealed class PerformanceReviewAcknowledgedEventHandler : INotificationHandler<PerformanceReviewAcknowledgedDomainEvent>
{
    private readonly ILogger<PerformanceReviewAcknowledgedEventHandler> _logger;

    public PerformanceReviewAcknowledgedEventHandler(ILogger<PerformanceReviewAcknowledgedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PerformanceReviewAcknowledgedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Performance review acknowledged: {ReviewId} - {EmployeeName}, Rating: {OverallRating}",
            notification.ReviewId,
            notification.EmployeeName,
            notification.OverallRating);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for performance review approved events
/// </summary>
public sealed class PerformanceReviewApprovedEventHandler : INotificationHandler<PerformanceReviewApprovedDomainEvent>
{
    private readonly ILogger<PerformanceReviewApprovedEventHandler> _logger;

    public PerformanceReviewApprovedEventHandler(ILogger<PerformanceReviewApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PerformanceReviewApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "✅ Performance review approved: {ReviewId} - {EmployeeName}, Rating: {OverallRating}, Approved by: {ApprovedByName}",
            notification.ReviewId,
            notification.EmployeeName,
            notification.OverallRating,
            notification.ApprovedByName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for performance review due events - sends notification to reviewer
/// </summary>
public sealed class PerformanceReviewDueEventHandler : INotificationHandler<PerformanceReviewDueDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<PerformanceReviewDueEventHandler> _logger;

    public PerformanceReviewDueEventHandler(
        IHrNotificationService notificationService,
        ILogger<PerformanceReviewDueEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(PerformanceReviewDueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⏰ Performance review due: {EmployeeId} - {EmployeeName}, Period: {ReviewPeriod}, Due: {DueDate:d} ({DaysRemaining} days remaining)",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ReviewPeriod,
            notification.DueDate,
            notification.DaysRemaining);

        await _notificationService.SendPerformanceReviewDueAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ReviewerId,
            notification.ReviewPeriod,
            notification.DueDate,
            notification.DaysRemaining,
            cancellationToken);
    }
}

/// <summary>
/// Handler for low performance rating events - sends notification to manager
/// </summary>
public sealed class LowPerformanceRatingEventHandler : INotificationHandler<LowPerformanceRatingDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<LowPerformanceRatingEventHandler> _logger;

    public LowPerformanceRatingEventHandler(
        IHrNotificationService notificationService,
        ILogger<LowPerformanceRatingEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LowPerformanceRatingDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⚠️ Low performance rating: {ReviewId} - {EmployeeName}, Rating: {Rating} (threshold: {ThresholdRating})",
            notification.ReviewId,
            notification.EmployeeName,
            notification.Rating,
            notification.ThresholdRating);

        await _notificationService.SendLowPerformanceAlertAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.Rating,
            notification.ManagerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for performance improvement plan required events
/// </summary>
public sealed class PerformanceImprovementPlanRequiredEventHandler : INotificationHandler<PerformanceImprovementPlanRequiredDomainEvent>
{
    private readonly ILogger<PerformanceImprovementPlanRequiredEventHandler> _logger;

    public PerformanceImprovementPlanRequiredEventHandler(ILogger<PerformanceImprovementPlanRequiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PerformanceImprovementPlanRequiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "🚨 Performance improvement plan required: {EmployeeId} - {EmployeeName}, Rating: {CurrentRating}, Areas: {ImprovementAreas}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.CurrentRating,
            notification.ImprovementAreas);

        return Task.CompletedTask;
    }
}
