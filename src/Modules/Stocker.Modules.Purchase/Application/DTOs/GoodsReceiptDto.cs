using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record GoodsReceiptDto
{
    public Guid Id { get; init; }
    public string ReceiptNumber { get; init; } = string.Empty;
    public DateTime ReceiptDate { get; init; }
    public Guid? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string? DeliveryNoteNumber { get; init; }
    public DateTime? DeliveryDate { get; init; }
    public string? CarrierName { get; init; }
    public string? DriverName { get; init; }
    public string? VehiclePlate { get; init; }
    public int TotalPackages { get; init; }
    public decimal TotalWeight { get; init; }
    public string? ReceivedByName { get; init; }
    public bool RequiresQualityCheck { get; init; }
    public Guid? QualityCheckedById { get; init; }
    public string? QualityCheckedByName { get; init; }
    public DateTime? QualityCheckDate { get; init; }
    public string? QualityNotes { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<GoodsReceiptItemDto> Items { get; init; } = new();
}

public record GoodsReceiptItemDto
{
    public Guid Id { get; init; }
    public Guid GoodsReceiptId { get; init; }
    public Guid? PurchaseOrderItemId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal OrderedQuantity { get; init; }
    public decimal ReceivedQuantity { get; init; }
    public decimal AcceptedQuantity { get; init; }
    public decimal RejectedQuantity { get; init; }
    public string Condition { get; init; } = string.Empty;
    public string? ConditionNotes { get; init; }
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public string? StorageLocation { get; init; }
    public string? Notes { get; init; }
}

public record GoodsReceiptListDto
{
    public Guid Id { get; init; }
    public string ReceiptNumber { get; init; } = string.Empty;
    public DateTime ReceiptDate { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public string? SupplierName { get; init; }
    public string? WarehouseName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public int ItemCount { get; init; }
    public bool RequiresQualityCheck { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateGoodsReceiptDto
{
    public Guid? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public GoodsReceiptType Type { get; init; } = GoodsReceiptType.Standard;
    public string? DeliveryNoteNumber { get; init; }
    public DateTime? DeliveryDate { get; init; }
    public string? CarrierName { get; init; }
    public string? DriverName { get; init; }
    public string? VehiclePlate { get; init; }
    public int TotalPackages { get; init; }
    public decimal TotalWeight { get; init; }
    public bool RequiresQualityCheck { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public List<CreateGoodsReceiptItemDto> Items { get; init; } = new();
}

public record CreateGoodsReceiptItemDto
{
    public Guid? PurchaseOrderItemId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal OrderedQuantity { get; init; }
    public decimal ReceivedQuantity { get; init; }
    public decimal UnitPrice { get; init; }
    public ItemCondition Condition { get; init; } = ItemCondition.Good;
    public string? ConditionNotes { get; init; }
    public string? LotNumber { get; init; }
    public string? BatchNumber { get; init; }
    public string? SerialNumber { get; init; }
    public List<string>? SerialNumbers { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public string? StorageLocation { get; init; }
    public string? Notes { get; init; }
}

public record UpdateGoodsReceiptDto
{
    public string? DeliveryNoteNumber { get; init; }
    public DateTime? DeliveryDate { get; init; }
    public string? CarrierName { get; init; }
    public string? DriverName { get; init; }
    public string? VehiclePlate { get; init; }
    public int? TotalPackages { get; init; }
    public decimal? TotalWeight { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record QualityCheckDto
{
    public string? QualityNotes { get; init; }
    public List<QualityCheckItemDto> Items { get; init; } = new();
}

public record QualityCheckItemDto
{
    public Guid ItemId { get; init; }
    public decimal ReceivedQuantity { get; init; }
    public decimal AcceptedQuantity { get; init; }
    public decimal RejectedQuantity { get; init; }
    public ItemCondition Condition { get; init; }
    public string? ConditionNotes { get; init; }
    public string? RejectionReason { get; init; }
}

public record GoodsReceiptSummaryDto
{
    public int TotalReceipts { get; init; }
    public int PendingReceipts { get; init; }
    public int PendingQualityCheck { get; init; }
    public int CompletedReceipts { get; init; }
    public int TotalItemsReceived { get; init; }
    public int TotalItemsRejected { get; init; }
    public Dictionary<string, int> ReceiptsByStatus { get; init; } = new();
    public Dictionary<string, int> ReceiptsBySupplier { get; init; } = new();
}
