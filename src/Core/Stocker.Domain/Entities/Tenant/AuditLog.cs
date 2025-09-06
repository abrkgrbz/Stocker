using Stocker.Domain.Common;

namespace Stocker.Domain.Entities.Tenant;

public sealed class AuditLog : BaseEntity
{
    public Guid TenantId { get; private set; }
    public string EntityName { get; private set; }
    public string EntityId { get; private set; }
    public string Action { get; private set; }
    public string? OldValues { get; private set; }
    public string? NewValues { get; private set; }
    public string? Changes { get; private set; }
    public string UserId { get; private set; }
    public string UserName { get; private set; }
    public string? UserEmail { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public DateTime Timestamp { get; private set; }
    public string? AdditionalData { get; private set; }

    private AuditLog() { } // EF Core

    public AuditLog(
        Guid tenantId,
        string entityName,
        string entityId,
        string action,
        string userId,
        string userName)
    {
        TenantId = tenantId;
        EntityName = entityName;
        EntityId = entityId;
        Action = action;
        UserId = userId;
        UserName = userName;
        Timestamp = DateTime.UtcNow;
    }

    public static AuditLog Create(
        Guid tenantId,
        string entityName,
        string entityId,
        string action,
        string userId,
        string userName,
        string? userEmail = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        var auditLog = new AuditLog(tenantId, entityName, entityId, action, userId, userName)
        {
            UserEmail = userEmail,
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        return auditLog;
    }

    public void SetOldValues(string? oldValues)
    {
        OldValues = oldValues;
    }

    public void SetNewValues(string? newValues)
    {
        NewValues = newValues;
    }

    public void SetChanges(string? changes)
    {
        Changes = changes;
    }

    public void SetAdditionalData(string? additionalData)
    {
        AdditionalData = additionalData;
    }
}