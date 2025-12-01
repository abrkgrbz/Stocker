using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for StockMovement entity
/// </summary>
public class StockMovementDto
{
    public int Id { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
    public DateTime MovementDate { get; set; }
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int? FromLocationId { get; set; }
    public string? FromLocationName { get; set; }
    public int? ToLocationId { get; set; }
    public string? ToLocationName { get; set; }
    public StockMovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public string? ReferenceDocumentType { get; set; }
    public string? ReferenceDocumentNumber { get; set; }
    public int? ReferenceDocumentId { get; set; }
    public string? SerialNumber { get; set; }
    public string? LotNumber { get; set; }
    public string? Description { get; set; }
    public int UserId { get; set; }
    public bool IsReversed { get; set; }
    public int? ReversedMovementId { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a stock movement
/// </summary>
public class CreateStockMovementDto
{
    public string DocumentNumber { get; set; } = string.Empty;
    public DateTime MovementDate { get; set; }
    public int ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int? FromLocationId { get; set; }
    public int? ToLocationId { get; set; }
    public StockMovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? ReferenceDocumentType { get; set; }
    public string? ReferenceDocumentNumber { get; set; }
    public int? ReferenceDocumentId { get; set; }
    public string? SerialNumber { get; set; }
    public string? LotNumber { get; set; }
    public string? Description { get; set; }
    public int UserId { get; set; }
}

/// <summary>
/// DTO for stock movement listing (lightweight)
/// </summary>
public class StockMovementListDto
{
    public int Id { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public StockMovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public DateTime MovementDate { get; set; }
}

/// <summary>
/// DTO for stock movement search/filter
/// </summary>
public class StockMovementFilterDto
{
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public int? LocationId { get; set; }
    public StockMovementType? MovementType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? ReferenceDocumentType { get; set; }
    public string? ReferenceDocumentNumber { get; set; }
    public string? LotNumber { get; set; }
    public string? SerialNumber { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// DTO for stock movement summary
/// </summary>
public class StockMovementSummaryDto
{
    public int TotalMovements { get; set; }
    public decimal TotalInbound { get; set; }
    public decimal TotalOutbound { get; set; }
    public decimal TotalAdjustments { get; set; }
    public decimal TotalTransfers { get; set; }
    public decimal NetChange { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}
