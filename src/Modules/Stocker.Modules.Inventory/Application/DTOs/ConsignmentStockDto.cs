namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for ConsignmentStock entity
/// </summary>
public record ConsignmentStockDto
{
    public int Id { get; init; }
    public string ConsignmentNumber { get; init; } = string.Empty;
    public int SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public DateTime AgreementDate { get; init; }
    public DateTime? AgreementEndDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public int ProductId { get; init; }
    public string? ProductName { get; init; }
    public int WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public int? LocationId { get; init; }
    public string? LocationName { get; init; }
    public string? LotNumber { get; init; }
    public decimal InitialQuantity { get; init; }
    public decimal CurrentQuantity { get; init; }
    public decimal SoldQuantity { get; init; }
    public decimal ReturnedQuantity { get; init; }
    public decimal DamagedQuantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal UnitCost { get; init; }
    public decimal? SellingPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? CommissionRate { get; init; }
    public DateTime? LastReconciliationDate { get; init; }
    public int ReconciliationPeriodDays { get; init; }
    public DateTime? NextReconciliationDate { get; init; }
    public decimal TotalSalesAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal OutstandingAmount { get; init; }
    public int? MaxConsignmentDays { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public DateTime ReceivedDate { get; init; }
    public string? AgreementNotes { get; init; }
    public string? InternalNotes { get; init; }
    public List<ConsignmentStockMovementDto> Movements { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Data transfer object for ConsignmentStockMovement
/// </summary>
public record ConsignmentStockMovementDto
{
    public int Id { get; init; }
    public string MovementType { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal TotalAmount { get; init; }
    public DateTime MovementDate { get; init; }
    public string? ReferenceNumber { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// DTO for creating a consignment stock
/// </summary>
public record CreateConsignmentStockDto
{
    public int SupplierId { get; init; }
    public int ProductId { get; init; }
    public int WarehouseId { get; init; }
    public int? LocationId { get; init; }
    public decimal InitialQuantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal UnitCost { get; init; }
    public decimal? SellingPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? CommissionRate { get; init; }
    public string? LotNumber { get; init; }
    public DateTime? AgreementEndDate { get; init; }
    public int? MaxConsignmentDays { get; init; }
    public int ReconciliationPeriodDays { get; init; } = 30;
    public string? AgreementNotes { get; init; }
}

/// <summary>
/// DTO for recording a consignment sale
/// </summary>
public record RecordConsignmentSaleDto
{
    public decimal Quantity { get; init; }
    public decimal SellingPrice { get; init; }
    public string? ReferenceNumber { get; init; }
}

/// <summary>
/// DTO for recording a consignment return
/// </summary>
public record RecordConsignmentReturnDto
{
    public decimal Quantity { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string? ReferenceNumber { get; init; }
}

/// <summary>
/// DTO for recording consignment damage
/// </summary>
public record RecordConsignmentDamageDto
{
    public decimal Quantity { get; init; }
    public string Reason { get; init; } = string.Empty;
}

/// <summary>
/// DTO for recording consignment payment
/// </summary>
public record RecordConsignmentPaymentDto
{
    public decimal Amount { get; init; }
    public string? ReferenceNumber { get; init; }
}

/// <summary>
/// DTO for updating a consignment stock
/// </summary>
public record UpdateConsignmentStockDto
{
    public int? LocationId { get; init; }
    public decimal? SellingPrice { get; init; }
    public decimal? CommissionRate { get; init; }
    public DateTime? AgreementEndDate { get; init; }
    public int? MaxConsignmentDays { get; init; }
    public int? ReconciliationPeriodDays { get; init; }
    public string? AgreementNotes { get; init; }
    public string? InternalNotes { get; init; }
}
