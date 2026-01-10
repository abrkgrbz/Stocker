using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Activity Events

/// <summary>
/// Raised when an activity is created
/// </summary>
public sealed record ActivityCreatedDomainEvent(
    Guid ActivityId,
    Guid TenantId,
    string Subject,
    string ActivityType,
    Guid? CustomerId,
    Guid? DealId,
    Guid? OpportunityId,
    int AssignedToUserId) : DomainEvent;

/// <summary>
/// Raised when an activity is completed
/// </summary>
public sealed record ActivityCompletedDomainEvent(
    Guid ActivityId,
    Guid TenantId,
    string Subject,
    string ActivityType,
    DateTime CompletedDate) : DomainEvent;

/// <summary>
/// Raised when an activity is cancelled
/// </summary>
public sealed record ActivityCancelledDomainEvent(
    Guid ActivityId,
    Guid TenantId,
    string Subject,
    string? Reason) : DomainEvent;

/// <summary>
/// Raised when an activity is overdue
/// </summary>
public sealed record ActivityOverdueDomainEvent(
    Guid ActivityId,
    Guid TenantId,
    string Subject,
    DateTime DueDate,
    int DaysOverdue,
    int AssignedToUserId) : DomainEvent;

/// <summary>
/// Raised when an activity is rescheduled
/// </summary>
public sealed record ActivityRescheduledDomainEvent(
    Guid ActivityId,
    Guid TenantId,
    DateTime OldDueDate,
    DateTime NewDueDate) : DomainEvent;

#endregion
