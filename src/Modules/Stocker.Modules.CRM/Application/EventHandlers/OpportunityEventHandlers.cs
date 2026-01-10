using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

/// <summary>
/// Handler for opportunity created events
/// </summary>
public sealed class OpportunityCreatedEventHandler : INotificationHandler<OpportunityCreatedDomainEvent>
{
    private readonly ILogger<OpportunityCreatedEventHandler> _logger;

    public OpportunityCreatedEventHandler(ILogger<OpportunityCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Opportunity created: {OpportunityId} - {OpportunityName}, Amount: {Amount} {Currency}, Close Date: {ExpectedCloseDate:d}",
            notification.OpportunityId,
            notification.OpportunityName,
            notification.Amount,
            notification.Currency,
            notification.ExpectedCloseDate);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for opportunity stage changed events
/// </summary>
public sealed class OpportunityStageChangedEventHandler : INotificationHandler<OpportunityStageChangedDomainEvent>
{
    private readonly ILogger<OpportunityStageChangedEventHandler> _logger;

    public OpportunityStageChangedEventHandler(ILogger<OpportunityStageChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityStageChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Opportunity stage changed: {OpportunityId} - Stage: {OldStageId} → {NewStageId}, Probability: {Probability}%",
            notification.OpportunityId,
            notification.OldStageId,
            notification.NewStageId,
            notification.Probability * 100);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for opportunity won events
/// </summary>
public sealed class OpportunityWonEventHandler : INotificationHandler<OpportunityWonDomainEvent>
{
    private readonly ILogger<OpportunityWonEventHandler> _logger;

    public OpportunityWonEventHandler(ILogger<OpportunityWonEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityWonDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🎉 Opportunity WON: {OpportunityId} - {OpportunityName}, Amount: {Amount} {Currency}",
            notification.OpportunityId,
            notification.OpportunityName,
            notification.Amount,
            notification.Currency);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for opportunity lost events
/// </summary>
public sealed class OpportunityLostEventHandler : INotificationHandler<OpportunityLostDomainEvent>
{
    private readonly ILogger<OpportunityLostEventHandler> _logger;

    public OpportunityLostEventHandler(ILogger<OpportunityLostEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityLostDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Opportunity LOST: {OpportunityId} - {OpportunityName}, Amount: {Amount}, Reason: {LostReason}",
            notification.OpportunityId,
            notification.OpportunityName,
            notification.Amount,
            notification.LostReason);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for opportunity close date approaching events - sends notification to owner
/// </summary>
public sealed class OpportunityCloseDateApproachingEventHandler : INotificationHandler<OpportunityCloseDateApproachingDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<OpportunityCloseDateApproachingEventHandler> _logger;

    public OpportunityCloseDateApproachingEventHandler(
        ICrmNotificationService notificationService,
        ILogger<OpportunityCloseDateApproachingEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(OpportunityCloseDateApproachingDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⏰ Opportunity close date approaching: {OpportunityId} - {OpportunityName}, " +
            "Expected Close: {ExpectedCloseDate:d} ({DaysRemaining} days remaining), Owner: {OwnerId}",
            notification.OpportunityId,
            notification.OpportunityName,
            notification.ExpectedCloseDate,
            notification.DaysRemaining,
            notification.OwnerId);

        await _notificationService.SendOpportunityCloseDateApproachingAsync(
            notification.TenantId,
            notification.OpportunityId,
            notification.OpportunityName,
            notification.ExpectedCloseDate,
            notification.DaysRemaining,
            notification.OwnerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for opportunity linked to campaign events
/// </summary>
public sealed class OpportunityLinkedToCampaignEventHandler : INotificationHandler<OpportunityLinkedToCampaignDomainEvent>
{
    private readonly ILogger<OpportunityLinkedToCampaignEventHandler> _logger;

    public OpportunityLinkedToCampaignEventHandler(ILogger<OpportunityLinkedToCampaignEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityLinkedToCampaignDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Opportunity linked to campaign: {OpportunityId} → Campaign {CampaignId}",
            notification.OpportunityId,
            notification.CampaignId);

        return Task.CompletedTask;
    }
}
