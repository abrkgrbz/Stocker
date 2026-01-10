using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Ticket Events

/// <summary>
/// Raised when a new ticket is created
/// </summary>
public sealed record TicketCreatedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    string Priority,
    string? Category,
    string RequesterName,
    string RequesterEmail,
    Guid? AccountId,
    string? AccountName,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a ticket is assigned
/// </summary>
public sealed record TicketAssignedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    string Priority,
    int AssignedToUserId,
    int? PreviousAssigneeId,
    int AssignedById) : DomainEvent;

/// <summary>
/// Raised when ticket status changes
/// </summary>
public sealed record TicketStatusChangedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    string OldStatus,
    string NewStatus,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when ticket priority changes
/// </summary>
public sealed record TicketPriorityChangedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    string OldPriority,
    string NewPriority,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when a ticket is escalated
/// </summary>
public sealed record TicketEscalatedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    string Priority,
    int EscalatedToUserId,
    string EscalationReason,
    int EscalatedById) : DomainEvent;

/// <summary>
/// Raised when a comment is added to ticket
/// </summary>
public sealed record TicketCommentAddedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    Guid CommentId,
    bool IsPublic,
    int CommentById,
    int? AssignedToUserId) : DomainEvent;

/// <summary>
/// Raised when a ticket is resolved
/// </summary>
public sealed record TicketResolvedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    string? Resolution,
    DateTime ResolvedDate,
    TimeSpan ResolutionTime,
    int ResolvedById) : DomainEvent;

/// <summary>
/// Raised when a ticket is closed
/// </summary>
public sealed record TicketClosedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    DateTime ClosedDate,
    int? SatisfactionRating,
    int ClosedById) : DomainEvent;

/// <summary>
/// Raised when a ticket is reopened
/// </summary>
public sealed record TicketReopenedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    string? ReopenReason,
    int ReopenedById,
    int? AssignedToUserId) : DomainEvent;

/// <summary>
/// Raised when a ticket SLA is breached
/// </summary>
public sealed record TicketSlaBreachedDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    string Priority,
    string SlaType,
    TimeSpan BreachDuration,
    int? AssignedToUserId,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a ticket SLA is about to breach
/// </summary>
public sealed record TicketSlaWarningDomainEvent(
    Guid TicketId,
    Guid TenantId,
    string TicketNumber,
    string Subject,
    string Priority,
    string SlaType,
    int MinutesRemaining,
    int? AssignedToUserId) : DomainEvent;

#endregion
