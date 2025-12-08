using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record QuotationDto
{
    public Guid Id { get; init; }
    public string QuotationNumber { get; init; } = string.Empty;
    public string? Name { get; init; }
    public DateTime QuotationDate { get; init; }
    public DateTime? ExpirationDate { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? CustomerTaxNumber { get; init; }
    public Guid? ContactId { get; init; }
    public string? ContactName { get; init; }
    public Guid? OpportunityId { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
    public decimal SubTotal { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal ShippingAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? ShippingAddress { get; init; }
    public string? BillingAddress { get; init; }
    public string? PaymentTerms { get; init; }
    public string? DeliveryTerms { get; init; }
    public int ValidityDays { get; init; }
    public string? Notes { get; init; }
    public string? TermsAndConditions { get; init; }
    public Guid? ApprovedBy { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public DateTime? SentDate { get; init; }
    public DateTime? AcceptedDate { get; init; }
    public DateTime? RejectedDate { get; init; }
    public string? RejectionReason { get; init; }
    public Guid? ConvertedToOrderId { get; init; }
    public DateTime? ConvertedDate { get; init; }
    public int RevisionNumber { get; init; }
    public Guid? ParentQuotationId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<QuotationItemDto> Items { get; init; } = new();
}

public record QuotationItemDto
{
    public Guid Id { get; init; }
    public Guid QuotationId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductCode { get; init; }
    public string? Description { get; init; }
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal VatRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal LineTotal { get; init; }
    public int SortOrder { get; init; }
}

public record QuotationListDto
{
    public Guid Id { get; init; }
    public string QuotationNumber { get; init; } = string.Empty;
    public string? Name { get; init; }
    public DateTime QuotationDate { get; init; }
    public DateTime? ExpirationDate { get; init; }
    public string? CustomerName { get; init; }
    public string? SalesPersonName { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string Status { get; init; } = string.Empty;
    public int ItemCount { get; init; }
    public int RevisionNumber { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateQuotationDto
{
    public string? Name { get; init; }
    public DateTime? QuotationDate { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? CustomerTaxNumber { get; init; }
    public Guid? ContactId { get; init; }
    public string? ContactName { get; init; }
    public Guid? OpportunityId { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
    public string Currency { get; init; } = "TRY";
    public int ValidityDays { get; init; } = 30;
    public string? ShippingAddress { get; init; }
    public string? BillingAddress { get; init; }
    public string? PaymentTerms { get; init; }
    public string? DeliveryTerms { get; init; }
    public string? Notes { get; init; }
    public string? TermsAndConditions { get; init; }
    public List<CreateQuotationItemDto> Items { get; init; } = new();
}

public record CreateQuotationItemDto
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductCode { get; init; }
    public string? Description { get; init; }
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal VatRate { get; init; } = 20;
}

public record UpdateQuotationDto
{
    public string? Name { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? CustomerTaxNumber { get; init; }
    public Guid? ContactId { get; init; }
    public string? ContactName { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
    public int? ValidityDays { get; init; }
    public decimal? ShippingAmount { get; init; }
    public decimal? DiscountAmount { get; init; }
    public decimal? DiscountRate { get; init; }
    public string? ShippingAddress { get; init; }
    public string? BillingAddress { get; init; }
    public string? PaymentTerms { get; init; }
    public string? DeliveryTerms { get; init; }
    public string? Notes { get; init; }
    public string? TermsAndConditions { get; init; }
}
