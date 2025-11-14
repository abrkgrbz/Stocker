using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Email;
using Stocker.Modules.CRM.Application.Services.Reminders;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Infrastructure.Services.Reminders;

/// <summary>
/// Service for processing and triggering reminders
/// </summary>
public class ReminderService : IReminderService
{
    private readonly CRMDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<ReminderService> _logger;

    public ReminderService(
        CRMDbContext context,
        IEmailService emailService,
        ILogger<ReminderService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result> ProcessDueRemindersAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;

            // Get pending or snoozed reminders that are due
            var dueReminders = await _context.Reminders
                .Where(r =>
                    (r.Status == ReminderStatus.Pending && r.RemindAt <= now) ||
                    (r.Status == ReminderStatus.Snoozed && r.SnoozedUntil <= now))
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Processing {Count} due reminders", dueReminders.Count);

            foreach (var reminder in dueReminders)
            {
                if (reminder.ShouldTrigger())
                {
                    reminder.Trigger();

                    // Create notification
                    var notificationResult = Domain.Entities.Notification.Create(
                        tenantId: reminder.TenantId,
                        userId: reminder.UserId,
                        type: NotificationType.Task,
                        title: $"⏰ Hatırlatıcı: {reminder.Title}",
                        message: reminder.Description ?? reminder.Title,
                        channel: NotificationChannel.InApp,
                        relatedEntityId: reminder.Id,
                        relatedEntityType: "Reminder"
                    );

                    if (notificationResult.IsSuccess)
                    {
                        var notification = notificationResult.Value;
                        _context.Notifications.Add(notification);

                        // Send email if requested
                        if (reminder.SendEmail)
                        {
                            await SendReminderEmailAsync(reminder, cancellationToken);
                        }

                        // Send push notification if requested
                        if (reminder.SendPush)
                        {
                            // TODO: Implement push notification when Web Push API is integrated
                            _logger.LogInformation("Push notification requested for reminder {ReminderId}", reminder.Id);
                        }
                    }
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Processed {Count} reminders successfully", dueReminders.Count);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing due reminders");
            return Result.Failure(Error.Failure("Reminder.Process", $"Failed to process reminders: {ex.Message}"));
        }
    }

    public async Task<Result> SendReminderNotificationsAsync(int reminderId, CancellationToken cancellationToken = default)
    {
        try
        {
            var reminder = await _context.Reminders.FindAsync(new object[] { reminderId }, cancellationToken);
            if (reminder == null)
            {
                return Result.Failure(Error.NotFound("Reminder", $"Reminder with ID {reminderId} not found"));
            }

            if (reminder.SendEmail)
            {
                await SendReminderEmailAsync(reminder, cancellationToken);
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending reminder notifications for reminder {ReminderId}", reminderId);
            return Result.Failure(Error.Failure("Reminder.Notify", $"Failed to send notifications: {ex.Message}"));
        }
    }

    private async Task SendReminderEmailAsync(Domain.Entities.Reminder reminder, CancellationToken cancellationToken)
    {
        try
        {
            // TODO: Get user email from user service
            var userEmail = "user@example.com"; // Placeholder

            var subject = $"⏰ Hatırlatıcı: {reminder.Title}";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }}
        .reminder-icon {{ font-size: 48px; margin-bottom: 10px; }}
        .reminder-time {{ background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='reminder-icon'>⏰</div>
            <h1>Hatırlatıcı</h1>
        </div>

        <h2>{reminder.Title}</h2>

        {(string.IsNullOrEmpty(reminder.Description) ? "" : $"<p>{reminder.Description}</p>")}

        <div class='reminder-time'>
            <strong>📅 Hatırlatma Zamanı:</strong><br>
            {reminder.RemindAt:dd.MM.yyyy HH:mm}
        </div>

        <p><strong>Tip:</strong> {GetReminderTypeLabel(reminder.Type)}</p>

        <div class='footer'>
            <p>© 2025 Stocker CRM. Bu email otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";

            var message = new EmailMessage(
                To: userEmail,
                Subject: subject,
                Body: body,
                IsHtml: true
            );

            var result = await _emailService.SendEmailAsync(message, cancellationToken);
            if (result.IsSuccess)
            {
                _logger.LogInformation("Reminder email sent for reminder {ReminderId}", reminder.Id);
            }
            else
            {
                _logger.LogError("Failed to send reminder email for reminder {ReminderId}: {Error}",
                    reminder.Id, result.ErrorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending reminder email for reminder {ReminderId}", reminder.Id);
        }
    }

    private static string GetReminderTypeLabel(ReminderType type)
    {
        return type switch
        {
            ReminderType.General => "Genel",
            ReminderType.Task => "Görev",
            ReminderType.Meeting => "Toplantı",
            ReminderType.FollowUp => "Takip",
            ReminderType.Birthday => "Doğum Günü",
            ReminderType.ContractRenewal => "Sözleşme Yenileme",
            ReminderType.PaymentDue => "Ödeme Vadesi",
            _ => "Diğer"
        };
    }
}
