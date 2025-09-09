using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantActivityLog : Entity
{
    public Guid TenantId { get; private set; }
    public string ActivityType { get; private set; } // e.g., "UserLogin", "DataExport", "SettingsChanged"
    public string ActivityDescription { get; private set; }
    public string? EntityType { get; private set; } // e.g., "User", "Invoice", "Settings"
    public Guid? EntityId { get; private set; }
    public string? OldValues { get; private set; } // JSON
    public string? NewValues { get; private set; } // JSON
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? UserId { get; private set; }
    public string? UserName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public string Severity { get; private set; } // Info, Warning, Error, Critical
    public string? AdditionalData { get; private set; } // JSON for extra metadata
    
    // Navigation property
    public Tenant Tenant { get; private set; } = null!;
    
    private TenantActivityLog() { } // EF Constructor
    
    private TenantActivityLog(
        Guid tenantId,
        string activityType,
        string activityDescription,
        string severity,
        string? userId = null,
        string? userName = null,
        string? entityType = null,
        Guid? entityId = null,
        string? oldValues = null,
        string? newValues = null,
        string? ipAddress = null,
        string? userAgent = null,
        string? additionalData = null)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        ActivityType = activityType;
        ActivityDescription = activityDescription;
        Severity = severity;
        UserId = userId;
        UserName = userName;
        EntityType = entityType;
        EntityId = entityId;
        OldValues = oldValues;
        NewValues = newValues;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        AdditionalData = additionalData;
        CreatedAt = DateTime.UtcNow;
    }
    
    public static TenantActivityLog Create(
        Guid tenantId,
        string activityType,
        string activityDescription,
        string severity = "Info",
        string? userId = null,
        string? userName = null)
    {
        if (string.IsNullOrWhiteSpace(activityType))
            throw new ArgumentException("Activity type cannot be empty.", nameof(activityType));
            
        if (string.IsNullOrWhiteSpace(activityDescription))
            throw new ArgumentException("Activity description cannot be empty.", nameof(activityDescription));
            
        return new TenantActivityLog(
            tenantId, 
            activityType, 
            activityDescription, 
            severity,
            userId,
            userName);
    }
    
    public static TenantActivityLog CreateEntityLog(
        Guid tenantId,
        string activityType,
        string activityDescription,
        string entityType,
        Guid entityId,
        string? oldValues = null,
        string? newValues = null,
        string? userId = null,
        string? userName = null,
        string severity = "Info")
    {
        return new TenantActivityLog(
            tenantId,
            activityType,
            activityDescription,
            severity,
            userId,
            userName,
            entityType,
            entityId,
            oldValues,
            newValues);
    }
    
    public static TenantActivityLog CreateSecurityLog(
        Guid tenantId,
        string activityType,
        string activityDescription,
        string ipAddress,
        string? userAgent,
        string? userId = null,
        string? userName = null,
        string severity = "Warning")
    {
        return new TenantActivityLog(
            tenantId,
            activityType,
            activityDescription,
            severity,
            userId,
            userName,
            null,
            null,
            null,
            null,
            ipAddress,
            userAgent);
    }
    
    public void SetRequestInfo(string? ipAddress, string? userAgent)
    {
        IpAddress = ipAddress;
        UserAgent = userAgent;
    }
    
    public void SetAdditionalData(string additionalData)
    {
        AdditionalData = additionalData;
    }
}