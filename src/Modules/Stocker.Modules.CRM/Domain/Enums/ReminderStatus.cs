namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Status of a reminder
/// </summary>
public enum ReminderStatus
{
    /// <summary>
    /// Reminder scheduled but not triggered yet
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Reminder has been snoozed
    /// </summary>
    Snoozed = 1,

    /// <summary>
    /// Reminder triggered and notification sent
    /// </summary>
    Triggered = 2,

    /// <summary>
    /// Reminder marked as completed
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Reminder dismissed by user
    /// </summary>
    Dismissed = 4
}
