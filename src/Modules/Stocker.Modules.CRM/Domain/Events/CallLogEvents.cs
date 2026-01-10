using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region CallLog Events

/// <summary>
/// Raised when a new call log is created
/// </summary>
public sealed record CallLogCreatedDomainEvent(
    Guid CallLogId,
    Guid TenantId,
    string CallNumber,
    string Direction,
    string CallType,
    string CallerNumber,
    string CalledNumber,
    Guid? CustomerId,
    Guid? ContactId,
    int UserId) : DomainEvent;

/// <summary>
/// Raised when a call is started
/// </summary>
public sealed record CallStartedDomainEvent(
    Guid CallLogId,
    Guid TenantId,
    string CallNumber,
    string Direction,
    string CallerNumber,
    string CalledNumber,
    int UserId) : DomainEvent;

/// <summary>
/// Raised when a call is ended
/// </summary>
public sealed record CallEndedDomainEvent(
    Guid CallLogId,
    Guid TenantId,
    string CallNumber,
    string Status,
    int DurationSeconds,
    string? Outcome,
    int UserId) : DomainEvent;

/// <summary>
/// Raised when a call is missed
/// </summary>
public sealed record CallMissedDomainEvent(
    Guid CallLogId,
    Guid TenantId,
    string CallNumber,
    string CallerNumber,
    Guid? CustomerId,
    string? CustomerName,
    int? AssignedToUserId) : DomainEvent;

/// <summary>
/// Raised when a call is transferred
/// </summary>
public sealed record CallTransferredDomainEvent(
    Guid CallLogId,
    Guid TenantId,
    string CallNumber,
    int TransferredFromUserId,
    int TransferredToUserId,
    string? TransferReason) : DomainEvent;

/// <summary>
/// Raised when a call recording is available
/// </summary>
public sealed record CallRecordingAvailableDomainEvent(
    Guid CallLogId,
    Guid TenantId,
    string CallNumber,
    string RecordingUrl,
    int DurationSeconds,
    int UserId) : DomainEvent;

/// <summary>
/// Raised when a call is scheduled (callback)
/// </summary>
public sealed record CallScheduledDomainEvent(
    Guid CallLogId,
    Guid TenantId,
    string CallNumber,
    DateTime ScheduledTime,
    Guid? CustomerId,
    string? CustomerName,
    int AssignedToUserId,
    int ScheduledById) : DomainEvent;

/// <summary>
/// Raised when call notes are updated
/// </summary>
public sealed record CallNotesUpdatedDomainEvent(
    Guid CallLogId,
    Guid TenantId,
    string CallNumber,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when call outcome is set
/// </summary>
public sealed record CallOutcomeSetDomainEvent(
    Guid CallLogId,
    Guid TenantId,
    string CallNumber,
    string Outcome,
    string? NextAction,
    DateTime? FollowUpDate,
    int SetById) : DomainEvent;

#endregion
