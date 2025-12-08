using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record PurchaseInvoiceDto
{
    public Guid Id { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public string? SupplierInvoiceNumber { get; init; }
    public DateTime InvoiceDate { get; init; }
    public DateTime? DueDate { get; init; }
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public string? SupplierTaxNumber { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public Guid? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public Guid? GoodsReceiptId { get; init; }
    public string? GoodsReceiptNumber { get; init; }
    public decimal SubTotal { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal WithholdingTaxAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }
    public string? EInvoiceId { get; init; }
    public string? EInvoiceUUID { get; init; }
    public string? EInvoiceStatus { get; init; }
    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<PurchaseInvoiceItemDto> Items { get; init; } = new();
}

public record PurchaseInvoiceItemDto
{
    public Guid Id { get; init; }
    public Guid PurchaseInvoiceId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal VatRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal SubTotal { get; init; }
    public decimal TotalAmount { get; init; }
    public string? Description { get; init; }
}

public record PurchaseInvoiceListDto
{
    public Guid Id { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public string? SupplierInvoiceNumber { get; init; }
    public DateTime InvoiceDate { get; init; }
    public DateTime? DueDate { get; init; }
    public string? SupplierName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? EInvoiceStatus { get; init; }
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreatePurchaseInvoiceDto
{
    public string? SupplierInvoiceNumber { get; init; }
    public DateTime InvoiceDate { get; init; }
    public DateTime? DueDate { get; init; }
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public string? SupplierTaxNumber { get; init; }
    public PurchaseInvoiceType Type { get; init; } = PurchaseInvoiceType.Standard;
    public Guid? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public Guid? GoodsReceiptId { get; init; }
    public string? GoodsReceiptNumber { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal WithholdingTaxAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; } = 1;
    public int PaymentTermDays { get; init; } = 30;
    public string? EInvoiceId { get; init; }
    public string? EInvoiceUUID { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public List<CreatePurchaseInvoiceItemDto> Items { get; init; } = new();
}

public record CreatePurchaseInvoiceItemDto
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal VatRate { get; init; } = 20;
    public string? Description { get; init; }
}

public record UpdatePurchaseInvoiceDto
{
    public string? SupplierInvoiceNumber { get; init; }
    public DateTime? DueDate { get; init; }
    public decimal? DiscountRate { get; init; }
    public decimal? WithholdingTaxAmount { get; init; }
    public string? EInvoiceId { get; init; }
    public string? EInvoiceUUID { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record RecordPaymentDto
{
    public decimal Amount { get; init; }
    public string? PaymentReference { get; init; }
}

public record PurchaseInvoiceSummaryDto
{
    public int TotalInvoices { get; init; }
    public int DraftInvoices { get; init; }
    public int PendingInvoices { get; init; }
    public int ApprovedInvoices { get; init; }
    public int PaidInvoices { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal TotalPaidAmount { get; init; }
    public decimal TotalRemainingAmount { get; init; }
    public decimal OverdueAmount { get; init; }
    public int OverdueInvoices { get; init; }
    public Dictionary<string, int> InvoicesByStatus { get; init; } = new();
    public Dictionary<string, decimal> AmountBySupplier { get; init; } = new();
}
