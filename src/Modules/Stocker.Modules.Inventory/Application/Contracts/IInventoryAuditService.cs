using Stocker.Modules.Inventory.Application.DTOs;

namespace Stocker.Modules.Inventory.Application.Contracts;

/// <summary>
/// Service for inventory-specific audit logging and querying.
/// </summary>
public interface IInventoryAuditService
{
    #region Logging Methods

    /// <summary>
    /// Logs a product creation event.
    /// </summary>
    Task LogProductCreatedAsync(
        Guid tenantId,
        int productId,
        string productCode,
        string productName,
        string? createdBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a product update event.
    /// </summary>
    Task LogProductUpdatedAsync(
        Guid tenantId,
        int productId,
        string productCode,
        string productName,
        string? changes = null,
        string? updatedBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a stock movement event.
    /// </summary>
    Task LogStockMovementAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        string movementType,
        decimal quantity,
        decimal previousQuantity,
        decimal newQuantity,
        string? reference = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a stock count event.
    /// </summary>
    Task LogStockCountAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string action,
        string? performedBy = null,
        string? notes = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a stock adjustment event.
    /// </summary>
    Task LogStockAdjustmentAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        decimal previousQuantity,
        decimal adjustedQuantity,
        decimal newQuantity,
        string adjustmentReason,
        string? reference = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a lot/batch lifecycle event.
    /// </summary>
    Task LogLotBatchEventAsync(
        Guid tenantId,
        int lotBatchId,
        string lotNumber,
        int productId,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a serial number lifecycle event.
    /// </summary>
    Task LogSerialNumberEventAsync(
        Guid tenantId,
        int serialNumberId,
        string serial,
        int productId,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a price list event.
    /// </summary>
    Task LogPriceListEventAsync(
        Guid tenantId,
        int priceListId,
        string priceListCode,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a warehouse event.
    /// </summary>
    Task LogWarehouseEventAsync(
        Guid tenantId,
        int warehouseId,
        string warehouseCode,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a cycle count event.
    /// </summary>
    Task LogCycleCountEventAsync(
        Guid tenantId,
        int cycleCountId,
        string countNumber,
        int warehouseId,
        int categoryId,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a stock count event (simpler overload for basic event logging).
    /// </summary>
    Task LogStockCountEventAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        string eventType,
        string? details = null,
        string? userId = null,
        CancellationToken cancellationToken = default);

    #endregion

    #region Query Methods

    /// <summary>
    /// Logs an audit event with full details.
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
    /// Gets paginated audit logs with filtering.
    /// </summary>
    Task<PaginatedAuditLogsDto> GetAuditLogsAsync(
        InventoryAuditFilterDto filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets audit dashboard with summaries and trends.
    /// </summary>
    Task<InventoryAuditDashboardDto> GetAuditDashboardAsync(
        int days = 30,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets complete history for a specific entity.
    /// </summary>
    Task<EntityHistoryDto?> GetEntityHistoryAsync(
        string entityType,
        string entityId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific audit log entry by ID.
    /// </summary>
    Task<InventoryAuditLogDto?> GetAuditLogByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets supported entity types with labels.
    /// </summary>
    Dictionary<string, string> GetEntityTypes();

    /// <summary>
    /// Gets supported action types with labels.
    /// </summary>
    Dictionary<string, string> GetActionTypes();

    #endregion
}
