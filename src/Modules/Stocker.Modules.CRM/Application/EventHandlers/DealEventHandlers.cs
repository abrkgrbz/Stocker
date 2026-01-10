using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

/// <summary>
/// Handler for deal created events
/// </summary>
public sealed class DealCreatedEventHandler : INotificationHandler<DealCreatedDomainEvent>
{
    private readonly ILogger<DealCreatedEventHandler> _logger;

    public DealCreatedEventHandler(ILogger<DealCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DealCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Deal created: {DealId} - {DealName}, Value: {Value} {Currency}, Owner: {OwnerId}",
            notification.DealId,
            notification.DealName,
            notification.Value,
            notification.Currency,
            notification.OwnerId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for deal stage changed events
/// </summary>
public sealed class DealStageChangedEventHandler : INotificationHandler<DealStageChangedDomainEvent>
{
    private readonly ILogger<DealStageChangedEventHandler> _logger;

    public DealStageChangedEventHandler(ILogger<DealStageChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DealStageChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Deal stage changed: {DealId} - Stage: {OldStageId} → {NewStageId}, Probability: {Probability}%",
            notification.DealId,
            notification.OldStageId,
            notification.NewStageId,
            notification.Probability * 100);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for deal won events - sends notification to tenant
/// </summary>
public sealed class DealWonEventHandler : INotificationHandler<DealWonDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<DealWonEventHandler> _logger;

    public DealWonEventHandler(
        ICrmNotificationService notificationService,
        ILogger<DealWonEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DealWonDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🎉 Deal WON: {DealId} - {DealName}, Value: {Value} {Currency}, Customer: {CustomerId}",
            notification.DealId,
            notification.DealName,
            notification.Value,
            notification.Currency,
            notification.CustomerId);

        // Send real-time notification to tenant
        await _notificationService.SendDealWonAsync(
            notification.TenantId,
            notification.DealId,
            notification.DealName,
            notification.Value,
            notification.Currency,
            notification.OwnerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for deal lost events - sends notification to owner
/// </summary>
public sealed class DealLostEventHandler : INotificationHandler<DealLostDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<DealLostEventHandler> _logger;

    public DealLostEventHandler(
        ICrmNotificationService notificationService,
        ILogger<DealLostEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DealLostDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Deal LOST: {DealId} - {DealName}, Value: {Value}, Reason: {LostReason}, Competitor: {CompetitorName}",
            notification.DealId,
            notification.DealName,
            notification.Value,
            notification.LostReason,
            notification.CompetitorName ?? "N/A");

        // Send real-time notification to owner
        await _notificationService.SendDealLostAsync(
            notification.TenantId,
            notification.DealId,
            notification.DealName,
            notification.Value,
            notification.LostReason,
            notification.OwnerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for deal rotten events - sends alert to owner
/// </summary>
public sealed class DealRottenEventHandler : INotificationHandler<DealRottenDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<DealRottenEventHandler> _logger;

    public DealRottenEventHandler(
        ICrmNotificationService notificationService,
        ILogger<DealRottenEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DealRottenDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⚠️ Deal ROTTEN: {DealId} - {DealName}, No activity for {DaysSinceLastActivity} days, Owner: {OwnerId}",
            notification.DealId,
            notification.DealName,
            notification.DaysSinceLastActivity,
            notification.OwnerId);

        // Send alert to owner
        await _notificationService.SendDealRottenAlertAsync(
            notification.TenantId,
            notification.DealId,
            notification.DealName,
            notification.DaysSinceLastActivity,
            notification.OwnerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for deal reopened events
/// </summary>
public sealed class DealReopenedEventHandler : INotificationHandler<DealReopenedDomainEvent>
{
    private readonly ILogger<DealReopenedEventHandler> _logger;

    public DealReopenedEventHandler(ILogger<DealReopenedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DealReopenedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Deal reopened: {DealId} - {DealName}",
            notification.DealId,
            notification.DealName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for deal product added events
/// </summary>
public sealed class DealProductAddedEventHandler : INotificationHandler<DealProductAddedDomainEvent>
{
    private readonly ILogger<DealProductAddedEventHandler> _logger;

    public DealProductAddedEventHandler(ILogger<DealProductAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DealProductAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product added to deal: {DealId} - Product {ProductId}, Quantity: {Quantity}, Total: {TotalPrice}",
            notification.DealId,
            notification.ProductId,
            notification.Quantity,
            notification.TotalPrice);

        return Task.CompletedTask;
    }
}
