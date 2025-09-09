using Stocker.SharedKernel.Primitives;
using System.Text.Json;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantNotification : Entity
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; }
    public NotificationType Type { get; private set; }
    public NotificationChannel Channel { get; private set; }
    public bool IsEnabled { get; private set; }
    
    // Recipients
    public string Recipients { get; private set; } // JSON array of email/phone
    public string? CCRecipients { get; private set; }
    public string? BCCRecipients { get; private set; }
    public bool SendToAllAdmins { get; private set; }
    public bool SendToOwner { get; private set; }
    
    // Template
    public string? EmailTemplateId { get; private set; }
    public string? SMSTemplateId { get; private set; }
    public string? Subject { get; private set; }
    public string? Body { get; private set; }
    public bool UseDefaultTemplate { get; private set; }
    
    // Schedule
    public NotificationSchedule Schedule { get; private set; }
    public string? CronExpression { get; private set; }
    public TimeSpan? TimeOfDay { get; private set; }
    public DayOfWeek? DayOfWeek { get; private set; }
    public int? DayOfMonth { get; private set; }
    public int DelayMinutes { get; private set; }
    
    // Conditions
    public string? TriggerConditions { get; private set; } // JSON conditions
    public decimal? ThresholdValue { get; private set; }
    public string? ThresholdUnit { get; private set; }
    
    // Rate Limiting
    public int MaxPerDay { get; private set; }
    public int MaxPerWeek { get; private set; }
    public int MaxPerMonth { get; private set; }
    public int SentToday { get; private set; }
    public int SentThisWeek { get; private set; }
    public int SentThisMonth { get; private set; }
    
    // Status
    public bool IsPaused { get; private set; }
    public DateTime? PausedAt { get; private set; }
    public string? PausedReason { get; private set; }
    public DateTime? LastSentAt { get; private set; }
    public DateTime? NextScheduledAt { get; private set; }
    public int TotalSentCount { get; private set; }
    public int FailedCount { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    
    private TenantNotification() { } // EF Constructor
    
    private TenantNotification(
        Guid tenantId,
        string name,
        NotificationType type,
        NotificationChannel channel,
        List<string> recipients,
        string createdBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        Name = name;
        Type = type;
        Channel = channel;
        Recipients = JsonSerializer.Serialize(recipients);
        IsEnabled = true;
        SendToAllAdmins = false;
        SendToOwner = false;
        UseDefaultTemplate = true;
        Schedule = NotificationSchedule.Immediate;
        DelayMinutes = 0;
        MaxPerDay = 100;
        MaxPerWeek = 500;
        MaxPerMonth = 2000;
        IsPaused = false;
        TotalSentCount = 0;
        FailedCount = 0;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        
        ResetCounters();
    }
    
    public static TenantNotification Create(
        Guid tenantId,
        string name,
        NotificationType type,
        NotificationChannel channel,
        List<string> recipients,
        string createdBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty.", nameof(name));
            
        if (recipients == null || recipients.Count == 0)
            throw new ArgumentException("At least one recipient is required.", nameof(recipients));
            
        return new TenantNotification(tenantId, name, type, channel, recipients, createdBy);
    }
    
    public void UpdateRecipients(List<string> recipients, List<string>? cc = null, List<string>? bcc = null)
    {
        Recipients = JsonSerializer.Serialize(recipients);
        CCRecipients = cc != null ? JsonSerializer.Serialize(cc) : null;
        BCCRecipients = bcc != null ? JsonSerializer.Serialize(bcc) : null;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetRecipientOptions(bool sendToAllAdmins, bool sendToOwner)
    {
        SendToAllAdmins = sendToAllAdmins;
        SendToOwner = sendToOwner;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetTemplate(string? subject, string? body, string? emailTemplateId = null, string? smsTemplateId = null)
    {
        Subject = subject;
        Body = body;
        EmailTemplateId = emailTemplateId;
        SMSTemplateId = smsTemplateId;
        UseDefaultTemplate = string.IsNullOrEmpty(emailTemplateId) && string.IsNullOrEmpty(smsTemplateId);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetSchedule(
        NotificationSchedule schedule,
        string? cronExpression = null,
        TimeSpan? timeOfDay = null,
        DayOfWeek? dayOfWeek = null,
        int? dayOfMonth = null,
        int delayMinutes = 0)
    {
        Schedule = schedule;
        CronExpression = cronExpression;
        TimeOfDay = timeOfDay;
        DayOfWeek = dayOfWeek;
        DayOfMonth = dayOfMonth;
        DelayMinutes = delayMinutes;
        UpdateNextScheduledTime();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetConditions(object conditions, decimal? thresholdValue = null, string? thresholdUnit = null)
    {
        TriggerConditions = JsonSerializer.Serialize(conditions);
        ThresholdValue = thresholdValue;
        ThresholdUnit = thresholdUnit;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetRateLimits(int maxPerDay, int maxPerWeek, int maxPerMonth)
    {
        MaxPerDay = maxPerDay;
        MaxPerWeek = maxPerWeek;
        MaxPerMonth = maxPerMonth;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public bool CanSend()
    {
        if (!IsEnabled || IsPaused)
            return false;
            
        if (SentToday >= MaxPerDay)
            return false;
            
        if (SentThisWeek >= MaxPerWeek)
            return false;
            
        if (SentThisMonth >= MaxPerMonth)
            return false;
            
        return true;
    }
    
    public void RecordSent()
    {
        LastSentAt = DateTime.UtcNow;
        TotalSentCount++;
        SentToday++;
        SentThisWeek++;
        SentThisMonth++;
        UpdateNextScheduledTime();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void RecordFailed()
    {
        FailedCount++;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ResetCounters()
    {
        SentToday = 0;
        SentThisWeek = 0;
        SentThisMonth = 0;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ResetDailyCounter()
    {
        SentToday = 0;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ResetWeeklyCounter()
    {
        SentThisWeek = 0;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ResetMonthlyCounter()
    {
        SentThisMonth = 0;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Enable()
    {
        IsEnabled = true;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Disable()
    {
        IsEnabled = false;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Pause(string reason)
    {
        IsPaused = true;
        PausedAt = DateTime.UtcNow;
        PausedReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Resume()
    {
        IsPaused = false;
        PausedAt = null;
        PausedReason = null;
        UpdateNextScheduledTime();
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void UpdateNextScheduledTime()
    {
        var now = DateTime.UtcNow;
        
        NextScheduledAt = Schedule switch
        {
            NotificationSchedule.Immediate => now,
            NotificationSchedule.Daily => now.Date.AddDays(1).Add(TimeOfDay ?? TimeSpan.Zero),
            NotificationSchedule.Weekly => GetNextWeekday(DayOfWeek ?? System.DayOfWeek.Monday).Add(TimeOfDay ?? TimeSpan.Zero),
            NotificationSchedule.Monthly => new DateTime(now.Year, now.Month, DayOfMonth ?? 1, 0, 0, 0).AddMonths(1).Add(TimeOfDay ?? TimeSpan.Zero),
            NotificationSchedule.Custom => CalculateNextFromCron(CronExpression),
            _ => null
        };
    }
    
    private DateTime GetNextWeekday(DayOfWeek dayOfWeek)
    {
        var today = DateTime.UtcNow.Date;
        var daysUntilNext = ((int)dayOfWeek - (int)today.DayOfWeek + 7) % 7;
        if (daysUntilNext == 0) daysUntilNext = 7;
        return today.AddDays(daysUntilNext);
    }
    
    private DateTime? CalculateNextFromCron(string? cronExpression)
    {
        // Simplified - in production use a proper CRON library
        return DateTime.UtcNow.AddHours(1);
    }
    
    public List<string> GetRecipientsList()
    {
        return string.IsNullOrEmpty(Recipients) 
            ? new List<string>() 
            : JsonSerializer.Deserialize<List<string>>(Recipients) ?? new List<string>();
    }
}

public enum NotificationType
{
    System = 0,
    Billing = 1,
    Security = 2,
    Performance = 3,
    Usage = 4,
    Compliance = 5,
    Marketing = 6,
    Onboarding = 7,
    Support = 8,
    Custom = 9
}

public enum NotificationChannel
{
    Email = 0,
    SMS = 1,
    Push = 2,
    InApp = 3,
    Webhook = 4,
    Slack = 5,
    Teams = 6,
    Discord = 7
}

public enum NotificationSchedule
{
    Immediate = 0,
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
    Custom = 4
}