namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for InventoryAdjustment entity
/// </summary>
public record InventoryAdjustmentDto
{
    public int Id { get; init; }
    public string AdjustmentNumber { get; init; } = string.Empty;
    public DateTime AdjustmentDate { get; init; }
    public string AdjustmentType { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public int? LocationId { get; init; }
    public string? LocationName { get; init; }
    public int? StockCountId { get; init; }
    public string? ReferenceNumber { get; init; }
    public string? ReferenceType { get; init; }
    public decimal TotalCostImpact { get; init; }
    public string Currency { get; init; } = "TRY";
    public string Status { get; init; } = string.Empty;
    public string? ApprovedBy { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public string? RejectionReason { get; init; }
    public string? InternalNotes { get; init; }
    public string? AccountingNotes { get; init; }
    public List<InventoryAdjustmentItemDto> Items { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Data transfer object for InventoryAdjustmentItem
/// </summary>
public record InventoryAdjustmentItemDto
{
    public int Id { get; init; }
    public int ProductId { get; init; }
    public string? ProductName { get; init; }
    public decimal SystemQuantity { get; init; }
    public decimal ActualQuantity { get; init; }
    public decimal VarianceQuantity { get; init; }
    public decimal UnitCost { get; init; }
    public decimal CostImpact { get; init; }
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public string? ReasonCode { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// DTO for creating an inventory adjustment
/// </summary>
public record CreateInventoryAdjustmentDto
{
    public int WarehouseId { get; init; }
    public int? LocationId { get; init; }
    public string AdjustmentType { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime? AdjustmentDate { get; init; }
    public int? StockCountId { get; init; }
    public string? ReferenceNumber { get; init; }
    public string? ReferenceType { get; init; }
    public string? InternalNotes { get; init; }
    public string? AccountingNotes { get; init; }
    public List<CreateInventoryAdjustmentItemDto> Items { get; init; } = new();
}

/// <summary>
/// DTO for creating an inventory adjustment item
/// </summary>
public record CreateInventoryAdjustmentItemDto
{
    public int ProductId { get; init; }
    public decimal SystemQuantity { get; init; }
    public decimal ActualQuantity { get; init; }
    public decimal UnitCost { get; init; }
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public string? ReasonCode { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// DTO for approving inventory adjustment
/// </summary>
public record ApproveInventoryAdjustmentDto
{
    public string ApprovedBy { get; init; } = string.Empty;
}

/// <summary>
/// DTO for rejecting inventory adjustment
/// </summary>
public record RejectInventoryAdjustmentDto
{
    public string RejectedBy { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
}

/// <summary>
/// DTO for updating an inventory adjustment
/// </summary>
public record UpdateInventoryAdjustmentDto
{
    public int? LocationId { get; init; }
    public string? Description { get; init; }
    public string? ReferenceNumber { get; init; }
    public string? ReferenceType { get; init; }
    public string? InternalNotes { get; init; }
    public string? AccountingNotes { get; init; }
}
