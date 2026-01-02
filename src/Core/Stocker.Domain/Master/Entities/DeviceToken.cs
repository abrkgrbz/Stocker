using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Mobil cihaz push notification token'ları
/// Her kullanıcı birden fazla cihaza sahip olabilir (telefon, tablet)
/// </summary>
public sealed class DeviceToken : Entity
{
    public Guid UserId { get; private set; }
    public Guid? TenantId { get; private set; }

    // Device Information
    public string Token { get; private set; }
    public DevicePlatform Platform { get; private set; }
    public string? DeviceId { get; private set; }
    public string? DeviceName { get; private set; }
    public string? DeviceModel { get; private set; }
    public string? OsVersion { get; private set; }
    public string? AppVersion { get; private set; }

    // Push Provider Info
    public PushProvider Provider { get; private set; }
    public string? ProviderToken { get; private set; } // FCM token, APNs token, etc.

    // Status & Tracking
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastUsedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? ExpiredAt { get; private set; }

    // Notification Preferences (per device)
    public bool ReceivePushNotifications { get; private set; }
    public bool ReceiveMarketingNotifications { get; private set; }
    public bool ReceiveSystemNotifications { get; private set; }
    public bool ReceiveCriticalAlerts { get; private set; }
    public bool SilentMode { get; private set; }
    public string? SilentModeSchedule { get; private set; } // Cron expression for quiet hours

    // Error Tracking
    public int FailedDeliveryCount { get; private set; }
    public DateTime? LastFailedAt { get; private set; }
    public string? LastFailureReason { get; private set; }

    private DeviceToken() { }

    public DeviceToken(
        Guid userId,
        string token,
        DevicePlatform platform,
        PushProvider provider,
        Guid? tenantId = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        TenantId = tenantId;
        Token = token;
        Platform = platform;
        Provider = provider;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
        ReceivePushNotifications = true;
        ReceiveSystemNotifications = true;
        ReceiveCriticalAlerts = true;
        ReceiveMarketingNotifications = false;
        SilentMode = false;
        FailedDeliveryCount = 0;
    }

    public void SetDeviceInfo(string? deviceId, string? deviceName, string? deviceModel, string? osVersion, string? appVersion)
    {
        DeviceId = deviceId;
        DeviceName = deviceName;
        DeviceModel = deviceModel;
        OsVersion = osVersion;
        AppVersion = appVersion;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateToken(string newToken, string? providerToken = null)
    {
        Token = newToken;
        if (providerToken != null)
            ProviderToken = providerToken;
        UpdatedAt = DateTime.UtcNow;
        // Reset failure count on token update
        FailedDeliveryCount = 0;
        LastFailedAt = null;
        LastFailureReason = null;
    }

    public void SetTenant(Guid tenantId)
    {
        TenantId = tenantId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsUsed()
    {
        LastUsedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
        ExpiredAt = null;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsExpired()
    {
        IsActive = false;
        ExpiredAt = DateTime.UtcNow;
    }

    public void ConfigureNotifications(
        bool push = true,
        bool marketing = false,
        bool system = true,
        bool criticalAlerts = true)
    {
        ReceivePushNotifications = push;
        ReceiveMarketingNotifications = marketing;
        ReceiveSystemNotifications = system;
        ReceiveCriticalAlerts = criticalAlerts;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetSilentMode(bool enabled, string? schedule = null)
    {
        SilentMode = enabled;
        SilentModeSchedule = schedule;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordDeliveryFailure(string reason)
    {
        FailedDeliveryCount++;
        LastFailedAt = DateTime.UtcNow;
        LastFailureReason = reason;

        // Auto-deactivate after too many failures
        if (FailedDeliveryCount >= 5)
        {
            Deactivate();
        }
    }

    public void ResetFailureCount()
    {
        FailedDeliveryCount = 0;
        LastFailedAt = null;
        LastFailureReason = null;
    }

    public bool ShouldReceiveNotification(Stocker.Domain.Tenant.Entities.NotificationCategory category)
    {
        if (!IsActive || !ReceivePushNotifications)
            return false;

        return category switch
        {
            Stocker.Domain.Tenant.Entities.NotificationCategory.Marketing => ReceiveMarketingNotifications,
            Stocker.Domain.Tenant.Entities.NotificationCategory.System => ReceiveSystemNotifications,
            Stocker.Domain.Tenant.Entities.NotificationCategory.Security => ReceiveCriticalAlerts,
            Stocker.Domain.Tenant.Entities.NotificationCategory.Billing => ReceiveSystemNotifications,
            _ => true
        };
    }
}

public enum DevicePlatform
{
    iOS = 0,
    Android = 1,
    Web = 2,
    Windows = 3,
    MacOS = 4
}

public enum PushProvider
{
    Firebase = 0,      // FCM - Android & iOS & Web
    APNs = 1,          // Apple Push Notification service
    Expo = 2,          // Expo Push Notifications
    OneSignal = 3,     // OneSignal
    Custom = 4         // Custom implementation
}
