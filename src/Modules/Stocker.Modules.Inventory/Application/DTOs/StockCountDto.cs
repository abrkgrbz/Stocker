using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for StockCount entity
/// </summary>
public class StockCountDto
{
    public int Id { get; set; }
    public string CountNumber { get; set; } = string.Empty;
    public DateTime CountDate { get; set; }
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int? LocationId { get; set; }
    public string? LocationName { get; set; }
    public StockCountStatus Status { get; set; }
    public StockCountType CountType { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public bool AutoAdjust { get; set; }
    public DateTime? StartedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? CancelledDate { get; set; }
    public string? CancellationReason { get; set; }
    public int CreatedByUserId { get; set; }
    public int? CompletedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalItems { get; set; }
    public int CountedItems { get; set; }
    public int ItemsWithDifferenceCount { get; set; }
    public decimal TotalSystemQuantity { get; set; }
    public decimal TotalCountedQuantity { get; set; }
    public decimal TotalDifference { get; set; }
    public List<StockCountItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for creating a stock count item
/// </summary>
public class CreateStockCountItemDto
{
    public int ProductId { get; set; }
    public decimal SystemQuantity { get; set; }
    public int? LocationId { get; set; }
    public string? SerialNumber { get; set; }
    public string? LotNumber { get; set; }
}

/// <summary>
/// DTO for creating a stock count
/// </summary>
public class CreateStockCountDto
{
    public string CountNumber { get; set; } = string.Empty;
    public DateTime CountDate { get; set; }
    public int WarehouseId { get; set; }
    public int? LocationId { get; set; }
    public StockCountType CountType { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public bool AutoAdjust { get; set; }
    public int CreatedByUserId { get; set; }
    public List<CreateStockCountItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for updating a stock count
/// </summary>
public class UpdateStockCountDto
{
    public string? Description { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for stock count item
/// </summary>
public class StockCountItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int? LocationId { get; set; }
    public string? LocationName { get; set; }
    public decimal SystemQuantity { get; set; }
    public decimal? CountedQuantity { get; set; }
    public decimal? Difference { get; set; }
    public bool HasDifference { get; set; }
    public string? SerialNumber { get; set; }
    public string? LotNumber { get; set; }
    public string? Notes { get; set; }
    public bool IsCounted { get; set; }
}

/// <summary>
/// DTO for recording a count
/// </summary>
public class RecordCountDto
{
    public int ItemId { get; set; }
    public decimal CountedQuantity { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for batch count recording
/// </summary>
public class BatchRecordCountDto
{
    public int StockCountId { get; set; }
    public List<RecordCountDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for stock count listing (lightweight)
/// </summary>
public class StockCountListDto
{
    public int Id { get; set; }
    public string CountNumber { get; set; } = string.Empty;
    public DateTime CountDate { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string? LocationName { get; set; }
    public StockCountStatus Status { get; set; }
    public StockCountType CountType { get; set; }
    public int TotalItems { get; set; }
    public int CountedItems { get; set; }
    public int ItemsWithDifference { get; set; }
}

/// <summary>
/// DTO for stock count filter
/// </summary>
public class StockCountFilterDto
{
    public int? WarehouseId { get; set; }
    public int? LocationId { get; set; }
    public StockCountStatus? Status { get; set; }
    public StockCountType? CountType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// DTO for stock count summary/report
/// </summary>
public class StockCountSummaryDto
{
    public int StockCountId { get; set; }
    public string CountNumber { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public int TotalItems { get; set; }
    public int ItemsWithNoChange { get; set; }
    public int ItemsWithPositiveDifference { get; set; }
    public int ItemsWithNegativeDifference { get; set; }
    public decimal TotalPositiveDifference { get; set; }
    public decimal TotalNegativeDifference { get; set; }
    public decimal NetDifference { get; set; }
    public decimal EstimatedValueImpact { get; set; }
}
