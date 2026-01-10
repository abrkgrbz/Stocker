using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region LeadScoring Event Handlers

/// <summary>
/// Handler for lead scoring rule created events
/// </summary>
public sealed class LeadScoringRuleCreatedEventHandler : INotificationHandler<LeadScoringRuleCreatedDomainEvent>
{
    private readonly ILogger<LeadScoringRuleCreatedEventHandler> _logger;

    public LeadScoringRuleCreatedEventHandler(ILogger<LeadScoringRuleCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadScoringRuleCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead scoring rule created: {RuleId} - {Name}, Category: {Category}, Score: {Score}",
            notification.RuleId,
            notification.Name,
            notification.Category,
            notification.Score);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for lead scoring rule updated events
/// </summary>
public sealed class LeadScoringRuleUpdatedEventHandler : INotificationHandler<LeadScoringRuleUpdatedDomainEvent>
{
    private readonly ILogger<LeadScoringRuleUpdatedEventHandler> _logger;

    public LeadScoringRuleUpdatedEventHandler(ILogger<LeadScoringRuleUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadScoringRuleUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead scoring rule updated: {Name}, Score: {OldScore} → {NewScore}",
            notification.Name,
            notification.OldScore,
            notification.NewScore);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for lead score calculated events
/// </summary>
public sealed class LeadScoreCalculatedEventHandler : INotificationHandler<LeadScoreCalculatedDomainEvent>
{
    private readonly ILogger<LeadScoreCalculatedEventHandler> _logger;

    public LeadScoreCalculatedEventHandler(ILogger<LeadScoreCalculatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadScoreCalculatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead score calculated: {LeadName}, Score: {OldScore} → {NewScore}, Grade: {Grade}, Rules: {RuleCount}",
            notification.LeadName,
            notification.OldScore,
            notification.NewScore,
            notification.ScoreGrade,
            notification.MatchedRules.Count);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for lead score threshold reached events
/// </summary>
public sealed class LeadScoreThresholdReachedEventHandler : INotificationHandler<LeadScoreThresholdReachedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<LeadScoreThresholdReachedEventHandler> _logger;

    public LeadScoreThresholdReachedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<LeadScoreThresholdReachedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeadScoreThresholdReachedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead score threshold reached: {LeadName}, Score: {Score}, Threshold: {Threshold}, Action: {Action}",
            notification.LeadName,
            notification.Score,
            notification.ThresholdName,
            notification.RecommendedAction);

        if (notification.OwnerId.HasValue)
        {
            await _notificationService.SendLeadScoreThresholdReachedAsync(
                notification.TenantId,
                notification.LeadId,
                notification.LeadName,
                notification.Score,
                notification.ThresholdName,
                notification.OwnerId.Value,
                cancellationToken);
        }
    }
}

/// <summary>
/// Handler for lead qualified by score events
/// </summary>
public sealed class LeadQualifiedByScoreEventHandler : INotificationHandler<LeadQualifiedByScoreDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<LeadQualifiedByScoreEventHandler> _logger;

    public LeadQualifiedByScoreEventHandler(
        ICrmNotificationService notificationService,
        ILogger<LeadQualifiedByScoreEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeadQualifiedByScoreDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead qualified by score: {LeadName}, Score: {Score}, Grade: {Grade}",
            notification.LeadName,
            notification.Score,
            notification.Grade);

        if (notification.OwnerId.HasValue)
        {
            await _notificationService.SendLeadQualifiedAsync(
                notification.TenantId,
                notification.LeadId,
                notification.LeadName,
                notification.Score,
                notification.OwnerId.Value,
                cancellationToken);
        }
    }
}

/// <summary>
/// Handler for lead score grade changed events
/// </summary>
public sealed class LeadScoreGradeChangedEventHandler : INotificationHandler<LeadScoreGradeChangedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<LeadScoreGradeChangedEventHandler> _logger;

    public LeadScoreGradeChangedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<LeadScoreGradeChangedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeadScoreGradeChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead score grade changed: {LeadName}, {OldGrade} → {NewGrade}, Score: {Score}",
            notification.LeadName,
            notification.OldGrade,
            notification.NewGrade,
            notification.Score);

        if (notification.OwnerId.HasValue)
        {
            await _notificationService.SendLeadGradeChangedAsync(
                notification.TenantId,
                notification.LeadId,
                notification.LeadName,
                notification.OldGrade,
                notification.NewGrade,
                notification.OwnerId.Value,
                cancellationToken);
        }
    }
}

/// <summary>
/// Handler for lead score decayed events
/// </summary>
public sealed class LeadScoreDecayedEventHandler : INotificationHandler<LeadScoreDecayedDomainEvent>
{
    private readonly ILogger<LeadScoreDecayedEventHandler> _logger;

    public LeadScoreDecayedEventHandler(ILogger<LeadScoreDecayedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadScoreDecayedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Lead score decayed: {LeadName}, {OldScore} → {NewScore}, Decay: -{DecayAmount}, Reason: {Reason}",
            notification.LeadName,
            notification.OldScore,
            notification.NewScore,
            notification.DecayAmount,
            notification.DecayReason);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for lead scoring model recalculated events
/// </summary>
public sealed class LeadScoringModelRecalculatedEventHandler : INotificationHandler<LeadScoringModelRecalculatedDomainEvent>
{
    private readonly ILogger<LeadScoringModelRecalculatedEventHandler> _logger;

    public LeadScoringModelRecalculatedEventHandler(ILogger<LeadScoringModelRecalculatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadScoringModelRecalculatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead scoring model recalculated: {LeadsScored} leads, {RulesApplied} rules applied",
            notification.TotalLeadsScored,
            notification.RulesApplied);

        return Task.CompletedTask;
    }
}

#endregion
