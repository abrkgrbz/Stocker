using Stocker.Infrastructure.Alerts.Domain;
using Stocker.SharedKernel.Results;

namespace Stocker.Infrastructure.Alerts.Interfaces;

/// <summary>
/// Central alert service interface for creating and managing alerts across all modules.
/// </summary>
public interface IAlertService
{
    /// <summary>
    /// Creates and persists a new alert, optionally sending real-time notification.
    /// </summary>
    Task<Result<AlertEntity>> CreateAlertAsync(AlertEntity alert, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates multiple alerts in batch.
    /// </summary>
    Task<Result<IReadOnlyList<AlertEntity>>> CreateAlertsAsync(IEnumerable<AlertEntity> alerts, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets alerts for a specific user with optional filtering.
    /// </summary>
    Task<Result<IReadOnlyList<AlertDto>>> GetUserAlertsAsync(
        Guid tenantId,
        Guid userId,
        AlertFilterOptions? options = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unread alert count for a user.
    /// </summary>
    Task<Result<int>> GetUnreadCountAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks an alert as read.
    /// </summary>
    Task<Result> MarkAsReadAsync(int alertId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks multiple alerts as read.
    /// </summary>
    Task<Result> MarkAllAsReadAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Dismisses an alert.
    /// </summary>
    Task<Result> DismissAlertAsync(int alertId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes expired alerts (cleanup job).
    /// </summary>
    Task<Result<int>> CleanupExpiredAlertsAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Alert DTO for API responses
/// </summary>
public record AlertDto
{
    public int Id { get; init; }
    public AlertCategory Category { get; init; }
    public AlertSeverity Severity { get; init; }
    public string SourceModule { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? ActionUrl { get; init; }
    public string? ActionLabel { get; init; }
    public string? RelatedEntityType { get; init; }
    public Guid? RelatedEntityId { get; init; }
    public bool IsRead { get; init; }
    public DateTime? ReadAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? ExpiresAt { get; init; }

    public static AlertDto FromEntity(AlertEntity entity) => new()
    {
        Id = entity.Id,
        Category = entity.Category,
        Severity = entity.Severity,
        SourceModule = entity.SourceModule,
        Title = entity.Title,
        Message = entity.Message,
        ActionUrl = entity.ActionUrl,
        ActionLabel = entity.ActionLabel,
        RelatedEntityType = entity.RelatedEntityType,
        RelatedEntityId = entity.RelatedEntityId,
        IsRead = entity.IsRead,
        ReadAt = entity.ReadAt,
        CreatedAt = entity.CreatedDate,
        ExpiresAt = entity.ExpiresAt
    };
}

/// <summary>
/// Filter options for querying alerts
/// </summary>
public record AlertFilterOptions
{
    public AlertCategory? Category { get; init; }
    public AlertSeverity? MinSeverity { get; init; }
    public string? SourceModule { get; init; }
    public bool? IsRead { get; init; }
    public bool IncludeDismissed { get; init; } = false;
    public bool IncludeExpired { get; init; } = false;
    public int? Limit { get; init; } = 50;
    public int? Offset { get; init; } = 0;
}
