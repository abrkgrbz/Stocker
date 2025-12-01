using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for StockTransfer entity
/// </summary>
public class StockTransferDto
{
    public int Id { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public DateTime TransferDate { get; set; }
    public int SourceWarehouseId { get; set; }
    public string SourceWarehouseName { get; set; } = string.Empty;
    public int DestinationWarehouseId { get; set; }
    public string DestinationWarehouseName { get; set; } = string.Empty;
    public TransferStatus Status { get; set; }
    public TransferType TransferType { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public DateTime? ExpectedArrivalDate { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? CancelledDate { get; set; }
    public string? CancellationReason { get; set; }
    public int CreatedByUserId { get; set; }
    public int? ApprovedByUserId { get; set; }
    public int? ShippedByUserId { get; set; }
    public int? ReceivedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal TotalRequestedQuantity { get; set; }
    public decimal TotalShippedQuantity { get; set; }
    public decimal TotalReceivedQuantity { get; set; }
    public List<StockTransferItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for creating a stock transfer
/// </summary>
public class CreateStockTransferDto
{
    public string TransferNumber { get; set; } = string.Empty;
    public DateTime TransferDate { get; set; }
    public int SourceWarehouseId { get; set; }
    public int DestinationWarehouseId { get; set; }
    public TransferType TransferType { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public DateTime? ExpectedArrivalDate { get; set; }
    public int CreatedByUserId { get; set; }
    public List<CreateStockTransferItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for updating a stock transfer
/// </summary>
public class UpdateStockTransferDto
{
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public DateTime? ExpectedArrivalDate { get; set; }
}

/// <summary>
/// DTO for stock transfer item
/// </summary>
public class StockTransferItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int? SourceLocationId { get; set; }
    public string? SourceLocationName { get; set; }
    public int? DestinationLocationId { get; set; }
    public string? DestinationLocationName { get; set; }
    public decimal RequestedQuantity { get; set; }
    public decimal ShippedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal DamagedQuantity { get; set; }
    public string? SerialNumber { get; set; }
    public string? LotNumber { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for creating a stock transfer item
/// </summary>
public class CreateStockTransferItemDto
{
    public int ProductId { get; set; }
    public int? SourceLocationId { get; set; }
    public int? DestinationLocationId { get; set; }
    public decimal RequestedQuantity { get; set; }
    public string? SerialNumber { get; set; }
    public string? LotNumber { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for receiving transfer items
/// </summary>
public class ReceiveTransferItemDto
{
    public int ItemId { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal DamagedQuantity { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for stock transfer listing (lightweight)
/// </summary>
public class StockTransferListDto
{
    public int Id { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public DateTime TransferDate { get; set; }
    public string SourceWarehouseName { get; set; } = string.Empty;
    public string DestinationWarehouseName { get; set; } = string.Empty;
    public TransferStatus Status { get; set; }
    public TransferType TransferType { get; set; }
    public int ItemCount { get; set; }
    public decimal TotalQuantity { get; set; }
}

/// <summary>
/// DTO for stock transfer filter
/// </summary>
public class StockTransferFilterDto
{
    public int? SourceWarehouseId { get; set; }
    public int? DestinationWarehouseId { get; set; }
    public TransferStatus? Status { get; set; }
    public TransferType? TransferType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
