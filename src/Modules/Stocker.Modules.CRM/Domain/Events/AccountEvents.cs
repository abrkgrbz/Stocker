using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Account Events

/// <summary>
/// Raised when a new account is created
/// </summary>
public sealed record AccountCreatedDomainEvent(
    Guid AccountId,
    Guid TenantId,
    string AccountName,
    string? AccountType,
    string? Industry,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when account information is updated
/// </summary>
public sealed record AccountUpdatedDomainEvent(
    Guid AccountId,
    Guid TenantId,
    string AccountName,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when an account is assigned to a user
/// </summary>
public sealed record AccountAssignedDomainEvent(
    Guid AccountId,
    Guid TenantId,
    string AccountName,
    int AssignedToUserId,
    int? PreviousOwnerId,
    int AssignedById) : DomainEvent;

/// <summary>
/// Raised when account status changes
/// </summary>
public sealed record AccountStatusChangedDomainEvent(
    Guid AccountId,
    Guid TenantId,
    string AccountName,
    string OldStatus,
    string NewStatus,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when account type changes
/// </summary>
public sealed record AccountTypeChangedDomainEvent(
    Guid AccountId,
    Guid TenantId,
    string AccountName,
    string? OldType,
    string NewType,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when an account is merged with another
/// </summary>
public sealed record AccountMergedDomainEvent(
    Guid SourceAccountId,
    Guid TargetAccountId,
    Guid TenantId,
    string SourceAccountName,
    string TargetAccountName,
    int MergedById) : DomainEvent;

/// <summary>
/// Raised when account annual revenue is updated
/// </summary>
public sealed record AccountRevenueUpdatedDomainEvent(
    Guid AccountId,
    Guid TenantId,
    string AccountName,
    decimal? OldRevenue,
    decimal NewRevenue,
    string Currency,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when an account is marked as key account
/// </summary>
public sealed record AccountMarkedAsKeyAccountDomainEvent(
    Guid AccountId,
    Guid TenantId,
    string AccountName,
    int MarkedById) : DomainEvent;

/// <summary>
/// Raised when an account is deactivated
/// </summary>
public sealed record AccountDeactivatedDomainEvent(
    Guid AccountId,
    Guid TenantId,
    string AccountName,
    string? DeactivationReason,
    int DeactivatedById) : DomainEvent;

#endregion
