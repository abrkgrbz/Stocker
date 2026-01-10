using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Customer Events

/// <summary>
/// Raised when a new customer is created
/// </summary>
public sealed record CustomerCreatedDomainEvent(
    Guid CustomerId,
    Guid TenantId,
    string CompanyName,
    string Email,
    string CustomerType) : DomainEvent;

/// <summary>
/// Raised when customer information is updated
/// </summary>
public sealed record CustomerUpdatedDomainEvent(
    Guid CustomerId,
    Guid TenantId,
    string CompanyName,
    string Email) : DomainEvent;

/// <summary>
/// Raised when a customer is activated
/// </summary>
public sealed record CustomerActivatedDomainEvent(
    Guid CustomerId,
    Guid TenantId,
    string CompanyName) : DomainEvent;

/// <summary>
/// Raised when a customer is deactivated
/// </summary>
public sealed record CustomerDeactivatedDomainEvent(
    Guid CustomerId,
    Guid TenantId,
    string CompanyName) : DomainEvent;

/// <summary>
/// Raised when a contact is added to a customer
/// </summary>
public sealed record CustomerContactAddedDomainEvent(
    Guid CustomerId,
    Guid TenantId,
    Guid ContactId,
    string ContactEmail,
    bool IsPrimary) : DomainEvent;

/// <summary>
/// Raised when a contact is removed from a customer
/// </summary>
public sealed record CustomerContactRemovedDomainEvent(
    Guid CustomerId,
    Guid TenantId,
    Guid ContactId) : DomainEvent;

/// <summary>
/// Raised when customer credit limit is changed
/// </summary>
public sealed record CustomerCreditLimitChangedDomainEvent(
    Guid CustomerId,
    Guid TenantId,
    decimal OldLimit,
    decimal NewLimit) : DomainEvent;

/// <summary>
/// Raised when customer is assigned to a segment
/// </summary>
public sealed record CustomerSegmentAssignedDomainEvent(
    Guid CustomerId,
    Guid TenantId,
    Guid SegmentId,
    string SegmentName) : DomainEvent;

#endregion
