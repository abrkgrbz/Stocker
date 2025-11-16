using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.Features.Notifications.Queries.GetNotifications;

public record NotificationResponse(
    int Id,
    NotificationType Type,
    string Title,
    string Message,
    NotificationChannel Channel,
    NotificationStatus Status,
    int? RelatedEntityId,
    string? RelatedEntityType,
    bool IsRead,
    DateTime CreatedAt,
    DateTime? ReadAt
);

public record GetNotificationsResponse(
    List<NotificationResponse> Notifications,
    int TotalCount,
    int UnreadCount
);
