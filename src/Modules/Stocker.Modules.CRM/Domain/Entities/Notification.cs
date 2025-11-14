using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a notification sent to a user
/// </summary>
public class Notification : BaseEntity
{
    public Guid TenantId { get; private set; }
    public Guid UserId { get; private set; }
    public NotificationType Type { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public NotificationChannel Channel { get; private set; }
    public NotificationStatus Status { get; private set; }
    public int? RelatedEntityId { get; private set; }
    public string? RelatedEntityType { get; private set; }
    public DateTime? ReadAt { get; private set; }
    public DateTime? SentAt { get; private set; }
    public string? ErrorMessage { get; private set; }
    public string? Metadata { get; private set; } // JSON data

    // EF Core constructor
    private Notification() { }

    private Notification(
        Guid tenantId,
        Guid userId,
        NotificationType type,
        string title,
        string message,
        NotificationChannel channel,
        int? relatedEntityId = null,
        string? relatedEntityType = null,
        string? metadata = null)
    {
        TenantId = tenantId;
        UserId = userId;
        Type = type;
        Title = title;
        Message = message;
        Channel = channel;
        Status = NotificationStatus.Pending;
        RelatedEntityId = relatedEntityId;
        RelatedEntityType = relatedEntityType;
        Metadata = metadata;
    }

    public static Result<Notification> Create(
        Guid tenantId,
        Guid userId,
        NotificationType type,
        string title,
        string message,
        NotificationChannel channel,
        int? relatedEntityId = null,
        string? relatedEntityType = null,
        string? metadata = null)
    {
        if (tenantId == Guid.Empty)
            return Result<Notification>.Failure(Error.Validation("Notification", "Tenant ID is required"));

        if (userId == Guid.Empty)
            return Result<Notification>.Failure(Error.Validation("Notification", "User ID is required"));

        if (string.IsNullOrWhiteSpace(title))
            return Result<Notification>.Failure(Error.Validation("Notification", "Title is required"));

        if (string.IsNullOrWhiteSpace(message))
            return Result<Notification>.Failure(Error.Validation("Notification", "Message is required"));

        var notification = new Notification(tenantId, userId, type, title, message, channel,
            relatedEntityId, relatedEntityType, metadata);
        return Result<Notification>.Success(notification);
    }

    public Result MarkAsSent()
    {
        if (Status == NotificationStatus.Sent)
            return Result.Failure(Error.Validation("Notification", "Notification already sent"));

        Status = NotificationStatus.Sent;
        SentAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarkAsFailed(string errorMessage)
    {
        Status = NotificationStatus.Failed;
        ErrorMessage = errorMessage;
        return Result.Success();
    }

    public Result MarkAsRead()
    {
        if (ReadAt.HasValue)
            return Result.Failure(Error.Validation("Notification", "Notification already read"));

        ReadAt = DateTime.UtcNow;
        return Result.Success();
    }
}
