namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for Stock entity
/// </summary>
public class StockDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int? LocationId { get; set; }
    public string? LocationName { get; set; }
    public decimal Quantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }
    public string? SerialNumber { get; set; }
    public string? LotNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public DateTime LastMovementDate { get; set; }
    public DateTime LastCountDate { get; set; }
}

/// <summary>
/// DTO for stock adjustment
/// </summary>
public class StockAdjustmentDto
{
    public int ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int? LocationId { get; set; }
    public decimal NewQuantity { get; set; }
    public string? Reason { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for stock transfer between locations
/// </summary>
public class StockMoveDto
{
    public int ProductId { get; set; }
    public int SourceWarehouseId { get; set; }
    public int? SourceLocationId { get; set; }
    public int DestinationWarehouseId { get; set; }
    public int? DestinationLocationId { get; set; }
    public decimal Quantity { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for stock summary by product
/// </summary>
public class StockSummaryDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal TotalQuantity { get; set; }
    public decimal TotalReserved { get; set; }
    public decimal TotalAvailable { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal ReorderLevel { get; set; }
    public bool IsBelowMinimum { get; set; }
    public bool NeedsReorder { get; set; }
    public int WarehouseCount { get; set; }
}

/// <summary>
/// DTO for stock summary by warehouse
/// </summary>
public class WarehouseStockSummaryDto
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int TotalProducts { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalReserved { get; set; }
    public decimal TotalValue { get; set; }
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
}

/// <summary>
/// DTO for stock by location
/// </summary>
public class LocationStockDto
{
    public int LocationId { get; set; }
    public string LocationCode { get; set; } = string.Empty;
    public string LocationName { get; set; } = string.Empty;
    public string FullPath { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal CapacityUsed { get; set; }
}

/// <summary>
/// DTO for expiring stock alerts
/// </summary>
public class ExpiringStockDto
{
    public int StockId { get; set; }
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public string? LocationName { get; set; }
    public string? LotNumber { get; set; }
    public decimal Quantity { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int DaysUntilExpiry { get; set; }
}

/// <summary>
/// DTO for low stock alerts
/// </summary>
public class LowStockAlertDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal CurrentQuantity { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal ReorderLevel { get; set; }
    public decimal ReorderQuantity { get; set; }
    public decimal Shortage { get; set; }
}
