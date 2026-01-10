using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Territory Events

/// <summary>
/// Raised when a new territory is created
/// </summary>
public sealed record TerritoryCreatedDomainEvent(
    Guid TerritoryId,
    Guid TenantId,
    string TerritoryName,
    string? Description,
    Guid? ParentTerritoryId,
    int CreatedById) : DomainEvent;

/// <summary>
/// Raised when a territory is updated
/// </summary>
public sealed record TerritoryUpdatedDomainEvent(
    Guid TerritoryId,
    Guid TenantId,
    string TerritoryName,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when a user is assigned to territory
/// </summary>
public sealed record TerritoryUserAssignedDomainEvent(
    Guid TerritoryId,
    Guid TenantId,
    string TerritoryName,
    int AssignedUserId,
    string Role,
    int AssignedById) : DomainEvent;

/// <summary>
/// Raised when a user is removed from territory
/// </summary>
public sealed record TerritoryUserRemovedDomainEvent(
    Guid TerritoryId,
    Guid TenantId,
    string TerritoryName,
    int RemovedUserId,
    int RemovedById) : DomainEvent;

/// <summary>
/// Raised when an account is added to territory
/// </summary>
public sealed record TerritoryAccountAddedDomainEvent(
    Guid TerritoryId,
    Guid TenantId,
    string TerritoryName,
    Guid AccountId,
    string AccountName,
    int AddedById) : DomainEvent;

/// <summary>
/// Raised when an account is removed from territory
/// </summary>
public sealed record TerritoryAccountRemovedDomainEvent(
    Guid TerritoryId,
    Guid TenantId,
    string TerritoryName,
    Guid AccountId,
    string AccountName,
    int RemovedById) : DomainEvent;

/// <summary>
/// Raised when a territory is deactivated
/// </summary>
public sealed record TerritoryDeactivatedDomainEvent(
    Guid TerritoryId,
    Guid TenantId,
    string TerritoryName,
    int DeactivatedById) : DomainEvent;

#endregion
