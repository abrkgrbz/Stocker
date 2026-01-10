using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Sales Team Events

/// <summary>
/// Raised when a new sales team is created
/// </summary>
public sealed record SalesTeamCreatedDomainEvent(
    Guid TeamId,
    Guid TenantId,
    string TeamName,
    string? Description,
    int ManagerId,
    int CreatedById) : DomainEvent;

/// <summary>
/// Raised when a sales team is updated
/// </summary>
public sealed record SalesTeamUpdatedDomainEvent(
    Guid TeamId,
    Guid TenantId,
    string TeamName,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when a member is added to sales team
/// </summary>
public sealed record SalesTeamMemberAddedDomainEvent(
    Guid TeamId,
    Guid TenantId,
    string TeamName,
    int MemberId,
    string Role,
    int AddedById) : DomainEvent;

/// <summary>
/// Raised when a member is removed from sales team
/// </summary>
public sealed record SalesTeamMemberRemovedDomainEvent(
    Guid TeamId,
    Guid TenantId,
    string TeamName,
    int MemberId,
    int RemovedById) : DomainEvent;

/// <summary>
/// Raised when sales team manager changes
/// </summary>
public sealed record SalesTeamManagerChangedDomainEvent(
    Guid TeamId,
    Guid TenantId,
    string TeamName,
    int OldManagerId,
    int NewManagerId,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when sales team quota is set
/// </summary>
public sealed record SalesTeamQuotaSetDomainEvent(
    Guid TeamId,
    Guid TenantId,
    string TeamName,
    decimal QuotaAmount,
    string Currency,
    string Period,
    int SetById) : DomainEvent;

/// <summary>
/// Raised when sales team reaches quota
/// </summary>
public sealed record SalesTeamQuotaReachedDomainEvent(
    Guid TeamId,
    Guid TenantId,
    string TeamName,
    decimal QuotaAmount,
    decimal AchievedAmount,
    string Currency,
    string Period) : DomainEvent;

/// <summary>
/// Raised when a sales team is deactivated
/// </summary>
public sealed record SalesTeamDeactivatedDomainEvent(
    Guid TeamId,
    Guid TenantId,
    string TeamName,
    int DeactivatedById) : DomainEvent;

#endregion
