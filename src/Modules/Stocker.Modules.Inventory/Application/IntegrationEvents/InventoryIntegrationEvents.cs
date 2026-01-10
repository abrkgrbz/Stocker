using MediatR;

namespace Stocker.Modules.Inventory.Application.IntegrationEvents;

/// <summary>
/// Base class for inventory integration events that are published to other modules.
/// </summary>
public abstract record InventoryIntegrationEvent : INotification
{
    public Guid TenantId { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}

#region Product Events

/// <summary>
/// Published when a product is created.
/// Other modules (Finance, Sales) can subscribe to sync product data.
/// </summary>
public sealed record ProductCreatedIntegrationEvent(
    Guid TenantId,
    int ProductId,
    string ProductCode,
    string ProductName,
    string? Barcode,
    int CategoryId,
    int? BrandId,
    int UnitOfMeasureId,
    decimal? SalesPrice,
    decimal? PurchasePrice,
    bool IsActive) : InventoryIntegrationEvent;

/// <summary>
/// Published when a product is updated.
/// </summary>
public sealed record ProductUpdatedIntegrationEvent(
    Guid TenantId,
    int ProductId,
    string ProductCode,
    string ProductName,
    string? Barcode,
    int CategoryId,
    int? BrandId,
    decimal? SalesPrice,
    decimal? PurchasePrice,
    bool IsActive) : InventoryIntegrationEvent;

/// <summary>
/// Published when a product is deleted/deactivated.
/// </summary>
public sealed record ProductDeactivatedIntegrationEvent(
    Guid TenantId,
    int ProductId,
    string ProductCode) : InventoryIntegrationEvent;

#endregion

#region Stock Events

/// <summary>
/// Published when stock level changes.
/// Finance module can use this for inventory valuation.
/// </summary>
public sealed record StockLevelChangedIntegrationEvent(
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    decimal PreviousQuantity,
    decimal NewQuantity,
    decimal Change,
    string ChangeReason,
    string? Reference) : InventoryIntegrationEvent;

/// <summary>
/// Published when stock is reserved for an order.
/// </summary>
public sealed record StockReservedIntegrationEvent(
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    decimal ReservedQuantity,
    string OrderReference,
    int? OrderId) : InventoryIntegrationEvent;

/// <summary>
/// Published when stock reservation is released.
/// </summary>
public sealed record StockReservationReleasedIntegrationEvent(
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    decimal ReleasedQuantity,
    string OrderReference,
    int? OrderId) : InventoryIntegrationEvent;

/// <summary>
/// Published when stock falls below minimum level.
/// </summary>
public sealed record LowStockAlertIntegrationEvent(
    Guid TenantId,
    int ProductId,
    string ProductCode,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    decimal CurrentQuantity,
    decimal MinimumQuantity,
    decimal? ReorderQuantity) : InventoryIntegrationEvent;

#endregion

#region Stock Count Events

/// <summary>
/// Published when a stock count is completed and approved.
/// Finance module can use this for inventory adjustment entries.
/// </summary>
public sealed record StockCountCompletedIntegrationEvent(
    Guid TenantId,
    int StockCountId,
    string CountNumber,
    int WarehouseId,
    DateTime CompletedAt,
    int TotalProducts,
    int ProductsWithDiscrepancies,
    decimal TotalPositiveDifference,
    decimal TotalNegativeDifference) : InventoryIntegrationEvent;

/// <summary>
/// Published when stock adjustments are applied from a stock count.
/// </summary>
public sealed record StockAdjustmentsAppliedIntegrationEvent(
    Guid TenantId,
    int StockCountId,
    string CountNumber,
    int WarehouseId,
    decimal TotalDifference,
    decimal TotalPositiveValue,
    decimal TotalNegativeValue,
    List<StockAdjustmentLineItem> Adjustments) : InventoryIntegrationEvent;

public record StockAdjustmentLineItem(
    int ProductId,
    string ProductCode,
    decimal SystemQuantity,
    decimal CountedQuantity,
    decimal Difference,
    decimal UnitCost,
    decimal TotalValue);

#endregion

#region Price List Events

/// <summary>
/// Published when a price list is activated or updated.
/// Sales module can use this for order pricing.
/// </summary>
public sealed record PriceListActivatedIntegrationEvent(
    Guid TenantId,
    int PriceListId,
    string PriceListCode,
    string PriceListName,
    string Currency,
    bool IsDefault,
    DateTime? ValidFrom,
    DateTime? ValidTo,
    int? CustomerGroupId) : InventoryIntegrationEvent;

/// <summary>
/// Published when price list items are updated.
/// </summary>
public sealed record PriceListItemsUpdatedIntegrationEvent(
    Guid TenantId,
    int PriceListId,
    string PriceListCode,
    List<PriceListItemChange> Changes) : InventoryIntegrationEvent;

public record PriceListItemChange(
    int ProductId,
    string ChangeType, // Added, Updated, Removed
    decimal? OldPrice,
    decimal? NewPrice,
    string Currency);

/// <summary>
/// Published when a price list is deactivated.
/// </summary>
public sealed record PriceListDeactivatedIntegrationEvent(
    Guid TenantId,
    int PriceListId,
    string PriceListCode) : InventoryIntegrationEvent;

#endregion

#region Warehouse Events

/// <summary>
/// Published when a warehouse is created.
/// </summary>
public sealed record WarehouseCreatedIntegrationEvent(
    Guid TenantId,
    int WarehouseId,
    string WarehouseCode,
    string WarehouseName,
    string? Address,
    bool IsDefault) : InventoryIntegrationEvent;

/// <summary>
/// Published when a warehouse is updated.
/// </summary>
public sealed record WarehouseUpdatedIntegrationEvent(
    Guid TenantId,
    int WarehouseId,
    string WarehouseCode,
    string WarehouseName,
    string? Address,
    bool IsDefault,
    bool IsActive) : InventoryIntegrationEvent;

#endregion

#region Lot/Batch Events

/// <summary>
/// Published when a lot/batch expires.
/// Finance module can use this for inventory write-off.
/// </summary>
public sealed record LotBatchExpiredIntegrationEvent(
    Guid TenantId,
    int LotBatchId,
    string LotNumber,
    int ProductId,
    string ProductCode,
    DateTime ExpiryDate,
    decimal RemainingQuantity,
    decimal EstimatedValue) : InventoryIntegrationEvent;

/// <summary>
/// Published when a lot/batch is quarantined.
/// </summary>
public sealed record LotBatchQuarantinedIntegrationEvent(
    Guid TenantId,
    int LotBatchId,
    string LotNumber,
    int ProductId,
    string ProductCode,
    string Reason,
    decimal Quantity) : InventoryIntegrationEvent;

/// <summary>
/// Published when a lot/batch is rejected.
/// </summary>
public sealed record LotBatchRejectedIntegrationEvent(
    Guid TenantId,
    int LotBatchId,
    string LotNumber,
    int ProductId,
    string ProductCode,
    string? Reason,
    decimal Quantity,
    int? SupplierId) : InventoryIntegrationEvent;

#endregion

#region Serial Number Events

/// <summary>
/// Published when a serial number is sold.
/// </summary>
public sealed record SerialNumberSoldIntegrationEvent(
    Guid TenantId,
    int SerialNumberId,
    string Serial,
    int ProductId,
    string ProductCode,
    Guid? CustomerId,
    Guid? SalesOrderId,
    DateTime SoldDate,
    DateTime? WarrantyEndDate) : InventoryIntegrationEvent;

/// <summary>
/// Published when a serial number is returned.
/// </summary>
public sealed record SerialNumberReturnedIntegrationEvent(
    Guid TenantId,
    int SerialNumberId,
    string Serial,
    int ProductId,
    string ProductCode,
    int? CustomerId,
    DateTime ReturnedDate,
    string? ReturnReason) : InventoryIntegrationEvent;

/// <summary>
/// Published when a serial number is scrapped.
/// Finance module can use this for asset write-off.
/// </summary>
public sealed record SerialNumberScrappedIntegrationEvent(
    Guid TenantId,
    int SerialNumberId,
    string Serial,
    int ProductId,
    string ProductCode,
    string? Reason,
    decimal? BookValue) : InventoryIntegrationEvent;

/// <summary>
/// Published when a serial number is marked as lost.
/// </summary>
public sealed record SerialNumberLostIntegrationEvent(
    Guid TenantId,
    int SerialNumberId,
    string Serial,
    int ProductId,
    string ProductCode,
    string? Reason,
    decimal? BookValue) : InventoryIntegrationEvent;

#endregion

#region Inventory Valuation Events

/// <summary>
/// Published when product cost is updated.
/// Finance module can use this for inventory revaluation.
/// </summary>
public sealed record ProductCostUpdatedIntegrationEvent(
    Guid TenantId,
    int ProductId,
    string ProductCode,
    decimal OldCost,
    decimal NewCost,
    decimal CurrentQuantity,
    decimal ValueChange,
    string Reason) : InventoryIntegrationEvent;

/// <summary>
/// Published when stock is adjusted (from cycle count, manual adjustment, etc.).
/// </summary>
public sealed record StockAdjustedIntegrationEvent(
    Guid TenantId,
    int WarehouseId,
    int ProductId,
    decimal OldQuantity,
    decimal NewQuantity,
    string AdjustmentType,
    string? Details) : InventoryIntegrationEvent;

#endregion
