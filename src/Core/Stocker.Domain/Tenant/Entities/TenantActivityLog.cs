using Stocker.SharedKernel.Primitives;
using System;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Tenant'a özel aktivite logları - Tüm kullanıcı ve sistem aktivitelerini takip eder
/// </summary>
public sealed class TenantActivityLog : Entity
{
    // Activity Information
    public string ActivityType { get; private set; }
    public string EntityType { get; private set; }
    public Guid? EntityId { get; private set; }
    public string Action { get; private set; }
    public string Description { get; private set; }
    
    // User Information
    public Guid UserId { get; private set; }
    public string UserName { get; private set; }
    public string UserEmail { get; private set; }
    public string? UserRole { get; private set; }
    
    // Context Information
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? SessionId { get; private set; }
    public string? RequestId { get; private set; }
    
    // Data Tracking
    public string? OldData { get; private set; } // JSON for audit trail
    public string? NewData { get; private set; } // JSON for audit trail
    public string? Changes { get; private set; } // JSON diff
    public string? AdditionalData { get; private set; } // JSON for extra context
    
    // Result Information
    public bool IsSuccess { get; private set; }
    public string? ErrorMessage { get; private set; }
    public string? ErrorDetails { get; private set; }
    public int? HttpStatusCode { get; private set; }
    
    // Timing
    public DateTime ActivityAt { get; private set; }
    public TimeSpan? Duration { get; private set; }
    
    // Categorization
    public ActivityCategory Category { get; private set; }
    public ActivitySeverity Severity { get; private set; }
    public bool IsSystemGenerated { get; private set; }
    
    private TenantActivityLog() { }
    
    private TenantActivityLog(
        string activityType,
        string entityType,
        string action,
        string description,
        Guid userId,
        string userName,
        string userEmail)
    {
        Id = Guid.NewGuid();
        ActivityType = activityType;
        EntityType = entityType;
        Action = action;
        Description = description;
        UserId = userId;
        UserName = userName;
        UserEmail = userEmail;
        ActivityAt = DateTime.UtcNow;
        IsSuccess = true;
        Category = DetermineCategory(activityType);
        Severity = DetermineSeverity(action);
        IsSystemGenerated = false;
    }
    
    public static TenantActivityLog Create(
        string activityType,
        string entityType,
        string action,
        string description,
        Guid userId,
        string userName,
        string userEmail)
    {
        if (string.IsNullOrWhiteSpace(activityType))
            throw new ArgumentException("Activity type cannot be empty.", nameof(activityType));
        if (string.IsNullOrWhiteSpace(entityType))
            throw new ArgumentException("Entity type cannot be empty.", nameof(entityType));
        if (string.IsNullOrWhiteSpace(action))
            throw new ArgumentException("Action cannot be empty.", nameof(action));
        if (string.IsNullOrWhiteSpace(userName))
            throw new ArgumentException("User name cannot be empty.", nameof(userName));
            
        return new TenantActivityLog(
            activityType,
            entityType,
            action,
            description,
            userId,
            userName,
            userEmail);
    }
    
    public static TenantActivityLog CreateSystemActivity(
        string activityType,
        string entityType,
        string action,
        string description)
    {
        var log = new TenantActivityLog
        {
            Id = Guid.NewGuid(),
            ActivityType = activityType,
            EntityType = entityType,
            Action = action,
            Description = description,
            UserId = Guid.Empty,
            UserName = "System",
            UserEmail = "system@stocker.com",
            ActivityAt = DateTime.UtcNow,
            IsSuccess = true,
            IsSystemGenerated = true,
            Category = DetermineCategory(activityType),
            Severity = DetermineSeverity(action)
        };
        
        return log;
    }
    
    public void SetEntityReference(Guid entityId)
    {
        EntityId = entityId;
    }
    
    public void SetUserContext(string? userRole, string? ipAddress, string? userAgent, string? sessionId)
    {
        UserRole = userRole;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        SessionId = sessionId;
    }
    
    public void SetRequestContext(string requestId)
    {
        RequestId = requestId;
    }
    
    public void SetAuditData(string? oldData, string? newData, string? changes)
    {
        OldData = oldData;
        NewData = newData;
        Changes = changes;
    }
    
    public void SetAdditionalData(string additionalData)
    {
        AdditionalData = additionalData;
    }
    
    public void MarkAsSuccess(TimeSpan? duration = null)
    {
        IsSuccess = true;
        Duration = duration;
    }
    
    public void MarkAsFailure(string errorMessage, string? errorDetails = null, int? httpStatusCode = null)
    {
        IsSuccess = false;
        ErrorMessage = errorMessage;
        ErrorDetails = errorDetails;
        HttpStatusCode = httpStatusCode;
        Severity = ActivitySeverity.Error;
    }
    
    public void SetDuration(TimeSpan duration)
    {
        Duration = duration;
    }
    
    public void SetHttpStatusCode(int statusCode)
    {
        HttpStatusCode = statusCode;
    }
    
    private static ActivityCategory DetermineCategory(string activityType)
    {
        return activityType.ToLowerInvariant() switch
        {
            var type when type.Contains("auth") || type.Contains("login") || type.Contains("logout") => ActivityCategory.Authentication,
            var type when type.Contains("create") || type.Contains("add") || type.Contains("insert") => ActivityCategory.Create,
            var type when type.Contains("update") || type.Contains("edit") || type.Contains("modify") => ActivityCategory.Update,
            var type when type.Contains("delete") || type.Contains("remove") => ActivityCategory.Delete,
            var type when type.Contains("read") || type.Contains("view") || type.Contains("get") => ActivityCategory.Read,
            var type when type.Contains("export") || type.Contains("import") => ActivityCategory.DataTransfer,
            var type when type.Contains("config") || type.Contains("setting") => ActivityCategory.Configuration,
            var type when type.Contains("security") || type.Contains("permission") => ActivityCategory.Security,
            var type when type.Contains("system") || type.Contains("maintenance") => ActivityCategory.System,
            _ => ActivityCategory.Other
        };
    }
    
    private static ActivitySeverity DetermineSeverity(string action)
    {
        return action.ToLowerInvariant() switch
        {
            var act when act.Contains("delete") || act.Contains("remove") => ActivitySeverity.High,
            var act when act.Contains("create") || act.Contains("update") || act.Contains("modify") => ActivitySeverity.Medium,
            var act when act.Contains("login") || act.Contains("logout") => ActivitySeverity.Medium,
            var act when act.Contains("read") || act.Contains("view") || act.Contains("list") => ActivitySeverity.Low,
            var act when act.Contains("export") || act.Contains("download") => ActivitySeverity.Medium,
            var act when act.Contains("permission") || act.Contains("role") || act.Contains("security") => ActivitySeverity.High,
            _ => ActivitySeverity.Info
        };
    }
}

public enum ActivityCategory
{
    Authentication = 0,
    Create = 1,
    Update = 2,
    Delete = 3,
    Read = 4,
    DataTransfer = 5,
    Configuration = 6,
    Security = 7,
    System = 8,
    Integration = 9,
    Report = 10,
    Other = 99
}

public enum ActivitySeverity
{
    Info = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4,
    Error = 5
}