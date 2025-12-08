using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record QuotationDto
{
    public Guid Id { get; init; }
    public string QuotationNumber { get; init; } = string.Empty;
    public DateTime QuotationDate { get; init; }
    public DateTime? ValidUntil { get; init; }
    public string? Title { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public Guid? PurchaseRequestId { get; init; }
    public string? PurchaseRequestNumber { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public string? Terms { get; init; }
    public Guid? SelectedSupplierId { get; init; }
    public string? SelectedSupplierName { get; init; }
    public string? SelectionReason { get; init; }
    public DateTime? SelectionDate { get; init; }
    public Guid? ConvertedPurchaseOrderId { get; init; }
    public string? ConvertedOrderNumber { get; init; }
    public Guid? CreatedById { get; init; }
    public string? CreatedByName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<QuotationItemDto> Items { get; init; } = new();
    public List<QuotationSupplierDto> Suppliers { get; init; } = new();
}

public record QuotationItemDto
{
    public Guid Id { get; init; }
    public Guid QuotationId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public string? Specifications { get; init; }
    public string? Notes { get; init; }
    public int LineNumber { get; init; }
}

public record QuotationSupplierDto
{
    public Guid Id { get; init; }
    public Guid QuotationId { get; init; }
    public Guid SupplierId { get; init; }
    public string? SupplierCode { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public string? ContactPerson { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public DateTime? SentDate { get; init; }
    public DateTime? ResponseDate { get; init; }
    public DateTime? ResponseDeadline { get; init; }
    public string ResponseStatus { get; init; } = string.Empty;
    public decimal? TotalAmount { get; init; }
    public string? Currency { get; init; }
    public int? DeliveryDays { get; init; }
    public string? PaymentTerms { get; init; }
    public DateTime? ValidityDate { get; init; }
    public string? SupplierNotes { get; init; }
    public string? InternalEvaluation { get; init; }
    public decimal? EvaluationScore { get; init; }
    public bool IsSelected { get; init; }
    public List<QuotationSupplierItemDto> Items { get; init; } = new();
}

public record QuotationSupplierItemDto
{
    public Guid Id { get; init; }
    public Guid QuotationSupplierId { get; init; }
    public Guid QuotationItemId { get; init; }
    public Guid? ProductId { get; init; }
    public string? ProductCode { get; init; }
    public string? ProductName { get; init; }
    public string? Unit { get; init; }
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal? DiscountRate { get; init; }
    public decimal? DiscountAmount { get; init; }
    public decimal VatRate { get; init; }
    public decimal? VatAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public string? Currency { get; init; }
    public int? LeadTimeDays { get; init; }
    public bool IsAvailable { get; init; }
    public string? Notes { get; init; }
}

public record QuotationListDto
{
    public Guid Id { get; init; }
    public string QuotationNumber { get; init; } = string.Empty;
    public DateTime QuotationDate { get; init; }
    public DateTime? ValidUntil { get; init; }
    public string? Title { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public int SupplierCount { get; init; }
    public int ResponseCount { get; init; }
    public int ItemCount { get; init; }
    public string? SelectedSupplierName { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateQuotationDto
{
    public string? Title { get; init; }
    public DateTime? ValidUntil { get; init; }
    public QuotationType Type { get; init; } = QuotationType.Standard;
    public QuotationPriority Priority { get; init; } = QuotationPriority.Normal;
    public Guid? PurchaseRequestId { get; init; }
    public string? PurchaseRequestNumber { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public string? Terms { get; init; }
    public List<CreateQuotationItemDto> Items { get; init; } = new();
    public List<CreateQuotationSupplierDto> Suppliers { get; init; } = new();
}

public record CreateQuotationItemDto
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public string? Specifications { get; init; }
    public string? Notes { get; init; }
}

public record CreateQuotationSupplierDto
{
    public Guid SupplierId { get; init; }
    public string? SupplierCode { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public string? ContactPerson { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public DateTime? ResponseDeadline { get; init; }
}

public record UpdateQuotationDto
{
    public string? Title { get; init; }
    public DateTime? ValidUntil { get; init; }
    public QuotationPriority? Priority { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public string? Terms { get; init; }
}

public record SubmitSupplierResponseDto
{
    public decimal TotalAmount { get; init; }
    public string? Currency { get; init; }
    public int? DeliveryDays { get; init; }
    public string? PaymentTerms { get; init; }
    public DateTime? ValidityDate { get; init; }
    public string? SupplierNotes { get; init; }
    public List<SupplierResponseItemDto> Items { get; init; } = new();
}

public record SupplierResponseItemDto
{
    public Guid QuotationItemId { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal VatRate { get; init; }
    public int? LeadTimeDays { get; init; }
    public bool IsAvailable { get; init; } = true;
    public string? Notes { get; init; }
}

public record SelectSupplierDto
{
    public Guid SupplierId { get; init; }
    public string? SelectionReason { get; init; }
}

public record QuotationSummaryDto
{
    public int TotalQuotations { get; init; }
    public int DraftQuotations { get; init; }
    public int SentQuotations { get; init; }
    public int QuotesReceived { get; init; }
    public int SupplierSelected { get; init; }
    public int Converted { get; init; }
    public int Expired { get; init; }
    public Dictionary<string, int> QuotationsByStatus { get; init; } = new();
    public Dictionary<string, int> QuotationsByType { get; init; } = new();
}
