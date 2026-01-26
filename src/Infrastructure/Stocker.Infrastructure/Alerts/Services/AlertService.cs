using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Infrastructure.Alerts.Domain;
using Stocker.Infrastructure.Alerts.Interfaces;
using Stocker.Infrastructure.Alerts.Persistence;
using Stocker.SharedKernel.Results;
using Stocker.SignalR.Models.Notifications;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.Infrastructure.Alerts.Services;

/// <summary>
/// Central alert service implementation.
/// Handles alert persistence and real-time notification dispatch.
/// </summary>
public class AlertService : IAlertService
{
    private readonly AlertDbContext _dbContext;
    private readonly ITenantNotificationService _tenantNotificationService;
    private readonly IUserNotificationService _userNotificationService;
    private readonly IRoleNotificationService _roleNotificationService;
    private readonly ILogger<AlertService> _logger;

    public AlertService(
        AlertDbContext dbContext,
        ITenantNotificationService tenantNotificationService,
        IUserNotificationService userNotificationService,
        IRoleNotificationService roleNotificationService,
        ILogger<AlertService> logger)
    {
        _dbContext = dbContext;
        _tenantNotificationService = tenantNotificationService;
        _userNotificationService = userNotificationService;
        _roleNotificationService = roleNotificationService;
        _logger = logger;
    }

    public async Task<Result<AlertEntity>> CreateAlertAsync(AlertEntity alert, CancellationToken cancellationToken = default)
    {
        try
        {
            await _dbContext.Alerts.AddAsync(alert, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Alert created: {AlertId} - {Category}/{Severity} - {Title}",
                alert.Id, alert.Category, alert.Severity, alert.Title);

            // Send real-time notification if configured
            if (alert.SendRealTime)
            {
                await SendRealTimeNotificationAsync(alert, cancellationToken);
            }

            return Result<AlertEntity>.Success(alert);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create alert: {Title}", alert.Title);
            return Result<AlertEntity>.Failure(Error.Failure("Alert.CreateFailed", "Bildirim oluşturulamadı."));
        }
    }

    public async Task<Result<IReadOnlyList<AlertEntity>>> CreateAlertsAsync(
        IEnumerable<AlertEntity> alerts,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var alertList = alerts.ToList();
            await _dbContext.Alerts.AddRangeAsync(alertList, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created {Count} alerts in batch", alertList.Count);

            // Send real-time notifications
            foreach (var alert in alertList.Where(a => a.SendRealTime))
            {
                await SendRealTimeNotificationAsync(alert, cancellationToken);
            }

            return Result<IReadOnlyList<AlertEntity>>.Success(alertList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create alerts batch");
            return Result<IReadOnlyList<AlertEntity>>.Failure(Error.Failure("Alert.BatchCreateFailed", "Toplu bildirim oluşturulamadı."));
        }
    }

    public async Task<Result<IReadOnlyList<AlertDto>>> GetUserAlertsAsync(
        Guid tenantId,
        Guid userId,
        AlertFilterOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            options ??= new AlertFilterOptions();

            var query = _dbContext.Alerts
                .AsNoTracking()
                .Where(a => a.TenantId == tenantId)
                .Where(a => a.UserId == null || a.UserId == userId); // User-specific or tenant-wide

            // Apply filters
            if (options.Category.HasValue)
                query = query.Where(a => a.Category == options.Category.Value);

            if (options.MinSeverity.HasValue)
                query = query.Where(a => a.Severity >= options.MinSeverity.Value);

            if (!string.IsNullOrEmpty(options.SourceModule))
                query = query.Where(a => a.SourceModule == options.SourceModule);

            if (options.IsRead.HasValue)
                query = query.Where(a => a.IsRead == options.IsRead.Value);

            if (!options.IncludeDismissed)
                query = query.Where(a => !a.IsDismissed);

            if (!options.IncludeExpired)
                query = query.Where(a => a.ExpiresAt == null || a.ExpiresAt > DateTime.UtcNow);

            // Order by severity (desc) then by created date (desc)
            query = query
                .OrderByDescending(a => a.Severity)
                .ThenByDescending(a => a.CreatedDate);

            // Apply pagination
            if (options.Offset.HasValue && options.Offset > 0)
                query = query.Skip(options.Offset.Value);

            if (options.Limit.HasValue && options.Limit > 0)
                query = query.Take(options.Limit.Value);

            var alerts = await query.ToListAsync(cancellationToken);
            var dtos = alerts.Select(AlertDto.FromEntity).ToList();

            return Result<IReadOnlyList<AlertDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get alerts for user {UserId}", userId);
            return Result<IReadOnlyList<AlertDto>>.Failure(Error.Failure("Alert.GetFailed", "Bildirimler alınamadı."));
        }
    }

    public async Task<Result<int>> GetUnreadCountAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var count = await _dbContext.Alerts
                .AsNoTracking()
                .Where(a => a.TenantId == tenantId)
                .Where(a => a.UserId == null || a.UserId == userId)
                .Where(a => !a.IsRead && !a.IsDismissed)
                .Where(a => a.ExpiresAt == null || a.ExpiresAt > DateTime.UtcNow)
                .CountAsync(cancellationToken);

            return Result<int>.Success(count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get unread count for user {UserId}", userId);
            return Result<int>.Failure(Error.Failure("Alert.CountFailed", "Okunmamış bildirim sayısı alınamadı."));
        }
    }

    public async Task<Result> MarkAsReadAsync(int alertId, Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var alert = await _dbContext.Alerts
                .FirstOrDefaultAsync(a => a.Id == alertId && (a.UserId == null || a.UserId == userId), cancellationToken);

            if (alert == null)
                return Result.Failure(Error.NotFound("Alert.NotFound", "Bildirim bulunamadı."));

            alert.MarkAsRead();
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark alert {AlertId} as read", alertId);
            return Result.Failure(Error.Failure("Alert.MarkReadFailed", "Bildirim okundu olarak işaretlenemedi."));
        }
    }

    public async Task<Result> MarkAllAsReadAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var alerts = await _dbContext.Alerts
                .Where(a => a.TenantId == tenantId)
                .Where(a => a.UserId == null || a.UserId == userId)
                .Where(a => !a.IsRead && !a.IsDismissed)
                .ToListAsync(cancellationToken);

            foreach (var alert in alerts)
            {
                alert.MarkAsRead();
            }

            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Marked {Count} alerts as read for user {UserId}", alerts.Count, userId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark all alerts as read for user {UserId}", userId);
            return Result.Failure(Error.Failure("Alert.MarkAllReadFailed", "Tüm bildirimler okundu olarak işaretlenemedi."));
        }
    }

    public async Task<Result> DismissAlertAsync(int alertId, Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var alert = await _dbContext.Alerts
                .FirstOrDefaultAsync(a => a.Id == alertId && (a.UserId == null || a.UserId == userId), cancellationToken);

            if (alert == null)
                return Result.Failure(Error.NotFound("Alert.NotFound", "Bildirim bulunamadı."));

            alert.Dismiss();
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to dismiss alert {AlertId}", alertId);
            return Result.Failure(Error.Failure("Alert.DismissFailed", "Bildirim kaldırılamadı."));
        }
    }

    public async Task<Result<int>> CleanupExpiredAlertsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-30); // Keep alerts for 30 days after expiry

            var expiredAlerts = await _dbContext.Alerts
                .Where(a => a.ExpiresAt.HasValue && a.ExpiresAt < cutoffDate)
                .ToListAsync(cancellationToken);

            _dbContext.Alerts.RemoveRange(expiredAlerts);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Cleaned up {Count} expired alerts", expiredAlerts.Count);

            return Result<int>.Success(expiredAlerts.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup expired alerts");
            return Result<int>.Failure(Error.Failure("Alert.CleanupFailed", "Süresi dolmuş bildirimler temizlenemedi."));
        }
    }

    private async Task SendRealTimeNotificationAsync(AlertEntity alert, CancellationToken cancellationToken)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Id = Guid.NewGuid(),
                Title = alert.Title,
                Message = alert.Message,
                Type = MapToNotificationType(alert.Category),
                Priority = MapToPriority(alert.Severity),
                CreatedAt = DateTime.UtcNow,
                Data = new Dictionary<string, object>
                {
                    ["alertId"] = alert.Id,
                    ["category"] = alert.Category.ToString(),
                    ["severity"] = alert.Severity.ToString(),
                    ["sourceModule"] = alert.SourceModule,
                    ["actionUrl"] = alert.ActionUrl ?? string.Empty,
                    ["actionLabel"] = alert.ActionLabel ?? string.Empty,
                    ["relatedEntityType"] = alert.RelatedEntityType ?? string.Empty,
                    ["relatedEntityId"] = alert.RelatedEntityId?.ToString() ?? string.Empty
                }
            };

            // Route notification based on targeting
            if (alert.UserId.HasValue)
            {
                await _userNotificationService.SendToUserAsync(alert.UserId.Value.ToString(), "NewAlert", notification);
            }
            else if (!string.IsNullOrEmpty(alert.TargetRole))
            {
                await _roleNotificationService.SendToRoleAsync(alert.TargetRole, "NewAlert", notification);
            }
            else
            {
                await _tenantNotificationService.SendToTenantAsync(alert.TenantId.ToString(), "NewAlert", notification);
            }

            _logger.LogDebug("Real-time notification sent for alert {AlertId}", alert.Id);
        }
        catch (Exception ex)
        {
            // Don't fail the alert creation if real-time notification fails
            _logger.LogWarning(ex, "Failed to send real-time notification for alert {AlertId}", alert.Id);
        }
    }

    private static NotificationType MapToNotificationType(AlertCategory category)
    {
        return category switch
        {
            AlertCategory.Order or AlertCategory.Quotation or AlertCategory.Invoice
                or AlertCategory.Contract or AlertCategory.Payment or AlertCategory.Shipment
                or AlertCategory.Return => NotificationType.Order,
            AlertCategory.Stock or AlertCategory.Warehouse or AlertCategory.Product
                => NotificationType.Inventory,
            AlertCategory.Customer or AlertCategory.Lead or AlertCategory.Opportunity
                => NotificationType.CRM,
            AlertCategory.Employee or AlertCategory.Payroll
                => NotificationType.HR,
            AlertCategory.Budget or AlertCategory.Credit
                => NotificationType.Payment,
            _ => NotificationType.System
        };
    }

    private static NotificationPriority MapToPriority(AlertSeverity severity)
    {
        return severity switch
        {
            AlertSeverity.Critical => NotificationPriority.Urgent,
            AlertSeverity.High => NotificationPriority.High,
            AlertSeverity.Medium => NotificationPriority.Normal,
            _ => NotificationPriority.Low
        };
    }
}
