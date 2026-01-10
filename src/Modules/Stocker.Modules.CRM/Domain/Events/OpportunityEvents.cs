using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Opportunity Events

/// <summary>
/// Raised when a new opportunity is created
/// </summary>
public sealed record OpportunityCreatedDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    decimal Amount,
    string Currency,
    DateTime ExpectedCloseDate,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when opportunity details are updated
/// </summary>
public sealed record OpportunityUpdatedDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    decimal Amount) : DomainEvent;

/// <summary>
/// Raised when an opportunity moves to a new stage
/// </summary>
public sealed record OpportunityStageChangedDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    Guid OldStageId,
    Guid NewStageId,
    decimal Probability) : DomainEvent;

/// <summary>
/// Raised when an opportunity is won
/// </summary>
public sealed record OpportunityWonDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    decimal Amount,
    string Currency,
    Guid? CustomerId,
    DateTime WonDate) : DomainEvent;

/// <summary>
/// Raised when an opportunity is lost
/// </summary>
public sealed record OpportunityLostDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    decimal Amount,
    string LostReason,
    string? CompetitorName,
    DateTime LostDate) : DomainEvent;

/// <summary>
/// Raised when an opportunity is reopened
/// </summary>
public sealed record OpportunityReopenedDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName) : DomainEvent;

/// <summary>
/// Raised when an opportunity is linked to a campaign
/// </summary>
public sealed record OpportunityLinkedToCampaignDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    Guid CampaignId) : DomainEvent;

/// <summary>
/// Raised when opportunity close date is approaching
/// </summary>
public sealed record OpportunityCloseDateApproachingDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    DateTime ExpectedCloseDate,
    int DaysRemaining,
    int OwnerId) : DomainEvent;

#endregion
