using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Services.Reminders;

/// <summary>
/// Service for managing and triggering reminders
/// </summary>
public interface IReminderService
{
    /// <summary>
    /// Check and trigger due reminders
    /// </summary>
    Task<Result> ProcessDueRemindersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notifications for a triggered reminder
    /// </summary>
    Task<Result> SendReminderNotificationsAsync(int reminderId, CancellationToken cancellationToken = default);
}
