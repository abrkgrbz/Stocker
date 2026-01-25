using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public class QuotationDto
{
    public Guid Id { get; set; }
    public string QuotationNumber { get; set; } = string.Empty;
    public string? Name { get; set; }
    public DateTime QuotationDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerTaxNumber { get; set; }
    public Guid? ContactId { get; set; }
    public string? ContactName { get; set; }
    public Guid? OpportunityId { get; set; }
    public Guid? SalesPersonId { get; set; }
    public string? SalesPersonName { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal DiscountRate { get; set; }
    public decimal VatAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal ExchangeRate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ShippingAddress { get; set; }
    public string? BillingAddress { get; set; }
    public string? PaymentTerms { get; set; }
    public string? DeliveryTerms { get; set; }
    public int ValidityDays { get; set; }
    public string? Notes { get; set; }
    public string? TermsAndConditions { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public DateTime? SentDate { get; set; }
    public DateTime? AcceptedDate { get; set; }
    public DateTime? RejectedDate { get; set; }
    public string? RejectionReason { get; set; }
    public Guid? ConvertedToOrderId { get; set; }
    public DateTime? ConvertedDate { get; set; }
    public int RevisionNumber { get; set; }
    public Guid? ParentQuotationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<QuotationItemDto> Items { get; set; } = new();
}

public class QuotationItemDto
{
    public Guid Id { get; set; }
    public Guid QuotationId { get; set; }
    public int? ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductCode { get; set; }
    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "Adet";
    public decimal UnitPrice { get; set; }
    public decimal DiscountRate { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal VatRate { get; set; }
    public decimal VatAmount { get; set; }
    public decimal LineTotal { get; set; }
    public int SortOrder { get; set; }
}

public class QuotationListDto
{
    public Guid Id { get; set; }
    public string QuotationNumber { get; set; } = string.Empty;
    public string? Name { get; set; }
    public DateTime QuotationDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? CustomerName { get; set; }
    public string? SalesPersonName { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string Status { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public int RevisionNumber { get; set; }
    public DateTime CreatedAt { get; set; }
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
    public int? ProductId { get; init; }
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

/// <summary>
/// Manual mapping extensions for Quotation entities - bypasses AutoMapper issues
/// </summary>
public static class QuotationMappingExtensions
{
    public static QuotationDto ToDto(this Quotation quotation)
    {
        return new QuotationDto
        {
            Id = quotation.Id,
            QuotationNumber = quotation.QuotationNumber,
            Name = quotation.Name,
            QuotationDate = quotation.QuotationDate,
            ExpirationDate = quotation.ExpirationDate,
            CustomerId = quotation.CustomerId,
            CustomerName = quotation.CustomerName,
            CustomerEmail = quotation.CustomerEmail,
            CustomerPhone = quotation.CustomerPhone,
            CustomerTaxNumber = quotation.CustomerTaxNumber,
            ContactId = quotation.ContactId,
            ContactName = quotation.ContactName,
            OpportunityId = quotation.OpportunityId,
            SalesPersonId = quotation.SalesPersonId,
            SalesPersonName = quotation.SalesPersonName,
            SubTotal = quotation.SubTotal,
            DiscountAmount = quotation.DiscountAmount,
            DiscountRate = quotation.DiscountRate,
            VatAmount = quotation.VatAmount,
            ShippingAmount = quotation.ShippingAmount,
            TotalAmount = quotation.TotalAmount,
            Currency = quotation.Currency,
            ExchangeRate = quotation.ExchangeRate,
            Status = quotation.Status.ToString(),
            ShippingAddress = quotation.ShippingAddress,
            BillingAddress = quotation.BillingAddress,
            PaymentTerms = quotation.PaymentTerms,
            DeliveryTerms = quotation.DeliveryTerms,
            ValidityDays = quotation.ValidityDays,
            Notes = quotation.Notes,
            TermsAndConditions = quotation.TermsAndConditions,
            ApprovedBy = quotation.ApprovedBy,
            ApprovedDate = quotation.ApprovedDate,
            SentDate = quotation.SentDate,
            AcceptedDate = quotation.AcceptedDate,
            RejectedDate = quotation.RejectedDate,
            RejectionReason = quotation.RejectionReason,
            ConvertedToOrderId = quotation.ConvertedToOrderId,
            ConvertedDate = quotation.ConvertedDate,
            RevisionNumber = quotation.RevisionNumber,
            ParentQuotationId = quotation.ParentQuotationId,
            CreatedAt = quotation.CreatedAt,
            UpdatedAt = quotation.UpdatedAt,
            Items = quotation.Items.Select(i => i.ToDto()).ToList()
        };
    }

    public static QuotationItemDto ToDto(this QuotationItem item)
    {
        return new QuotationItemDto
        {
            Id = item.Id,
            QuotationId = item.QuotationId,
            ProductId = item.ProductId,
            ProductName = item.ProductName,
            ProductCode = item.ProductCode,
            Description = item.Description,
            Quantity = item.Quantity,
            Unit = item.Unit,
            UnitPrice = item.UnitPrice,
            DiscountRate = item.DiscountRate,
            DiscountAmount = item.DiscountAmount,
            VatRate = item.VatRate,
            VatAmount = item.VatAmount,
            LineTotal = item.LineTotal,
            SortOrder = item.SortOrder
        };
    }

    public static QuotationListDto ToListDto(this Quotation quotation)
    {
        return new QuotationListDto
        {
            Id = quotation.Id,
            QuotationNumber = quotation.QuotationNumber,
            Name = quotation.Name,
            QuotationDate = quotation.QuotationDate,
            ExpirationDate = quotation.ExpirationDate,
            CustomerName = quotation.CustomerName,
            SalesPersonName = quotation.SalesPersonName,
            TotalAmount = quotation.TotalAmount,
            Currency = quotation.Currency,
            Status = quotation.Status.ToString(),
            ItemCount = quotation.Items.Count,
            RevisionNumber = quotation.RevisionNumber,
            CreatedAt = quotation.CreatedAt
        };
    }
}
