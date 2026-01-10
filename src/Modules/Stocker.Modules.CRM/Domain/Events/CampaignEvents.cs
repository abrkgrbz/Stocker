using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Campaign Events

/// <summary>
/// Raised when a campaign is created
/// </summary>
public sealed record CampaignCreatedDomainEvent(
    Guid CampaignId,
    Guid TenantId,
    string Name,
    string CampaignType,
    DateTime? StartDate,
    DateTime? EndDate) : DomainEvent;

/// <summary>
/// Raised when a campaign is launched
/// </summary>
public sealed record CampaignLaunchedDomainEvent(
    Guid CampaignId,
    Guid TenantId,
    string Name,
    int TargetMemberCount) : DomainEvent;

/// <summary>
/// Raised when a campaign is completed
/// </summary>
public sealed record CampaignCompletedDomainEvent(
    Guid CampaignId,
    Guid TenantId,
    string Name,
    int TotalMembers,
    int ConversionsCount,
    decimal TotalRevenue) : DomainEvent;

/// <summary>
/// Raised when a campaign is cancelled
/// </summary>
public sealed record CampaignCancelledDomainEvent(
    Guid CampaignId,
    Guid TenantId,
    string Name,
    string? Reason) : DomainEvent;

/// <summary>
/// Raised when a member is added to a campaign
/// </summary>
public sealed record CampaignMemberAddedDomainEvent(
    Guid CampaignId,
    Guid TenantId,
    Guid MemberId,
    string MemberType) : DomainEvent;

/// <summary>
/// Raised when a campaign member responds
/// </summary>
public sealed record CampaignMemberRespondedDomainEvent(
    Guid CampaignId,
    Guid TenantId,
    Guid MemberId,
    string ResponseStatus,
    DateTime ResponseDate) : DomainEvent;

/// <summary>
/// Raised when campaign budget is updated
/// </summary>
public sealed record CampaignBudgetUpdatedDomainEvent(
    Guid CampaignId,
    Guid TenantId,
    decimal OldBudget,
    decimal NewBudget) : DomainEvent;

#endregion
