using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Implementation of backup notification service using email and SignalR
/// </summary>
public class BackupNotificationService : IBackupNotificationService
{
    private readonly IEmailService _emailService;
    private readonly ITenantNotificationService _tenantNotificationService;
    private readonly IMasterDbContext _masterDbContext;
    private readonly BackupNotificationSettings _settings;
    private readonly ILogger<BackupNotificationService> _logger;

    public BackupNotificationService(
        IEmailService emailService,
        ITenantNotificationService tenantNotificationService,
        IMasterDbContext masterDbContext,
        IOptions<BackupNotificationSettings> settings,
        ILogger<BackupNotificationService> logger)
    {
        _emailService = emailService;
        _tenantNotificationService = tenantNotificationService;
        _masterDbContext = masterDbContext;
        _settings = settings.Value;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Result> NotifyBackupStartedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        string backupType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Send real-time notification
            if (_settings.EnableRealtimeNotifications)
            {
                await _tenantNotificationService.SendToTenantAsync(
                    tenantId.ToString(),
                    "BackupStarted",
                    new BackupNotification
                    {
                        Type = "BackupStarted",
                        BackupId = backupId,
                        BackupName = backupName,
                        BackupType = backupType,
                        Status = "InProgress",
                        Timestamp = DateTime.UtcNow,
                        Message = $"Yedekleme başladı: {backupName}"
                    });
            }

            // Send email notification if enabled
            if (_settings.EnableEmailNotifications && _settings.NotifyOnStart)
            {
                await SendBackupEmailAsync(
                    tenantId,
                    $"Yedekleme Başladı: {backupName}",
                    GetBackupStartedEmailBody(backupName, backupType),
                    cancellationToken);
            }

            _logger.LogDebug(
                "Backup started notification sent. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to send backup started notification. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result.Failure(Error.Failure("Notification.Failed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Result> NotifyBackupCompletedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        string backupType,
        long sizeInBytes,
        TimeSpan duration,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var sizeFormatted = FormatFileSize(sizeInBytes);
            var durationFormatted = FormatDuration(duration);

            // Send real-time notification
            if (_settings.EnableRealtimeNotifications)
            {
                await _tenantNotificationService.SendToTenantAsync(
                    tenantId.ToString(),
                    "BackupCompleted",
                    new BackupNotification
                    {
                        Type = "BackupCompleted",
                        BackupId = backupId,
                        BackupName = backupName,
                        BackupType = backupType,
                        Status = "Completed",
                        SizeInBytes = sizeInBytes,
                        Duration = duration,
                        Timestamp = DateTime.UtcNow,
                        Message = $"Yedekleme tamamlandı: {backupName} ({sizeFormatted})"
                    });
            }

            // Send email notification if enabled
            if (_settings.EnableEmailNotifications && _settings.NotifyOnComplete)
            {
                await SendBackupEmailAsync(
                    tenantId,
                    $"Yedekleme Tamamlandı: {backupName}",
                    GetBackupCompletedEmailBody(backupName, backupType, sizeFormatted, durationFormatted),
                    cancellationToken);
            }

            _logger.LogInformation(
                "Backup completed notification sent. TenantId: {TenantId}, BackupId: {BackupId}, Size: {Size}",
                tenantId, backupId, sizeFormatted);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to send backup completed notification. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result.Failure(Error.Failure("Notification.Failed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Result> NotifyBackupFailedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        string backupType,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Send real-time notification
            if (_settings.EnableRealtimeNotifications)
            {
                await _tenantNotificationService.SendToTenantAsync(
                    tenantId.ToString(),
                    "BackupFailed",
                    new BackupNotification
                    {
                        Type = "BackupFailed",
                        BackupId = backupId,
                        BackupName = backupName,
                        BackupType = backupType,
                        Status = "Failed",
                        ErrorMessage = errorMessage,
                        Timestamp = DateTime.UtcNow,
                        Message = $"Yedekleme başarısız: {backupName}"
                    });
            }

            // Send email notification if enabled (always for failures)
            if (_settings.EnableEmailNotifications && _settings.NotifyOnFailure)
            {
                await SendBackupEmailAsync(
                    tenantId,
                    $"Yedekleme Başarısız: {backupName}",
                    GetBackupFailedEmailBody(backupName, backupType, errorMessage),
                    cancellationToken);
            }

            _logger.LogWarning(
                "Backup failed notification sent. TenantId: {TenantId}, BackupId: {BackupId}, Error: {Error}",
                tenantId, backupId, errorMessage);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to send backup failed notification. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result.Failure(Error.Failure("Notification.Failed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Result> NotifyRestoreStartedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (_settings.EnableRealtimeNotifications)
            {
                await _tenantNotificationService.SendToTenantAsync(
                    tenantId.ToString(),
                    "RestoreStarted",
                    new BackupNotification
                    {
                        Type = "RestoreStarted",
                        BackupId = backupId,
                        BackupName = backupName,
                        Status = "InProgress",
                        Timestamp = DateTime.UtcNow,
                        Message = $"Geri yükleme başladı: {backupName}"
                    });
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to send restore started notification. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result.Failure(Error.Failure("Notification.Failed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Result> NotifyRestoreCompletedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        TimeSpan duration,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var durationFormatted = FormatDuration(duration);

            if (_settings.EnableRealtimeNotifications)
            {
                await _tenantNotificationService.SendToTenantAsync(
                    tenantId.ToString(),
                    "RestoreCompleted",
                    new BackupNotification
                    {
                        Type = "RestoreCompleted",
                        BackupId = backupId,
                        BackupName = backupName,
                        Status = "Completed",
                        Duration = duration,
                        Timestamp = DateTime.UtcNow,
                        Message = $"Geri yükleme tamamlandı: {backupName} ({durationFormatted})"
                    });
            }

            if (_settings.EnableEmailNotifications && _settings.NotifyOnComplete)
            {
                await SendBackupEmailAsync(
                    tenantId,
                    $"Geri Yükleme Tamamlandı: {backupName}",
                    GetRestoreCompletedEmailBody(backupName, durationFormatted),
                    cancellationToken);
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to send restore completed notification. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result.Failure(Error.Failure("Notification.Failed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Result> NotifyRestoreFailedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (_settings.EnableRealtimeNotifications)
            {
                await _tenantNotificationService.SendToTenantAsync(
                    tenantId.ToString(),
                    "RestoreFailed",
                    new BackupNotification
                    {
                        Type = "RestoreFailed",
                        BackupId = backupId,
                        BackupName = backupName,
                        Status = "Failed",
                        ErrorMessage = errorMessage,
                        Timestamp = DateTime.UtcNow,
                        Message = $"Geri yükleme başarısız: {backupName}"
                    });
            }

            if (_settings.EnableEmailNotifications && _settings.NotifyOnFailure)
            {
                await SendBackupEmailAsync(
                    tenantId,
                    $"Geri Yükleme Başarısız: {backupName}",
                    GetRestoreFailedEmailBody(backupName, errorMessage),
                    cancellationToken);
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to send restore failed notification. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result.Failure(Error.Failure("Notification.Failed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Result> NotifyCleanupCompletedAsync(
        Guid tenantId,
        int deletedCount,
        long freedSpaceBytes,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var freedSpaceFormatted = FormatFileSize(freedSpaceBytes);

            if (_settings.EnableRealtimeNotifications)
            {
                await _tenantNotificationService.SendToTenantAsync(
                    tenantId.ToString(),
                    "BackupCleanupCompleted",
                    new
                    {
                        Type = "BackupCleanupCompleted",
                        DeletedCount = deletedCount,
                        FreedSpaceBytes = freedSpaceBytes,
                        FreedSpaceFormatted = freedSpaceFormatted,
                        Timestamp = DateTime.UtcNow,
                        Message = $"{deletedCount} eski yedek silindi, {freedSpaceFormatted} alan açıldı"
                    });
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to send cleanup completed notification. TenantId: {TenantId}",
                tenantId);

            return Result.Failure(Error.Failure("Notification.Failed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Result> NotifyStorageWarningAsync(
        Guid tenantId,
        long usedBytes,
        long limitBytes,
        int percentageUsed,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var usedFormatted = FormatFileSize(usedBytes);
            var limitFormatted = FormatFileSize(limitBytes);

            if (_settings.EnableRealtimeNotifications)
            {
                await _tenantNotificationService.SendToTenantAsync(
                    tenantId.ToString(),
                    "StorageWarning",
                    new
                    {
                        Type = "StorageWarning",
                        UsedBytes = usedBytes,
                        LimitBytes = limitBytes,
                        PercentageUsed = percentageUsed,
                        UsedFormatted = usedFormatted,
                        LimitFormatted = limitFormatted,
                        Timestamp = DateTime.UtcNow,
                        Message = $"Yedekleme alanı uyarısı: %{percentageUsed} kullanımda ({usedFormatted}/{limitFormatted})"
                    });
            }

            if (_settings.EnableEmailNotifications)
            {
                await SendBackupEmailAsync(
                    tenantId,
                    "Yedekleme Alanı Uyarısı",
                    GetStorageWarningEmailBody(usedFormatted, limitFormatted, percentageUsed),
                    cancellationToken);
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to send storage warning notification. TenantId: {TenantId}",
                tenantId);

            return Result.Failure(Error.Failure("Notification.Failed", ex.Message));
        }
    }

    #region Private Helper Methods

    private async Task SendBackupEmailAsync(
        Guid tenantId,
        string subject,
        string body,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get tenant admin emails
            var tenant = await _masterDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

            if (tenant == null) return;

            var adminEmails = new List<string>();

            // Add contact email if available
            if (tenant.ContactEmail != null && !string.IsNullOrEmpty(tenant.ContactEmail.Value))
            {
                adminEmails.Add(tenant.ContactEmail.Value);
            }

            // Add configured admin emails
            adminEmails.AddRange(_settings.AdminEmailAddresses);

            foreach (var email in adminEmails.Distinct())
            {
                await _emailService.SendAsync(new EmailMessage
                {
                    To = email,
                    Subject = subject,
                    Body = body,
                    IsHtml = true
                }, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send backup email. TenantId: {TenantId}", tenantId);
        }
    }

    private static string GetBackupStartedEmailBody(string backupName, string backupType)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
        .info-box {{ background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Yedekleme Başladı</h2>
        </div>
        <div class='content'>
            <p>Yedekleme işlemi başlatıldı.</p>
            <div class='info-box'>
                <p><strong>Yedek Adı:</strong> {backupName}</p>
                <p><strong>Yedek Türü:</strong> {backupType}</p>
                <p><strong>Başlangıç Zamanı:</strong> {DateTime.UtcNow:dd.MM.yyyy HH:mm:ss} UTC</p>
            </div>
            <p>İşlem tamamlandığında size bildirim gönderilecektir.</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta Stocker Yedekleme Sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string GetBackupCompletedEmailBody(string backupName, string backupType, string size, string duration)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
        .info-box {{ background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #22c55e; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Yedekleme Tamamlandı</h2>
        </div>
        <div class='content'>
            <p>Yedekleme işlemi başarıyla tamamlandı.</p>
            <div class='info-box'>
                <p><strong>Yedek Adı:</strong> {backupName}</p>
                <p><strong>Yedek Türü:</strong> {backupType}</p>
                <p><strong>Boyut:</strong> {size}</p>
                <p><strong>Süre:</strong> {duration}</p>
                <p><strong>Tamamlanma Zamanı:</strong> {DateTime.UtcNow:dd.MM.yyyy HH:mm:ss} UTC</p>
            </div>
            <p>Yedekleme dosyasına Ayarlar &gt; Yedekleme bölümünden erişebilirsiniz.</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta Stocker Yedekleme Sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string GetBackupFailedEmailBody(string backupName, string backupType, string error)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
        .info-box {{ background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444; }}
        .error-box {{ background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #fecaca; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Yedekleme Başarısız</h2>
        </div>
        <div class='content'>
            <p>Yedekleme işlemi başarısız oldu.</p>
            <div class='info-box'>
                <p><strong>Yedek Adı:</strong> {backupName}</p>
                <p><strong>Yedek Türü:</strong> {backupType}</p>
                <p><strong>Zaman:</strong> {DateTime.UtcNow:dd.MM.yyyy HH:mm:ss} UTC</p>
            </div>
            <div class='error-box'>
                <p><strong>Hata:</strong></p>
                <p>{error}</p>
            </div>
            <p>Lütfen sistem yöneticinizle iletişime geçin veya yedeklemeyi manuel olarak tekrar deneyin.</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta Stocker Yedekleme Sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string GetRestoreCompletedEmailBody(string backupName, string duration)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
        .info-box {{ background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #22c55e; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Geri Yükleme Tamamlandı</h2>
        </div>
        <div class='content'>
            <p>Geri yükleme işlemi başarıyla tamamlandı.</p>
            <div class='info-box'>
                <p><strong>Yedek Adı:</strong> {backupName}</p>
                <p><strong>Süre:</strong> {duration}</p>
                <p><strong>Tamamlanma Zamanı:</strong> {DateTime.UtcNow:dd.MM.yyyy HH:mm:ss} UTC</p>
            </div>
            <p>Verileriniz başarıyla geri yüklendi.</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta Stocker Yedekleme Sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string GetRestoreFailedEmailBody(string backupName, string error)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
        .info-box {{ background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444; }}
        .error-box {{ background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #fecaca; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Geri Yükleme Başarısız</h2>
        </div>
        <div class='content'>
            <p>Geri yükleme işlemi başarısız oldu.</p>
            <div class='info-box'>
                <p><strong>Yedek Adı:</strong> {backupName}</p>
                <p><strong>Zaman:</strong> {DateTime.UtcNow:dd.MM.yyyy HH:mm:ss} UTC</p>
            </div>
            <div class='error-box'>
                <p><strong>Hata:</strong></p>
                <p>{error}</p>
            </div>
            <p>Lütfen sistem yöneticinizle iletişime geçin.</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta Stocker Yedekleme Sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string GetStorageWarningEmailBody(string used, string limit, int percentage)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
        .warning-box {{ background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }}
        .progress-bar {{ background-color: #e5e7eb; border-radius: 4px; height: 20px; margin: 10px 0; }}
        .progress-fill {{ background-color: #f59e0b; height: 100%; border-radius: 4px; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Yedekleme Alanı Uyarısı</h2>
        </div>
        <div class='content'>
            <div class='warning-box'>
                <p>Yedekleme alanınız dolmak üzere!</p>
                <p><strong>Kullanılan:</strong> {used} / {limit} (%{percentage})</p>
                <div class='progress-bar'>
                    <div class='progress-fill' style='width: {percentage}%;'></div>
                </div>
            </div>
            <p>Eski yedekleri silerek veya depolama limitinizi artırarak alan açabilirsiniz.</p>
            <p>Ayarlar &gt; Yedekleme bölümünden yedeklerinizi yönetebilirsiniz.</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta Stocker Yedekleme Sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        int order = 0;
        double size = bytes;

        while (size >= 1024 && order < sizes.Length - 1)
        {
            order++;
            size /= 1024;
        }

        return $"{size:0.##} {sizes[order]}";
    }

    private static string FormatDuration(TimeSpan duration)
    {
        if (duration.TotalHours >= 1)
            return $"{(int)duration.TotalHours} saat {duration.Minutes} dakika";
        if (duration.TotalMinutes >= 1)
            return $"{(int)duration.TotalMinutes} dakika {duration.Seconds} saniye";
        return $"{duration.Seconds} saniye";
    }

    #endregion
}

/// <summary>
/// Backup notification payload for SignalR
/// </summary>
public class BackupNotification
{
    public string Type { get; set; } = string.Empty;
    public Guid BackupId { get; set; }
    public string BackupName { get; set; } = string.Empty;
    public string? BackupType { get; set; }
    public string Status { get; set; } = string.Empty;
    public long? SizeInBytes { get; set; }
    public TimeSpan? Duration { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; }
    public string Message { get; set; } = string.Empty;
}
