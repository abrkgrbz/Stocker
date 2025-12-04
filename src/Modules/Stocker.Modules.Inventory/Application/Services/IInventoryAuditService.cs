using Stocker.Modules.Inventory.Application.DTOs;

namespace Stocker.Modules.Inventory.Application.Services;

/// <summary>
/// Service for inventory-specific audit logging and retrieval
/// </summary>
public interface IInventoryAuditService
{
    /// <summary>
    /// Log an inventory audit entry
    /// </summary>
    Task LogAsync(
        string entityType,
        string entityId,
        string entityName,
        string action,
        object? oldValue = null,
        object? newValue = null,
        string? additionalData = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paginated audit logs with filtering
    /// </summary>
    Task<PaginatedAuditLogsDto> GetAuditLogsAsync(
        InventoryAuditFilterDto filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit dashboard with summaries and trends
    /// </summary>
    Task<InventoryAuditDashboardDto> GetAuditDashboardAsync(
        int days = 30,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get complete history for a specific entity
    /// </summary>
    Task<EntityHistoryDto?> GetEntityHistoryAsync(
        string entityType,
        string entityId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit log by ID
    /// </summary>
    Task<InventoryAuditLogDto?> GetAuditLogByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get supported entity types with labels
    /// </summary>
    Dictionary<string, string> GetEntityTypes();

    /// <summary>
    /// Get supported action types with labels
    /// </summary>
    Dictionary<string, string> GetActionTypes();
}
