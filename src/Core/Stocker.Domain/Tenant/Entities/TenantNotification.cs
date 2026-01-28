using Stocker.Domain.Constants;
using Stocker.SharedKernel.Primitives;
using System;
using System.Collections.Generic;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Tenant kullanıcılarına özel bildirimler - sistem bildirimleri, uyarılar, hatırlatmalar vb.
/// </summary>
public sealed class TenantNotification : Entity
{
    // Notification Information
    public string Title { get; private set; }
    public string Message { get; private set; }
    public string? Description { get; private set; }
    public NotificationType Type { get; private set; }
    public NotificationCategory Category { get; private set; }
    public NotificationPriority Priority { get; private set; }
    public NotificationSeverity Severity { get; private set; }
    
    // Target Information
    public NotificationTarget TargetType { get; private set; }
    public Guid? TargetUserId { get; private set; } // Specific user
    public string? TargetRole { get; private set; } // All users with this role
    public string? TargetDepartment { get; private set; } // All users in department
    public List<Guid>? TargetUserIds { get; private set; } // Multiple specific users
    public bool IsGlobal { get; private set; } // All tenant users
    
    // Content & Actions
    public string? IconName { get; private set; }
    public string? IconColor { get; private set; }
    public string? ImageUrl { get; private set; }
    public string? ActionUrl { get; private set; }
    public string? ActionText { get; private set; }
    public string? ActionType { get; private set; } // navigate, external, modal, etc.
    public Dictionary<string, string>? ActionData { get; private set; } // Additional action params
    public List<NotificationAction>? Actions { get; private set; } // Multiple action buttons
    
    // Delivery Channels
    public bool SendInApp { get; private set; }
    public bool SendEmail { get; private set; }
    public bool SendSms { get; private set; }
    public bool SendPushNotification { get; private set; }
    public bool SendWebhook { get; private set; }
    public string? WebhookUrl { get; private set; }
    public string? EmailTemplateId { get; private set; }
    public string? SmsTemplateId { get; private set; }
    
    // Scheduling
    public DateTime CreatedAt { get; private set; }
    public DateTime? ScheduledAt { get; private set; }
    public DateTime? SentAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public bool IsScheduled { get; private set; }
    public bool IsRecurring { get; private set; }
    public string? RecurrencePattern { get; private set; } // Cron expression
    public DateTime? RecurrenceEndDate { get; private set; }
    
    // Status & Tracking
    public NotificationStatus Status { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime? ReadAt { get; private set; }
    public bool IsDismissed { get; private set; }
    public DateTime? DismissedAt { get; private set; }
    public bool IsArchived { get; private set; }
    public DateTime? ArchivedAt { get; private set; }
    public int DeliveryAttempts { get; private set; }
    public DateTime? LastDeliveryAttempt { get; private set; }
    public string? DeliveryError { get; private set; }
    
    // User Interaction
    public bool RequiresAcknowledgment { get; private set; }
    public bool IsAcknowledged { get; private set; }
    public DateTime? AcknowledgedAt { get; private set; }
    public string? AcknowledgedBy { get; private set; }
    public bool AllowDismiss { get; private set; }
    public bool ShowUntilRead { get; private set; }
    public bool Persistent { get; private set; } // Cannot be deleted by user
    
    // Source Information
    public string CreatedBy { get; private set; }
    public NotificationSource Source { get; private set; }
    public string? SourceEntityType { get; private set; }
    public Guid? SourceEntityId { get; private set; }
    public string? SourceEventType { get; private set; }
    
    // Additional Data
    public string? Metadata { get; private set; } // JSON for extra data
    public Dictionary<string, string>? Data { get; private set; } // Template variables
    public List<string>? Tags { get; private set; } // For filtering/grouping
    public string? GroupKey { get; private set; } // For notification grouping
    public int GroupCount { get; private set; } // Number of grouped notifications
    
    private TenantNotification()
    {
        TargetUserIds = new List<Guid>();
        Actions = new List<NotificationAction>();
        ActionData = new Dictionary<string, string>();
        Data = new Dictionary<string, string>();
        Tags = new List<string>();
    }
    
    private TenantNotification(
        string title,
        string message,
        NotificationType type,
        NotificationCategory category,
        string createdBy) : this()
    {
        Id = Guid.NewGuid();
        Title = title;
        Message = message;
        Type = type;
        Category = category;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
        Status = NotificationStatus.Created;
        Priority = NotificationPriority.Normal;
        Severity = NotificationSeverity.Info;
        Source = NotificationSource.System;
        SendInApp = true;
        AllowDismiss = true;
        ShowUntilRead = true;
        DeliveryAttempts = 0;
        GroupCount = 0;
    }
    
    public static TenantNotification CreateUserNotification(
        string title,
        string message,
        NotificationType type,
        Guid targetUserId,
        string createdBy)
    {
        var notification = new TenantNotification(title, message, type, NotificationCategory.User, createdBy)
        {
            TargetType = NotificationTarget.User,
            TargetUserId = targetUserId,
            IsGlobal = false
        };
        
        return notification;
    }
    
    public static TenantNotification CreateRoleNotification(
        string title,
        string message,
        NotificationType type,
        string targetRole,
        string createdBy)
    {
        var notification = new TenantNotification(title, message, type, NotificationCategory.System, createdBy)
        {
            TargetType = NotificationTarget.Role,
            TargetRole = targetRole,
            IsGlobal = false
        };
        
        return notification;
    }
    
    public static TenantNotification CreateGlobalNotification(
        string title,
        string message,
        NotificationType type,
        string createdBy)
    {
        var notification = new TenantNotification(title, message, type, NotificationCategory.System, createdBy)
        {
            TargetType = NotificationTarget.AllUsers,
            IsGlobal = true
        };

        return notification;
    }

    /// <summary>
    /// Stok kritik seviye uyarısı oluşturur
    /// </summary>
    public static TenantNotification CreateInventoryAlert(
        string productName,
        int currentStock,
        int criticalLevel,
        Guid productId,
        string targetRole = "InventoryManager")
    {
        var notification = new TenantNotification(
            $"⚠️ Kritik Stok Uyarısı: {productName}",
            $"{productName} ürününün stok seviyesi kritik seviyenin altına düştü. Mevcut: {currentStock}, Kritik Seviye: {criticalLevel}",
            NotificationType.Warning,
            NotificationCategory.Inventory,
            DomainConstants.SystemUser)
        {
            TargetType = NotificationTarget.Role,
            TargetRole = targetRole,
            IsGlobal = false,
            Source = NotificationSource.AutomatedAlert
        };

        notification.SetSource(NotificationSource.AutomatedAlert, "Product", productId, "StockCritical");
        notification.SetIcon("package-x", "#ef4444");
        notification.SetPriority(NotificationPriority.High);
        notification.SetAction($"/inventory/products/{productId}", "Ürünü Görüntüle");
        notification.ConfigureDeliveryChannels(inApp: true, push: true, email: true);

        return notification;
    }

    /// <summary>
    /// Stok tükendi uyarısı oluşturur
    /// </summary>
    public static TenantNotification CreateOutOfStockAlert(
        string productName,
        Guid productId,
        string targetRole = "InventoryManager")
    {
        var notification = new TenantNotification(
            $"🚨 Stok Tükendi: {productName}",
            $"{productName} ürününün stoğu tamamen tükendi. Acil sipariş gerekli.",
            NotificationType.Error,
            NotificationCategory.Inventory,
            DomainConstants.SystemUser)
        {
            TargetType = NotificationTarget.Role,
            TargetRole = targetRole,
            IsGlobal = false,
            Source = NotificationSource.AutomatedAlert
        };

        notification.SetSource(NotificationSource.AutomatedAlert, "Product", productId, "OutOfStock");
        notification.SetIcon("package-x", "#dc2626");
        notification.SetPriority(NotificationPriority.Critical);
        notification.SetSeverity(NotificationSeverity.Critical);
        notification.SetAction($"/inventory/products/{productId}", "Sipariş Ver");
        notification.ConfigureDeliveryChannels(inApp: true, push: true, email: true, sms: true);
        notification.RequireAcknowledgment();

        return notification;
    }

    /// <summary>
    /// Satış hedefi uyarısı oluşturur
    /// </summary>
    public static TenantNotification CreateSalesTargetAlert(
        string targetName,
        decimal currentAmount,
        decimal targetAmount,
        double percentageAchieved,
        Guid? userId = null)
    {
        var notification = new TenantNotification(
            $"📊 Satış Hedefi Durumu: {targetName}",
            $"Hedefinize %{percentageAchieved:F1} ulaştınız. Mevcut: {currentAmount:C}, Hedef: {targetAmount:C}",
            percentageAchieved >= 100 ? NotificationType.Success : NotificationType.Information,
            NotificationCategory.Sales,
            DomainConstants.SystemUser)
        {
            TargetType = userId.HasValue ? NotificationTarget.User : NotificationTarget.Role,
            TargetUserId = userId,
            TargetRole = userId.HasValue ? null : "SalesManager",
            IsGlobal = false,
            Source = NotificationSource.AutomatedAlert
        };

        notification.SetIcon(percentageAchieved >= 100 ? "trophy" : "target", percentageAchieved >= 100 ? "#22c55e" : "#3b82f6");
        notification.SetAction("/sales/dashboard", "Satış Paneli");

        return notification;
    }

    /// <summary>
    /// Master admin tarafından gönderilen bildirim oluşturur
    /// </summary>
    public static TenantNotification CreateFromMasterNotification(
        string title,
        string message,
        NotificationType type,
        Guid masterNotificationId)
    {
        var notification = new TenantNotification(title, message, type, NotificationCategory.System, "MasterAdmin")
        {
            TargetType = NotificationTarget.AllUsers,
            IsGlobal = true,
            Source = NotificationSource.MasterAdmin
        };

        notification.SetSource(NotificationSource.MasterAdmin, "MasterNotification", masterNotificationId);
        notification.SetIcon("megaphone", "#8b5cf6");
        notification.SetPriority(NotificationPriority.High);
        notification.ConfigureDeliveryChannels(inApp: true, push: true);

        return notification;
    }

    /// <summary>
    /// Tenant admin tarafından gönderilen bildirim oluşturur
    /// </summary>
    public static TenantNotification CreateTenantAdminNotification(
        string title,
        string message,
        NotificationType type,
        string createdBy,
        NotificationTarget target = NotificationTarget.AllUsers,
        string? targetRole = null,
        Guid? targetUserId = null)
    {
        var notification = new TenantNotification(title, message, type, NotificationCategory.Business, createdBy)
        {
            TargetType = target,
            TargetRole = targetRole,
            TargetUserId = targetUserId,
            IsGlobal = target == NotificationTarget.AllUsers,
            Source = NotificationSource.TenantAdmin
        };

        notification.SetIcon("building-2", "#0ea5e9");
        notification.ConfigureDeliveryChannels(inApp: true, push: true);

        return notification;
    }
    
    public void SetDescription(string description)
    {
        Description = description;
    }
    
    public void SetPriority(NotificationPriority priority)
    {
        Priority = priority;
    }
    
    public void SetSeverity(NotificationSeverity severity)
    {
        Severity = severity;
    }
    
    public void SetIcon(string iconName, string? color = null)
    {
        IconName = iconName;
        IconColor = color;
    }
    
    public void SetImage(string imageUrl)
    {
        ImageUrl = imageUrl;
    }
    
    public void SetAction(string actionUrl, string actionText, string? actionType = null)
    {
        ActionUrl = actionUrl;
        ActionText = actionText;
        ActionType = actionType ?? "navigate";
    }
    
    public void AddAction(string text, string url, string type = "navigate", string? style = null)
    {
        Actions.Add(new NotificationAction
        {
            Text = text,
            Url = url,
            Type = type,
            Style = style
        });
    }
    
    public void SetActionData(Dictionary<string, string> data)
    {
        ActionData = data;
    }
    
    public void ConfigureDeliveryChannels(
        bool inApp = true,
        bool email = false,
        bool sms = false,
        bool push = false,
        bool webhook = false)
    {
        SendInApp = inApp;
        SendEmail = email;
        SendSms = sms;
        SendPushNotification = push;
        SendWebhook = webhook;
    }
    
    public void SetEmailTemplate(string templateId)
    {
        EmailTemplateId = templateId;
        SendEmail = true;
    }
    
    public void SetSmsTemplate(string templateId)
    {
        SmsTemplateId = templateId;
        SendSms = true;
    }
    
    public void SetWebhook(string url)
    {
        WebhookUrl = url;
        SendWebhook = true;
    }
    
    public void Schedule(DateTime scheduledAt)
    {
        ScheduledAt = scheduledAt;
        IsScheduled = true;
        Status = NotificationStatus.Scheduled;
    }
    
    public void SetRecurrence(string cronPattern, DateTime? endDate = null)
    {
        IsRecurring = true;
        RecurrencePattern = cronPattern;
        RecurrenceEndDate = endDate;
    }
    
    public void SetExpiration(DateTime expiresAt)
    {
        ExpiresAt = expiresAt;
    }
    
    public void RequireAcknowledgment(bool allowDismiss = false)
    {
        RequiresAcknowledgment = true;
        AllowDismiss = allowDismiss;
    }
    
    public void SetPersistent(bool persistent = true)
    {
        Persistent = persistent;
        AllowDismiss = !persistent;
    }
    
    public void SetSource(NotificationSource source, string? entityType = null, Guid? entityId = null, string? eventType = null)
    {
        Source = source;
        SourceEntityType = entityType;
        SourceEntityId = entityId;
        SourceEventType = eventType;
    }
    
    public void SetMetadata(string jsonMetadata)
    {
        Metadata = jsonMetadata;
    }
    
    public void SetTemplateData(Dictionary<string, string> data)
    {
        Data = data;
    }
    
    public void AddTag(string tag)
    {
        if (!string.IsNullOrWhiteSpace(tag) && !Tags.Contains(tag))
        {
            Tags.Add(tag);
        }
    }
    
    public void SetGroupKey(string groupKey, int groupCount = 1)
    {
        GroupKey = groupKey;
        GroupCount = groupCount;
    }
    
    // Status management methods
    public void MarkAsSent()
    {
        Status = NotificationStatus.Sent;
        SentAt = DateTime.UtcNow;
    }
    
    public void MarkAsDelivered()
    {
        Status = NotificationStatus.Delivered;
    }
    
    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTime.UtcNow;
        Status = NotificationStatus.Read;
    }

    public void MarkAsUnread()
    {
        IsRead = false;
        ReadAt = null;
        Status = NotificationStatus.Delivered;
    }

    public void MarkAsDismissed()
    {
        if (!AllowDismiss && !RequiresAcknowledgment)
            throw new InvalidOperationException("This notification cannot be dismissed.");
            
        IsDismissed = true;
        DismissedAt = DateTime.UtcNow;
    }
    
    public void Acknowledge(string acknowledgedBy)
    {
        if (!RequiresAcknowledgment)
            throw new InvalidOperationException("This notification does not require acknowledgment.");
            
        IsAcknowledged = true;
        AcknowledgedAt = DateTime.UtcNow;
        AcknowledgedBy = acknowledgedBy;
        Status = NotificationStatus.Acknowledged;
    }
    
    public void Archive()
    {
        IsArchived = true;
        ArchivedAt = DateTime.UtcNow;
        Status = NotificationStatus.Archived;
    }
    
    public void RecordDeliveryAttempt(bool success, string? error = null)
    {
        DeliveryAttempts++;
        LastDeliveryAttempt = DateTime.UtcNow;
        
        if (!success)
        {
            DeliveryError = error;
            Status = NotificationStatus.Failed;
        }
        else
        {
            DeliveryError = null; // Clear error on successful delivery
        }
    }
    
    public bool IsExpired()
    {
        return ExpiresAt.HasValue && ExpiresAt.Value <= DateTime.UtcNow;
    }
    
    public bool ShouldSendNow()
    {
        if (IsScheduled && ScheduledAt.HasValue)
        {
            return ScheduledAt.Value <= DateTime.UtcNow;
        }
        return !IsScheduled;
    }
}

public class NotificationAction
{
    public string Text { get; set; }
    public string Url { get; set; }
    public string Type { get; set; } // navigate, external, modal, dismiss
    public string? Style { get; set; } // primary, secondary, danger, success
}

public enum NotificationType
{
    Information = 0,
    Success = 1,
    Warning = 2,
    Error = 3,
    Alert = 4,
    Reminder = 5,
    Update = 6,
    Announcement = 7,
    Promotion = 8,
    Security = 9,
    System = 10
}

public enum NotificationCategory
{
    System = 0,
    User = 1,
    Business = 2,
    Security = 3,
    Billing = 4,
    Marketing = 5,
    Support = 6,
    Activity = 7,
    Integration = 8,
    Report = 9,
    Inventory = 10,        // Stok bildirimleri
    Sales = 11,            // Satış bildirimleri
    CRM = 12,              // Müşteri ilişkileri
    HR = 13,               // İnsan kaynakları
    Finance = 14           // Finans bildirimleri
}

public enum NotificationPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3,
    Critical = 4
}

public enum NotificationSeverity
{
    Info = 0,
    Success = 1,
    Warning = 2,
    Error = 3,
    Critical = 4
}

public enum NotificationTarget
{
    User = 0,
    Role = 1,
    Department = 2,
    UserGroup = 3,
    AllUsers = 4
}

public enum NotificationSource
{
    System = 0,
    User = 1,
    Application = 2,
    Integration = 3,
    Schedule = 4,
    Trigger = 5,
    Api = 6,
    Webhook = 7,
    MasterAdmin = 8,       // Master admin tarafından gönderilen
    TenantAdmin = 9,       // Tenant yöneticisi tarafından gönderilen
    AutomatedAlert = 10,   // Otomatik uyarılar (stok kritik vb.)
    Workflow = 11          // İş akışı tetiklemeli
}

public enum NotificationStatus
{
    Created = 0,
    Scheduled = 1,
    Sending = 2,
    Sent = 3,
    Delivered = 4,
    Read = 5,
    Acknowledged = 6,
    Failed = 7,
    Expired = 8,
    Archived = 9,
    Cancelled = 10
}