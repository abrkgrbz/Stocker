using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Master Admin tarafından tüm tenant'lara veya belirli tenant'lara gönderilen bildirimler
/// Sistem geneli duyurular, bakım bildirimleri, önemli güncellemeler vb.
/// </summary>
public sealed class MasterNotification : Entity
{
    // Notification Content
    public string Title { get; private set; }
    public string Message { get; private set; }
    public string? Description { get; private set; }
    public MasterNotificationType Type { get; private set; }
    public MasterNotificationPriority Priority { get; private set; }

    // Target Configuration
    public MasterNotificationTarget TargetType { get; private set; }
    public List<Guid>? TargetTenantIds { get; private set; }
    public List<string>? TargetPackages { get; private set; } // Belirli paketlere (Pro, Enterprise)
    public List<string>? TargetCountries { get; private set; }
    public bool IsGlobal { get; private set; } // Tüm tenant'lara

    // Delivery Channels
    public bool SendInApp { get; private set; }
    public bool SendEmail { get; private set; }
    public bool SendPush { get; private set; }
    public bool SendSms { get; private set; }

    // Visual Content
    public string? IconName { get; private set; }
    public string? IconColor { get; private set; }
    public string? ImageUrl { get; private set; }
    public string? BannerUrl { get; private set; }

    // Action Configuration
    public string? ActionUrl { get; private set; }
    public string? ActionText { get; private set; }
    public string? ActionType { get; private set; } // navigate, external, modal
    public List<NotificationActionItem>? Actions { get; private set; }

    // Scheduling
    public DateTime CreatedAt { get; private set; }
    public DateTime? ScheduledAt { get; private set; }
    public DateTime? SentAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public bool IsScheduled { get; private set; }

    // Status & Tracking
    public MasterNotificationStatus Status { get; private set; }
    public int TotalRecipients { get; private set; }
    public int DeliveredCount { get; private set; }
    public int ReadCount { get; private set; }
    public int FailedCount { get; private set; }

    // Metadata
    public string CreatedBy { get; private set; }
    public string? UpdatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? Metadata { get; private set; } // JSON
    public List<string>? Tags { get; private set; }

    private MasterNotification()
    {
        TargetTenantIds = new List<Guid>();
        TargetPackages = new List<string>();
        TargetCountries = new List<string>();
        Actions = new List<NotificationActionItem>();
        Tags = new List<string>();
    }

    public MasterNotification(
        string title,
        string message,
        MasterNotificationType type,
        string createdBy) : this()
    {
        Id = Guid.NewGuid();
        Title = title;
        Message = message;
        Type = type;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
        Status = MasterNotificationStatus.Draft;
        Priority = MasterNotificationPriority.Normal;
        TargetType = MasterNotificationTarget.AllTenants;
        IsGlobal = true;
        SendInApp = true;
        SendPush = true;
    }

    // Target Configuration
    public void TargetAllTenants()
    {
        TargetType = MasterNotificationTarget.AllTenants;
        IsGlobal = true;
        TargetTenantIds?.Clear();
        TargetPackages?.Clear();
    }

    public void TargetSpecificTenants(List<Guid> tenantIds)
    {
        TargetType = MasterNotificationTarget.SpecificTenants;
        IsGlobal = false;
        TargetTenantIds = tenantIds;
    }

    public void TargetByPackage(List<string> packages)
    {
        TargetType = MasterNotificationTarget.ByPackage;
        IsGlobal = false;
        TargetPackages = packages;
    }

    public void TargetByCountry(List<string> countries)
    {
        TargetType = MasterNotificationTarget.ByCountry;
        IsGlobal = false;
        TargetCountries = countries;
    }

    // Content Configuration
    public void SetDescription(string description)
    {
        Description = description;
        MarkAsUpdated();
    }

    public void SetPriority(MasterNotificationPriority priority)
    {
        Priority = priority;
        MarkAsUpdated();
    }

    public void SetIcon(string iconName, string? color = null)
    {
        IconName = iconName;
        IconColor = color;
        MarkAsUpdated();
    }

    public void SetImages(string? imageUrl, string? bannerUrl = null)
    {
        ImageUrl = imageUrl;
        BannerUrl = bannerUrl;
        MarkAsUpdated();
    }

    public void SetAction(string url, string text, string type = "navigate")
    {
        ActionUrl = url;
        ActionText = text;
        ActionType = type;
        MarkAsUpdated();
    }

    public void AddAction(string text, string url, string type = "navigate", string? style = null)
    {
        Actions ??= new List<NotificationActionItem>();
        Actions.Add(new NotificationActionItem
        {
            Text = text,
            Url = url,
            Type = type,
            Style = style
        });
        MarkAsUpdated();
    }

    // Delivery Configuration
    public void ConfigureChannels(bool inApp = true, bool push = true, bool email = false, bool sms = false)
    {
        SendInApp = inApp;
        SendPush = push;
        SendEmail = email;
        SendSms = sms;
        MarkAsUpdated();
    }

    // Scheduling
    public void ScheduleFor(DateTime scheduledAt)
    {
        ScheduledAt = scheduledAt;
        IsScheduled = true;
        Status = MasterNotificationStatus.Scheduled;
        MarkAsUpdated();
    }

    public void SetExpiration(DateTime expiresAt)
    {
        ExpiresAt = expiresAt;
        MarkAsUpdated();
    }

    // Status Management
    public void Publish()
    {
        if (Status == MasterNotificationStatus.Sent)
            throw new InvalidOperationException("Notification already sent.");

        Status = MasterNotificationStatus.Sending;
        SentAt = DateTime.UtcNow;
    }

    public void MarkAsSent(int totalRecipients)
    {
        Status = MasterNotificationStatus.Sent;
        TotalRecipients = totalRecipients;
    }

    public void RecordDelivery(bool success)
    {
        if (success)
            DeliveredCount++;
        else
            FailedCount++;
    }

    public void RecordRead()
    {
        ReadCount++;
    }

    public void Cancel()
    {
        Status = MasterNotificationStatus.Cancelled;
        MarkAsUpdated();
    }

    public void MarkAsExpired()
    {
        Status = MasterNotificationStatus.Expired;
    }

    // Metadata
    public void SetMetadata(string json)
    {
        Metadata = json;
        MarkAsUpdated();
    }

    public void AddTag(string tag)
    {
        Tags ??= new List<string>();
        if (!Tags.Contains(tag))
            Tags.Add(tag);
        MarkAsUpdated();
    }

    private void MarkAsUpdated()
    {
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetUpdatedBy(string userId)
    {
        UpdatedBy = userId;
        MarkAsUpdated();
    }

    public bool ShouldSendNow()
    {
        if (Status == MasterNotificationStatus.Sent || Status == MasterNotificationStatus.Cancelled)
            return false;

        if (IsScheduled && ScheduledAt.HasValue)
            return ScheduledAt.Value <= DateTime.UtcNow;

        return !IsScheduled;
    }

    public bool IsExpired()
    {
        return ExpiresAt.HasValue && ExpiresAt.Value <= DateTime.UtcNow;
    }

    public double GetDeliveryRate()
    {
        if (TotalRecipients == 0) return 0;
        return (double)DeliveredCount / TotalRecipients * 100;
    }

    public double GetReadRate()
    {
        if (DeliveredCount == 0) return 0;
        return (double)ReadCount / DeliveredCount * 100;
    }
}

public class NotificationActionItem
{
    public string Text { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Type { get; set; } = "navigate";
    public string? Style { get; set; }
}

public enum MasterNotificationType
{
    SystemUpdate = 0,        // Sistem güncellemesi
    Maintenance = 1,         // Bakım bildirimi
    Announcement = 2,        // Duyuru
    SecurityAlert = 3,       // Güvenlik uyarısı
    FeatureRelease = 4,      // Yeni özellik
    PolicyChange = 5,        // Politika değişikliği
    BillingNotice = 6,       // Fatura bildirimi
    Promotion = 7,           // Promosyon/Kampanya
    Survey = 8,              // Anket
    Emergency = 9            // Acil durum
}

public enum MasterNotificationPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3,
    Critical = 4
}

public enum MasterNotificationTarget
{
    AllTenants = 0,          // Tüm tenant'lar
    SpecificTenants = 1,     // Belirli tenant'lar
    ByPackage = 2,           // Paket bazlı (Pro, Enterprise)
    ByCountry = 3,           // Ülke bazlı
    ByRegion = 4,            // Bölge bazlı
    ActiveOnly = 5,          // Sadece aktif tenant'lar
    TrialOnly = 6            // Sadece deneme sürümündekiler
}

public enum MasterNotificationStatus
{
    Draft = 0,
    Scheduled = 1,
    Sending = 2,
    Sent = 3,
    PartiallyDelivered = 4,
    Failed = 5,
    Cancelled = 6,
    Expired = 7
}
