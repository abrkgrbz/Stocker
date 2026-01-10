using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Meeting Events

/// <summary>
/// Raised when a new meeting is scheduled
/// </summary>
public sealed record MeetingScheduledDomainEvent(
    Guid MeetingId,
    Guid TenantId,
    string Title,
    string MeetingType,
    DateTime StartTime,
    DateTime EndTime,
    string? Location,
    int OrganizerId,
    List<int> AttendeeIds) : DomainEvent;

/// <summary>
/// Raised when a meeting is updated
/// </summary>
public sealed record MeetingUpdatedDomainEvent(
    Guid MeetingId,
    Guid TenantId,
    string Title,
    DateTime? OldStartTime,
    DateTime NewStartTime,
    DateTime? OldEndTime,
    DateTime NewEndTime,
    string? Location,
    int UpdatedById,
    List<int> AttendeeIds) : DomainEvent;

/// <summary>
/// Raised when a meeting is cancelled
/// </summary>
public sealed record MeetingCancelledDomainEvent(
    Guid MeetingId,
    Guid TenantId,
    string Title,
    DateTime StartTime,
    string? CancellationReason,
    int CancelledById,
    List<int> AttendeeIds) : DomainEvent;

/// <summary>
/// Raised when a meeting reminder is due
/// </summary>
public sealed record MeetingReminderDueDomainEvent(
    Guid MeetingId,
    Guid TenantId,
    string Title,
    DateTime StartTime,
    string? Location,
    int MinutesUntilStart,
    int OrganizerId,
    List<int> AttendeeIds) : DomainEvent;

/// <summary>
/// Raised when a meeting starts
/// </summary>
public sealed record MeetingStartedDomainEvent(
    Guid MeetingId,
    Guid TenantId,
    string Title,
    DateTime StartTime,
    string? Location,
    string? OnlineMeetingLink,
    int OrganizerId) : DomainEvent;

/// <summary>
/// Raised when a meeting ends
/// </summary>
public sealed record MeetingEndedDomainEvent(
    Guid MeetingId,
    Guid TenantId,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    TimeSpan Duration,
    int OrganizerId) : DomainEvent;

/// <summary>
/// Raised when attendee responds to meeting invitation
/// </summary>
public sealed record MeetingAttendeeRespondedDomainEvent(
    Guid MeetingId,
    Guid TenantId,
    string Title,
    DateTime StartTime,
    int AttendeeId,
    string Response,
    int OrganizerId) : DomainEvent;

/// <summary>
/// Raised when meeting notes are added
/// </summary>
public sealed record MeetingNotesAddedDomainEvent(
    Guid MeetingId,
    Guid TenantId,
    string Title,
    int AddedById,
    int OrganizerId) : DomainEvent;

/// <summary>
/// Raised when a recurring meeting is created
/// </summary>
public sealed record RecurringMeetingCreatedDomainEvent(
    Guid MeetingId,
    Guid TenantId,
    string Title,
    string RecurrencePattern,
    DateTime FirstOccurrence,
    DateTime? RecurrenceEndDate,
    int OrganizerId,
    List<int> AttendeeIds) : DomainEvent;

#endregion
