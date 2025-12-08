using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record PurchaseOrderDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public DateTime OrderDate { get; init; }
    public DateTime? ExpectedDeliveryDate { get; init; }
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public string? SupplierCode { get; init; }
    public Guid? WarehouseId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string? SupplierOrderNumber { get; init; }
    public Guid? PurchaseRequestId { get; init; }
    public string? PurchaseRequestNumber { get; init; }
    public decimal SubTotal { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }
    public string PaymentTerms { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public DateTime? PaymentDueDate { get; init; }
    public string? ShippingAddress { get; init; }
    public string? ShippingMethod { get; init; }
    public decimal ShippingCost { get; init; }
    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public DateTime? SentDate { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<PurchaseOrderItemDto> Items { get; init; } = new();
}

public record PurchaseOrderItemDto
{
    public Guid Id { get; init; }
    public Guid PurchaseOrderId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal ReceivedQuantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal VatRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal SubTotal { get; init; }
    public decimal TotalAmount { get; init; }
    public int LineNumber { get; init; }
    public DateTime? ExpectedDeliveryDate { get; init; }
    public string? Notes { get; init; }
}

public record PurchaseOrderListDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public DateTime OrderDate { get; init; }
    public DateTime? ExpectedDeliveryDate { get; init; }
    public string? SupplierName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreatePurchaseOrderDto
{
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public string? SupplierCode { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public PurchaseOrderType Type { get; init; } = PurchaseOrderType.Standard;
    public DateTime? ExpectedDeliveryDate { get; init; }
    public string? SupplierOrderNumber { get; init; }
    public Guid? PurchaseRequestId { get; init; }
    public string? PurchaseRequestNumber { get; init; }
    public decimal DiscountRate { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; } = 1;
    public string PaymentTerms { get; init; } = "Net30";
    public int PaymentTermDays { get; init; } = 30;
    public PaymentMethod PaymentMethod { get; init; } = PaymentMethod.BankTransfer;
    public DateTime? PaymentDueDate { get; init; }
    public string? ShippingAddress { get; init; }
    public string? ShippingMethod { get; init; }
    public decimal ShippingCost { get; init; }
    public string? DeliveryAddress { get; init; }
    public string? DeliveryCity { get; init; }
    public string? DeliveryDistrict { get; init; }
    public string? DeliveryPostalCode { get; init; }
    public string? DeliveryContactPerson { get; init; }
    public string? DeliveryContactPhone { get; init; }
    public string? SupplierNotes { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public List<CreatePurchaseOrderItemDto> Items { get; init; } = new();
}

public record CreatePurchaseOrderItemDto
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal VatRate { get; init; } = 20;
    public DateTime? ExpectedDeliveryDate { get; init; }
    public string? Notes { get; init; }
}

public record UpdatePurchaseOrderDto
{
    public DateTime? ExpectedDeliveryDate { get; init; }
    public string? SupplierOrderNumber { get; init; }
    public decimal? DiscountRate { get; init; }
    public string? PaymentTerms { get; init; }
    public int? PaymentTermDays { get; init; }
    public PaymentMethod? PaymentMethod { get; init; }
    public DateTime? PaymentDueDate { get; init; }
    public string? ShippingAddress { get; init; }
    public string? ShippingMethod { get; init; }
    public decimal? ShippingCost { get; init; }
    public string? DeliveryAddress { get; init; }
    public string? DeliveryCity { get; init; }
    public string? DeliveryDistrict { get; init; }
    public string? DeliveryPostalCode { get; init; }
    public string? DeliveryContactPerson { get; init; }
    public string? DeliveryContactPhone { get; init; }
    public string? SupplierNotes { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record PurchaseOrderSummaryDto
{
    public int TotalOrders { get; init; }
    public int DraftOrders { get; init; }
    public int PendingOrders { get; init; }
    public int ConfirmedOrders { get; init; }
    public int ReceivedOrders { get; init; }
    public int CompletedOrders { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PendingAmount { get; init; }
    public Dictionary<string, int> OrdersByStatus { get; init; } = new();
    public Dictionary<string, decimal> AmountBySupplier { get; init; } = new();
}
