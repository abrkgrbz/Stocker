using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record PurchaseReturnDto
{
    public Guid Id { get; init; }
    public string ReturnNumber { get; init; } = string.Empty;
    public string? RmaNumber { get; init; }
    public DateTime ReturnDate { get; init; }
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public string? ReasonDetails { get; init; }
    public Guid? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public Guid? GoodsReceiptId { get; init; }
    public string? GoodsReceiptNumber { get; init; }
    public Guid? PurchaseInvoiceId { get; init; }
    public string? PurchaseInvoiceNumber { get; init; }
    public decimal SubTotal { get; init; }
    public decimal VatAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }
    public string? RefundMethod { get; init; }
    public decimal RefundAmount { get; init; }
    public string? RefundReference { get; init; }
    public DateTime? RefundDate { get; init; }
    public bool IsShipped { get; init; }
    public DateTime? ShippedDate { get; init; }
    public string? ShippingCarrier { get; init; }
    public string? TrackingNumber { get; init; }
    public bool IsReceived { get; init; }
    public DateTime? ReceivedDate { get; init; }
    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<PurchaseReturnItemDto> Items { get; init; } = new();
}

public record PurchaseReturnItemDto
{
    public Guid Id { get; init; }
    public Guid PurchaseReturnId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public string Reason { get; init; } = string.Empty;
    public string? ReasonDescription { get; init; }
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal SubTotal { get; init; }
    public decimal TotalAmount { get; init; }
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
}

public record PurchaseReturnListDto
{
    public Guid Id { get; init; }
    public string ReturnNumber { get; init; } = string.Empty;
    public string? RmaNumber { get; init; }
    public DateTime ReturnDate { get; init; }
    public string? SupplierName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public decimal RefundAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreatePurchaseReturnDto
{
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public PurchaseReturnType Type { get; init; } = PurchaseReturnType.Standard;
    public PurchaseReturnReason Reason { get; init; } = PurchaseReturnReason.Defective;
    public string? ReasonDetails { get; init; }
    public string? ReasonDescription { get; init; }
    public Guid? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public Guid? GoodsReceiptId { get; init; }
    public string? GoodsReceiptNumber { get; init; }
    public Guid? PurchaseInvoiceId { get; init; }
    public string? PurchaseInvoiceNumber { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; } = 1;
    public RefundMethod? RefundMethod { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public List<CreatePurchaseReturnItemDto> Items { get; init; } = new();
}

public record CreatePurchaseReturnItemDto
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public PurchaseReturnItemReason Reason { get; init; } = PurchaseReturnItemReason.Defective;
    public string? ReasonDescription { get; init; }
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; } = 20;
    public ItemCondition Condition { get; init; } = ItemCondition.Good;
    public string? LotNumber { get; init; }
    public string? BatchNumber { get; init; }
    public string? SerialNumber { get; init; }
}

public record UpdatePurchaseReturnDto
{
    public string? RmaNumber { get; init; }
    public string? ReasonDetails { get; init; }
    public RefundMethod? RefundMethod { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record ShipReturnDto
{
    public string? ShippingMethod { get; init; }
    public string ShippingCarrier { get; init; } = string.Empty;
    public string TrackingNumber { get; init; } = string.Empty;
    public decimal? ShippingCost { get; init; }
}

public record ProcessRefundDto
{
    public decimal Amount { get; init; }
    public string RefundReference { get; init; } = string.Empty;
    public decimal? OverrideAmount { get; init; }
}

public record PurchaseReturnSummaryDto
{
    public int TotalReturns { get; init; }
    public int PendingReturns { get; init; }
    public int ApprovedReturns { get; init; }
    public int ShippedReturns { get; init; }
    public int CompletedReturns { get; init; }
    public decimal TotalReturnAmount { get; init; }
    public decimal TotalRefundAmount { get; init; }
    public decimal PendingRefundAmount { get; init; }
    public Dictionary<string, int> ReturnsByReason { get; init; } = new();
    public Dictionary<string, int> ReturnsBySupplier { get; init; } = new();
}
