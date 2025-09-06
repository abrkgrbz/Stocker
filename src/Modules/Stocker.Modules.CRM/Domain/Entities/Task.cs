using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a task in the CRM system
/// </summary>
public class Task : TenantAggregateRoot
{
    private readonly List<Guid> _assignedUserIds = new();
    private readonly List<Note> _notes = new();

    /// <summary>
    /// Gets the task subject
    /// </summary>
    public string Subject { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the task description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the task status
    /// </summary>
    public Enums.TaskStatus Status { get; private set; }

    /// <summary>
    /// Gets the task priority
    /// </summary>
    public TaskPriority Priority { get; private set; }

    /// <summary>
    /// Gets the due date
    /// </summary>
    public DateTime? DueDate { get; private set; }

    /// <summary>
    /// Gets the reminder date
    /// </summary>
    public DateTime? ReminderDate { get; private set; }

    /// <summary>
    /// Gets the start date
    /// </summary>
    public DateTime? StartDate { get; private set; }

    /// <summary>
    /// Gets the completion date
    /// </summary>
    public DateTime? CompletedDate { get; private set; }

    /// <summary>
    /// Gets the completion percentage
    /// </summary>
    public int CompletionPercentage { get; private set; }

    /// <summary>
    /// Gets the related entity type
    /// </summary>
    public RelatedEntityType? RelatedEntityType { get; private set; }

    /// <summary>
    /// Gets the related entity ID
    /// </summary>
    public Guid? RelatedEntityId { get; private set; }

    /// <summary>
    /// Gets the owner user ID
    /// </summary>
    public Guid OwnerId { get; private set; }

    /// <summary>
    /// Gets the assigned user IDs
    /// </summary>
    public IReadOnlyList<Guid> AssignedUserIds => _assignedUserIds.AsReadOnly();

    /// <summary>
    /// Gets the parent task ID
    /// </summary>
    public Guid? ParentTaskId { get; private set; }

    /// <summary>
    /// Gets the parent task
    /// </summary>
    public Task? ParentTask { get; private set; }

    /// <summary>
    /// Gets whether this is a recurring task
    /// </summary>
    public bool IsRecurring { get; private set; }

    /// <summary>
    /// Gets the recurrence pattern
    /// </summary>
    public RecurrencePattern? RecurrencePattern { get; private set; }

    /// <summary>
    /// Gets the estimated hours
    /// </summary>
    public decimal? EstimatedHours { get; private set; }

    /// <summary>
    /// Gets the actual hours
    /// </summary>
    public decimal? ActualHours { get; private set; }

    /// <summary>
    /// Gets whether this is a milestone
    /// </summary>
    public bool IsMilestone { get; private set; }

    /// <summary>
    /// Gets the notes
    /// </summary>
    public IReadOnlyList<Note> Notes => _notes.AsReadOnly();

    /// <summary>
    /// Gets the created date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the last modified date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Private constructor for EF Core
    /// </summary>
    private Task() : base()
    {
    }

    /// <summary>
    /// Creates a new task
    /// </summary>
    public static Result<Task> Create(
        Guid tenantId,
        string subject,
        Guid ownerId,
        TaskPriority priority = TaskPriority.Normal,
        DateTime? dueDate = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(subject))
            return Result<Task>.Failure(Error.Validation("Task.Subject", "Subject is required"));

        if (ownerId == Guid.Empty)
            return Result<Task>.Failure(Error.Validation("Task.OwnerId", "Owner is required"));

        if (dueDate.HasValue && dueDate.Value < DateTime.UtcNow.Date)
            return Result<Task>.Failure(Error.Validation("Task.DueDate", "Due date cannot be in the past"));

        var task = new Task
        {
            Id = Guid.NewGuid(),
            Subject = subject,
            Description = description,
            Status = Enums.TaskStatus.NotStarted,
            Priority = priority,
            DueDate = dueDate,
            OwnerId = ownerId,
            CompletionPercentage = 0,
            IsRecurring = false,
            IsMilestone = false,
            CreatedAt = DateTime.UtcNow
        };

        task.SetTenantId(tenantId);
        task._assignedUserIds.Add(ownerId);

        return Result<Task>.Success(task);
    }

    /// <summary>
    /// Updates task details
    /// </summary>
    public Result UpdateDetails(
        string subject,
        string? description,
        TaskPriority priority,
        DateTime? dueDate,
        DateTime? startDate)
    {
        if (string.IsNullOrWhiteSpace(subject))
            return Result.Failure(Error.Validation("Task.Subject", "Subject is required"));

        if (Status == Enums.TaskStatus.Completed)
            return Result.Failure(Error.Conflict("Task.Status", "Cannot update a completed task"));

        if (dueDate.HasValue && startDate.HasValue && dueDate.Value < startDate.Value)
            return Result.Failure(Error.Validation("Task.Dates", "Due date cannot be before start date"));

        Subject = subject;
        Description = description;
        Priority = priority;
        DueDate = dueDate;
        StartDate = startDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates task status
    /// </summary>
    public Result UpdateStatus(Enums.TaskStatus status)
    {
        if (Status == Enums.TaskStatus.Completed && status != Enums.TaskStatus.Completed)
            return Result.Failure(Error.Conflict("Task.Status", "Cannot reopen a completed task"));

        var oldStatus = Status;
        Status = status;

        if (status == Enums.TaskStatus.Completed && oldStatus != Enums.TaskStatus.Completed)
        {
            CompletedDate = DateTime.UtcNow;
            CompletionPercentage = 100;
        }
        else if (status == Enums.TaskStatus.InProgress && CompletionPercentage == 0)
        {
            CompletionPercentage = 25;
        }
        else if (status == Enums.TaskStatus.NotStarted)
        {
            CompletionPercentage = 0;
            CompletedDate = null;
        }

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Updates completion percentage
    /// </summary>
    public Result UpdateProgress(int percentage)
    {
        if (percentage < 0 || percentage > 100)
            return Result.Failure(Error.Validation("Task.CompletionPercentage", "Percentage must be between 0 and 100"));

        if (Status == Enums.TaskStatus.Completed && percentage < 100)
            return Result.Failure(Error.Conflict("Task.Status", "Cannot reduce progress of a completed task"));

        CompletionPercentage = percentage;

        if (percentage == 100 && Status != Enums.TaskStatus.Completed)
        {
            Status = Enums.TaskStatus.Completed;
            CompletedDate = DateTime.UtcNow;
        }
        else if (percentage > 0 && percentage < 100 && Status == Enums.TaskStatus.NotStarted)
        {
            Status = Enums.TaskStatus.InProgress;
        }

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Assigns task to users
    /// </summary>
    public Result AssignTo(params Guid[] userIds)
    {
        if (userIds == null || userIds.Length == 0)
            return Result.Failure(Error.Validation("Task.AssignedUsers", "At least one user must be assigned"));

        foreach (var userId in userIds)
        {
            if (userId == Guid.Empty)
                return Result.Failure(Error.Validation("Task.AssignedUsers", "Invalid user ID"));

            if (!_assignedUserIds.Contains(userId))
                _assignedUserIds.Add(userId);
        }

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Unassigns task from users
    /// </summary>
    public Result UnassignFrom(params Guid[] userIds)
    {
        if (userIds == null || userIds.Length == 0)
            return Result.Failure(Error.Validation("Task.AssignedUsers", "At least one user must be specified"));

        foreach (var userId in userIds)
        {
            if (userId == OwnerId)
                return Result.Failure(Error.Conflict("Task.AssignedUsers", "Cannot unassign the owner"));

            _assignedUserIds.Remove(userId);
        }

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Sets related entity
    /// </summary>
    public Result SetRelatedEntity(RelatedEntityType entityType, Guid entityId)
    {
        if (entityId == Guid.Empty)
            return Result.Failure(Error.Validation("Task.RelatedEntity", "Invalid entity ID"));

        RelatedEntityType = entityType;
        RelatedEntityId = entityId;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sets reminder
    /// </summary>
    public Result SetReminder(DateTime reminderDate)
    {
        if (reminderDate < DateTime.UtcNow)
            return Result.Failure(Error.Validation("Task.ReminderDate", "Reminder date cannot be in the past"));

        if (DueDate.HasValue && reminderDate > DueDate.Value)
            return Result.Failure(Error.Validation("Task.ReminderDate", "Reminder date cannot be after due date"));

        ReminderDate = reminderDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates estimated hours
    /// </summary>
    public Result UpdateEstimatedHours(decimal hours)
    {
        if (hours < 0)
            return Result.Failure(Error.Validation("Task.EstimatedHours", "Estimated hours cannot be negative"));

        EstimatedHours = hours;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates actual hours
    /// </summary>
    public Result UpdateActualHours(decimal hours)
    {
        if (hours < 0)
            return Result.Failure(Error.Validation("Task.ActualHours", "Actual hours cannot be negative"));

        ActualHours = hours;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sets as milestone
    /// </summary>
    public Result SetAsMilestone(bool isMilestone)
    {
        IsMilestone = isMilestone;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Sets recurrence pattern
    /// </summary>
    public Result SetRecurrence(RecurrencePattern pattern)
    {
        if (pattern == null)
            return Result.Failure(Error.Validation("Task.RecurrencePattern", "Recurrence pattern is required"));

        IsRecurring = true;
        RecurrencePattern = pattern;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Removes recurrence
    /// </summary>
    public Result RemoveRecurrence()
    {
        IsRecurring = false;
        RecurrencePattern = null;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Adds a note
    /// </summary>
    public Result AddNote(Note note)
    {
        if (note == null)
            return Result.Failure(Error.Validation("Task.Note", "Note cannot be null"));

        _notes.Add(note);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }
}

/// <summary>
/// Value object for recurrence pattern
/// </summary>
public class RecurrencePattern
{
    public RecurrenceType Type { get; private set; }
    public int Interval { get; private set; }
    public DayOfWeek[]? DaysOfWeek { get; private set; }
    public int? DayOfMonth { get; private set; }
    public int? MonthOfYear { get; private set; }
    public DateTime? EndDate { get; private set; }
    public int? Occurrences { get; private set; }

    private RecurrencePattern() { }

    public static RecurrencePattern Daily(int interval, DateTime? endDate = null)
    {
        return new RecurrencePattern
        {
            Type = RecurrenceType.Daily,
            Interval = interval,
            EndDate = endDate
        };
    }

    public static RecurrencePattern Weekly(int interval, DayOfWeek[] daysOfWeek, DateTime? endDate = null)
    {
        return new RecurrencePattern
        {
            Type = RecurrenceType.Weekly,
            Interval = interval,
            DaysOfWeek = daysOfWeek,
            EndDate = endDate
        };
    }

    public static RecurrencePattern Monthly(int interval, int dayOfMonth, DateTime? endDate = null)
    {
        return new RecurrencePattern
        {
            Type = RecurrenceType.Monthly,
            Interval = interval,
            DayOfMonth = dayOfMonth,
            EndDate = endDate
        };
    }

    public static RecurrencePattern Yearly(int interval, int dayOfMonth, int monthOfYear, DateTime? endDate = null)
    {
        return new RecurrencePattern
        {
            Type = RecurrenceType.Yearly,
            Interval = interval,
            DayOfMonth = dayOfMonth,
            MonthOfYear = monthOfYear,
            EndDate = endDate
        };
    }
}