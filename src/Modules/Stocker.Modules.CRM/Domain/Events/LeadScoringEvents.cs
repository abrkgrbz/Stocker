using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region LeadScoring Events

/// <summary>
/// Raised when a new lead scoring rule is created
/// </summary>
public sealed record LeadScoringRuleCreatedDomainEvent(
    Guid RuleId,
    Guid TenantId,
    string Name,
    string Category,
    string Field,
    string Operator,
    int Score,
    int CreatedById) : DomainEvent;

/// <summary>
/// Raised when a lead scoring rule is updated
/// </summary>
public sealed record LeadScoringRuleUpdatedDomainEvent(
    Guid RuleId,
    Guid TenantId,
    string Name,
    int OldScore,
    int NewScore,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when a lead scoring rule is activated
/// </summary>
public sealed record LeadScoringRuleActivatedDomainEvent(
    Guid RuleId,
    Guid TenantId,
    string Name,
    int ActivatedById) : DomainEvent;

/// <summary>
/// Raised when a lead scoring rule is deactivated
/// </summary>
public sealed record LeadScoringRuleDeactivatedDomainEvent(
    Guid RuleId,
    Guid TenantId,
    string Name,
    int DeactivatedById) : DomainEvent;

/// <summary>
/// Raised when a lead's score is calculated
/// </summary>
public sealed record LeadScoreCalculatedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string LeadName,
    int OldScore,
    int NewScore,
    string ScoreGrade,
    List<string> MatchedRules) : DomainEvent;

/// <summary>
/// Raised when a lead reaches a score threshold
/// </summary>
public sealed record LeadScoreThresholdReachedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string LeadName,
    int Score,
    string ThresholdName,
    string RecommendedAction,
    int? OwnerId) : DomainEvent;

/// <summary>
/// Raised when a lead is qualified based on score
/// </summary>
public sealed record LeadQualifiedByScoreDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string LeadName,
    int Score,
    string Grade,
    int? OwnerId) : DomainEvent;

/// <summary>
/// Raised when lead score grade changes
/// </summary>
public sealed record LeadScoreGradeChangedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string LeadName,
    string OldGrade,
    string NewGrade,
    int Score,
    int? OwnerId) : DomainEvent;

/// <summary>
/// Raised when lead scoring model is recalculated
/// </summary>
public sealed record LeadScoringModelRecalculatedDomainEvent(
    Guid TenantId,
    int TotalLeadsScored,
    int RulesApplied,
    DateTime CalculatedAt) : DomainEvent;

/// <summary>
/// Raised when lead score decays over time
/// </summary>
public sealed record LeadScoreDecayedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string LeadName,
    int OldScore,
    int NewScore,
    int DecayAmount,
    string DecayReason) : DomainEvent;

#endregion
