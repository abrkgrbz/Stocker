using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for StockReservation entity
/// </summary>
public class StockReservationDto
{
    public int Id { get; set; }
    public string ReservationNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int? LocationId { get; set; }
    public string? LocationName { get; set; }
    public decimal Quantity { get; set; }
    public decimal FulfilledQuantity { get; set; }
    public decimal RemainingQuantity { get; set; }
    public ReservationStatus Status { get; set; }
    public ReservationType ReservationType { get; set; }
    public string? ReferenceDocumentType { get; set; }
    public string? ReferenceDocumentNumber { get; set; }
    public Guid? ReferenceDocumentId { get; set; }
    public DateTime ReservationDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? Notes { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a stock reservation
/// </summary>
public class CreateStockReservationDto
{
    public string ReservationNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int? LocationId { get; set; }
    public decimal Quantity { get; set; }
    public ReservationType ReservationType { get; set; }
    public string? ReferenceDocumentType { get; set; }
    public string? ReferenceDocumentNumber { get; set; }
    public Guid? ReferenceDocumentId { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? Notes { get; set; }
    public int CreatedByUserId { get; set; }
}

/// <summary>
/// DTO for fulfilling a reservation
/// </summary>
public class FulfillReservationDto
{
    public int ReservationId { get; set; }
    public decimal QuantityToFulfill { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for reservation listing (lightweight)
/// </summary>
public class StockReservationListDto
{
    public int Id { get; set; }
    public string ReservationNumber { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal FulfilledQuantity { get; set; }
    public ReservationStatus Status { get; set; }
    public DateTime ReservationDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
}

/// <summary>
/// DTO for reservation filter
/// </summary>
public class StockReservationFilterDto
{
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public ReservationStatus? Status { get; set; }
    public ReservationType? ReservationType { get; set; }
    public string? ReferenceDocumentType { get; set; }
    public int? ReferenceDocumentId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public bool? ExpiringSoon { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
