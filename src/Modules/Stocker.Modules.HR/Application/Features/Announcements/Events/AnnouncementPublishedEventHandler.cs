using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Tenant.Entities;
using Stocker.Shared.Events.HR;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.Modules.HR.Application.Features.Announcements.Events;

/// <summary>
/// Handles the AnnouncementPublishedEvent to create notifications for users
/// </summary>
public class AnnouncementPublishedEventHandler : INotificationHandler<AnnouncementPublishedEvent>
{
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly INotificationService _notificationService;
    private readonly ILogger<AnnouncementPublishedEventHandler> _logger;

    public AnnouncementPublishedEventHandler(
        ITenantDbContextFactory tenantDbContextFactory,
        INotificationService notificationService,
        ILogger<AnnouncementPublishedEventHandler> logger)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(AnnouncementPublishedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation(
                "Processing AnnouncementPublishedEvent for announcement {AnnouncementId} in tenant {TenantId}",
                notification.AnnouncementId,
                notification.TenantId);

            // Create tenant notification in database
            await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(notification.TenantId);

            // Determine notification priority based on announcement priority
            var notificationPriority = notification.Priority switch
            {
                "Critical" => NotificationPriority.Critical,
                "High" => NotificationPriority.High,
                "Normal" => NotificationPriority.Normal,
                "Low" => NotificationPriority.Low,
                _ => NotificationPriority.Normal
            };

            // Create notification - either global or department-specific
            TenantNotification tenantNotification;

            if (notification.TargetDepartmentId.HasValue)
            {
                // Department-specific announcement
                tenantNotification = TenantNotification.CreateRoleNotification(
                    title: $"📢 {notification.Title}",
                    message: GetNotificationMessage(notification),
                    type: NotificationType.Announcement,
                    targetRole: $"department-{notification.TargetDepartmentId.Value}",
                    createdBy: notification.AuthorName
                );
            }
            else
            {
                // Global announcement for all users in tenant
                tenantNotification = TenantNotification.CreateGlobalNotification(
                    title: $"📢 {notification.Title}",
                    message: GetNotificationMessage(notification),
                    type: NotificationType.Announcement,
                    createdBy: notification.AuthorName
                );
            }

            // Configure notification
            tenantNotification.SetPriority(notificationPriority);
            tenantNotification.SetAction($"/hr/announcements/{notification.AnnouncementId}", "Duyuruyu Görüntüle");
            tenantNotification.SetIcon("notification", GetPriorityColor(notification.Priority));
            tenantNotification.SetSource(
                NotificationSource.Application,
                entityType: "Announcement",
                entityId: Guid.NewGuid(), // We use int for announcement ID but need Guid here
                eventType: "AnnouncementPublished"
            );
            tenantNotification.AddTag("announcement");
            tenantNotification.AddTag(notification.AnnouncementType.ToLowerInvariant());

            if (notification.RequiresAcknowledgment)
            {
                tenantNotification.RequireAcknowledgment(allowDismiss: false);
            }

            if (notification.ExpiryDate.HasValue)
            {
                tenantNotification.SetExpiration(notification.ExpiryDate.Value);
            }

            // Save to database
            tenantContext.TenantNotifications.Add(tenantNotification);
            await tenantContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Created TenantNotification {NotificationId} for announcement {AnnouncementId}",
                tenantNotification.Id,
                notification.AnnouncementId);

            // Send real-time notification via SignalR
            var signalRMessage = new
            {
                Id = tenantNotification.Id,
                Title = tenantNotification.Title,
                Message = tenantNotification.Message,
                Type = "announcement",
                Priority = notification.Priority.ToLowerInvariant(),
                AnnouncementId = notification.AnnouncementId,
                AuthorName = notification.AuthorName,
                RequiresAcknowledgment = notification.RequiresAcknowledgment,
                ActionUrl = $"/hr/announcements/{notification.AnnouncementId}",
                CreatedAt = DateTime.UtcNow,
                Icon = "bell"
            };

            if (notification.TargetDepartmentId.HasValue)
            {
                // Send to department group
                await _notificationService.SendToGroupAsync(
                    $"department-{notification.TargetDepartmentId.Value}",
                    signalRMessage);
            }
            else
            {
                // Send to all users in tenant
                await _notificationService.SendToTenantAsync(
                    notification.TenantId.ToString(),
                    signalRMessage);
            }

            _logger.LogInformation(
                "Sent real-time notification for announcement {AnnouncementId} to tenant {TenantId}",
                notification.AnnouncementId,
                notification.TenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error processing AnnouncementPublishedEvent for announcement {AnnouncementId}",
                notification.AnnouncementId);

            // Don't throw - notification failure shouldn't fail the announcement publishing
        }
    }

    private static string GetNotificationMessage(AnnouncementPublishedEvent notification)
    {
        var message = notification.Content;

        // Truncate if too long
        if (message.Length > 150)
        {
            message = message[..147] + "...";
        }

        return message;
    }

    private static string GetPriorityColor(string priority)
    {
        return priority switch
        {
            "Critical" => "#ef4444", // Red
            "High" => "#f97316",     // Orange
            "Normal" => "#3b82f6",   // Blue
            "Low" => "#6b7280",      // Gray
            _ => "#8b5cf6"           // Violet (default)
        };
    }
}
