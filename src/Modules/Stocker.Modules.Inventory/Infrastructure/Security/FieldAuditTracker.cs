using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Security;

/// <summary>
/// Tracks field-level changes on entities for compliance auditing.
/// Captures old/new values, who changed, and when.
/// </summary>
public class FieldAuditTracker
{
    private readonly ILogger<FieldAuditTracker> _logger;

    public FieldAuditTracker(ILogger<FieldAuditTracker> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Capture field-level changes from DbContext change tracker.
    /// Call before SaveChanges to record what changed.
    /// </summary>
    public List<FieldChangeRecord> CaptureChanges(ChangeTracker changeTracker, string userId, Guid tenantId)
    {
        var records = new List<FieldChangeRecord>();

        var modifiedEntities = changeTracker.Entries()
            .Where(e => e.State == EntityState.Modified || e.State == EntityState.Deleted);

        foreach (var entry in modifiedEntities)
        {
            var entityType = entry.Entity.GetType().Name;
            var entityId = GetEntityId(entry);

            if (entry.State == EntityState.Deleted)
            {
                records.Add(new FieldChangeRecord
                {
                    TenantId = tenantId,
                    EntityType = entityType,
                    EntityId = entityId,
                    FieldName = "*",
                    OldValue = "Entity deleted",
                    NewValue = null,
                    ChangedBy = userId,
                    ChangedAt = DateTime.UtcNow,
                    ChangeType = ChangeType.Delete
                });
                continue;
            }

            foreach (var property in entry.Properties)
            {
                if (!property.IsModified) continue;
                if (IsIgnoredField(property.Metadata.Name)) continue;

                var oldValue = property.OriginalValue?.ToString();
                var newValue = property.CurrentValue?.ToString();

                if (oldValue == newValue) continue;

                var isSensitive = IsSensitiveField(property.Metadata.Name);

                records.Add(new FieldChangeRecord
                {
                    TenantId = tenantId,
                    EntityType = entityType,
                    EntityId = entityId,
                    FieldName = property.Metadata.Name,
                    OldValue = isSensitive ? "***MASKED***" : oldValue,
                    NewValue = isSensitive ? "***MASKED***" : newValue,
                    ChangedBy = userId,
                    ChangedAt = DateTime.UtcNow,
                    ChangeType = ChangeType.Update,
                    IsSensitive = isSensitive
                });
            }
        }

        if (records.Count > 0)
        {
            _logger.LogDebug("Captured {Count} field changes for {EntityCount} entities",
                records.Count, records.Select(r => r.EntityId).Distinct().Count());
        }

        return records;
    }

    private static string GetEntityId(EntityEntry entry)
    {
        var keyProperties = entry.Properties
            .Where(p => p.Metadata.IsPrimaryKey())
            .Select(p => p.CurrentValue?.ToString() ?? "null");
        return string.Join(":", keyProperties);
    }

    private static bool IsIgnoredField(string fieldName)
    {
        return fieldName is "UpdatedAt" or "ModifiedAt" or "LastModified" or "RowVersion" or "ConcurrencyToken";
    }

    private static bool IsSensitiveField(string fieldName)
    {
        var sensitivePatterns = new[] { "Price", "Cost", "Amount", "Tax", "Discount", "Salary", "Password", "Secret", "Token" };
        return sensitivePatterns.Any(p => fieldName.Contains(p, StringComparison.OrdinalIgnoreCase));
    }
}

/// <summary>
/// Record of a field-level change for audit purposes.
/// </summary>
public class FieldChangeRecord
{
    public Guid TenantId { get; init; }
    public string EntityType { get; init; } = string.Empty;
    public string EntityId { get; init; } = string.Empty;
    public string FieldName { get; init; } = string.Empty;
    public string? OldValue { get; init; }
    public string? NewValue { get; init; }
    public string ChangedBy { get; init; } = string.Empty;
    public DateTime ChangedAt { get; init; }
    public ChangeType ChangeType { get; init; }
    public bool IsSensitive { get; init; }
}

public enum ChangeType
{
    Create,
    Update,
    Delete
}
