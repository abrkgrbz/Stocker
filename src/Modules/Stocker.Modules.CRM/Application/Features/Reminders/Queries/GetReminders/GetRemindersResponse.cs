using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Queries.GetReminders;

public record GetRemindersResponse(
    List<ReminderDto> Reminders,
    int TotalCount);

public record ReminderDto(
    int Id,
    Guid TenantId,
    Guid UserId,
    string Title,
    string? Description,
    DateTime RemindAt,
    ReminderType Type,
    ReminderStatus Status,
    int? RelatedEntityId,
    string? RelatedEntityType,
    DateTime? CompletedAt,
    DateTime? SnoozedUntil,
    bool SendEmail,
    bool SendPush,
    bool SendInApp,
    RecurrenceType RecurrenceType,
    string? RecurrencePattern,
    DateTime? RecurrenceEndDate,
    Guid? AssignedToUserId,
    DateTime? DueDate,
    DateTime? MeetingStartTime,
    DateTime? MeetingEndTime,
    string? Participants,
    DateTime CreatedDate);
