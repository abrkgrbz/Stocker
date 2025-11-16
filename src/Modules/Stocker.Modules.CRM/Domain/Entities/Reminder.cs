using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a scheduled reminder for a user
/// </summary>
public class Reminder : BaseEntity
{
    public Guid TenantId { get; private set; }
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DateTime RemindAt { get; private set; }
    public ReminderType Type { get; private set; }
    public ReminderStatus Status { get; private set; }
    public int? RelatedEntityId { get; private set; }
    public string? RelatedEntityType { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? SnoozedUntil { get; private set; }
    public bool SendEmail { get; private set; }
    public bool SendPush { get; private set; }
    public bool SendInApp { get; private set; }

    // Recurrence fields
    public RecurrenceType RecurrenceType { get; private set; }
    public string? RecurrencePattern { get; private set; } // JSON for detailed recurrence rules
    public DateTime? RecurrenceEndDate { get; private set; }

    // Assignment field
    public Guid? AssignedToUserId { get; private set; }

    // Task/Meeting specific fields
    public DateTime? DueDate { get; private set; }
    public DateTime? MeetingStartTime { get; private set; }
    public DateTime? MeetingEndTime { get; private set; }
    public string? Participants { get; private set; } // JSON array of user IDs

    // EF Core constructor
    private Reminder() { }

    private Reminder(
        Guid tenantId,
        Guid userId,
        string title,
        DateTime remindAt,
        ReminderType type,
        string? description = null,
        int? relatedEntityId = null,
        string? relatedEntityType = null,
        bool sendEmail = false,
        bool sendPush = true,
        bool sendInApp = true,
        RecurrenceType recurrenceType = RecurrenceType.None,
        string? recurrencePattern = null,
        DateTime? recurrenceEndDate = null,
        Guid? assignedToUserId = null,
        DateTime? dueDate = null,
        DateTime? meetingStartTime = null,
        DateTime? meetingEndTime = null,
        string? participants = null)
    {
        TenantId = tenantId;
        UserId = userId;
        Title = title;
        Description = description;
        RemindAt = remindAt;
        Type = type;
        Status = ReminderStatus.Pending;
        RelatedEntityId = relatedEntityId;
        RelatedEntityType = relatedEntityType;
        SendEmail = sendEmail;
        SendPush = sendPush;
        SendInApp = sendInApp;
        RecurrenceType = recurrenceType;
        RecurrencePattern = recurrencePattern;
        RecurrenceEndDate = recurrenceEndDate;
        AssignedToUserId = assignedToUserId;
        DueDate = dueDate;
        MeetingStartTime = meetingStartTime;
        MeetingEndTime = meetingEndTime;
        Participants = participants;
    }

    public static Result<Reminder> Create(
        Guid tenantId,
        Guid userId,
        string title,
        DateTime remindAt,
        ReminderType type,
        string? description = null,
        int? relatedEntityId = null,
        string? relatedEntityType = null,
        bool sendEmail = false,
        bool sendPush = true,
        bool sendInApp = true,
        RecurrenceType recurrenceType = RecurrenceType.None,
        string? recurrencePattern = null,
        DateTime? recurrenceEndDate = null,
        Guid? assignedToUserId = null,
        DateTime? dueDate = null,
        DateTime? meetingStartTime = null,
        DateTime? meetingEndTime = null,
        string? participants = null)
    {
        if (tenantId == Guid.Empty)
            return Result<Reminder>.Failure(Error.Validation("Reminder", "Tenant ID is required"));

        if (userId == Guid.Empty)
            return Result<Reminder>.Failure(Error.Validation("Reminder", "User ID is required"));

        if (string.IsNullOrWhiteSpace(title))
            return Result<Reminder>.Failure(Error.Validation("Reminder", "Title is required"));

        if (remindAt <= DateTime.UtcNow && recurrenceType == RecurrenceType.None)
            return Result<Reminder>.Failure(Error.Validation("Reminder", "Remind time must be in the future"));

        // Validate meeting times
        if (type == ReminderType.Meeting)
        {
            if (meetingStartTime.HasValue && meetingEndTime.HasValue && meetingEndTime <= meetingStartTime)
                return Result<Reminder>.Failure(Error.Validation("Reminder", "Meeting end time must be after start time"));
        }

        // Validate due date
        if (dueDate.HasValue && dueDate < remindAt)
            return Result<Reminder>.Failure(Error.Validation("Reminder", "Due date cannot be before remind time"));

        var reminder = new Reminder(tenantId, userId, title, remindAt, type,
            description, relatedEntityId, relatedEntityType, sendEmail, sendPush, sendInApp,
            recurrenceType, recurrencePattern, recurrenceEndDate, assignedToUserId,
            dueDate, meetingStartTime, meetingEndTime, participants);
        return Result<Reminder>.Success(reminder);
    }

    public Result Snooze(int minutes)
    {
        if (Status == ReminderStatus.Completed)
            return Result.Failure(Error.Validation("Reminder", "Cannot snooze completed reminder"));

        if (Status == ReminderStatus.Dismissed)
            return Result.Failure(Error.Validation("Reminder", "Cannot snooze dismissed reminder"));

        if (minutes <= 0)
            return Result.Failure(Error.Validation("Reminder", "Snooze duration must be positive"));

        SnoozedUntil = DateTime.UtcNow.AddMinutes(minutes);
        Status = ReminderStatus.Snoozed;
        return Result.Success();
    }

    public Result Complete()
    {
        if (Status == ReminderStatus.Completed)
            return Result.Failure(Error.Validation("Reminder", "Reminder already completed"));

        Status = ReminderStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Dismiss()
    {
        if (Status == ReminderStatus.Completed)
            return Result.Failure(Error.Validation("Reminder", "Cannot dismiss completed reminder"));

        if (Status == ReminderStatus.Dismissed)
            return Result.Failure(Error.Validation("Reminder", "Reminder already dismissed"));

        Status = ReminderStatus.Dismissed;
        return Result.Success();
    }

    public Result Trigger()
    {
        if (Status == ReminderStatus.Completed)
            return Result.Failure(Error.Validation("Reminder", "Cannot trigger completed reminder"));

        if (Status == ReminderStatus.Dismissed)
            return Result.Failure(Error.Validation("Reminder", "Cannot trigger dismissed reminder"));

        Status = ReminderStatus.Triggered;
        return Result.Success();
    }

    public bool ShouldTrigger()
    {
        if (Status == ReminderStatus.Completed || Status == ReminderStatus.Dismissed)
            return false;

        if (Status == ReminderStatus.Snoozed && SnoozedUntil.HasValue)
            return DateTime.UtcNow >= SnoozedUntil.Value;

        return DateTime.UtcNow >= RemindAt;
    }

    public Result Update(
        string title,
        DateTime remindAt,
        ReminderType type,
        string? description = null,
        int? relatedEntityId = null,
        string? relatedEntityType = null,
        bool sendEmail = false,
        bool sendPush = true,
        bool sendInApp = true,
        RecurrenceType recurrenceType = RecurrenceType.None,
        string? recurrencePattern = null,
        DateTime? recurrenceEndDate = null,
        Guid? assignedToUserId = null,
        DateTime? dueDate = null,
        DateTime? meetingStartTime = null,
        DateTime? meetingEndTime = null,
        string? participants = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure(Error.Validation("Reminder", "Title is required"));

        if (remindAt <= DateTime.UtcNow && recurrenceType == RecurrenceType.None)
            return Result.Failure(Error.Validation("Reminder", "Remind time must be in the future"));

        // Validate meeting times
        if (type == ReminderType.Meeting)
        {
            if (meetingStartTime.HasValue && meetingEndTime.HasValue && meetingEndTime <= meetingStartTime)
                return Result.Failure(Error.Validation("Reminder", "Meeting end time must be after start time"));
        }

        // Validate due date
        if (dueDate.HasValue && dueDate < remindAt)
            return Result.Failure(Error.Validation("Reminder", "Due date cannot be before remind time"));

        Title = title;
        Description = description;
        RemindAt = remindAt;
        Type = type;
        RelatedEntityId = relatedEntityId;
        RelatedEntityType = relatedEntityType;
        SendEmail = sendEmail;
        SendPush = sendPush;
        SendInApp = sendInApp;
        RecurrenceType = recurrenceType;
        RecurrencePattern = recurrencePattern;
        RecurrenceEndDate = recurrenceEndDate;
        AssignedToUserId = assignedToUserId;
        DueDate = dueDate;
        MeetingStartTime = meetingStartTime;
        MeetingEndTime = meetingEndTime;
        Participants = participants;

        return Result.Success();
    }
}
