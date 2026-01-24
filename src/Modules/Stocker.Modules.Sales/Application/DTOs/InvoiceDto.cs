using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record InvoiceDto
{
    public Guid Id { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public DateTime InvoiceDate { get; init; }
    public DateTime? DueDate { get; init; }
    public Guid? SalesOrderId { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerTaxNumber { get; init; }
    public string? CustomerAddress { get; init; }
    public decimal SubTotal { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string? Notes { get; init; }
    // E-Fatura / E-Arşiv
    public string? EInvoiceId { get; init; }
    public bool IsEInvoice { get; init; }
    public DateTime? EInvoiceDate { get; init; }
    public string? GibUuid { get; init; }
    public string? EInvoiceStatus { get; init; }
    public string? EInvoiceErrorMessage { get; init; }
    public bool IsEArchive { get; init; }
    public string? EArchiveNumber { get; init; }
    public DateTime? EArchiveDate { get; init; }
    public string? EArchiveStatus { get; init; }

    // Tevkifat (Withholding Tax)
    public bool HasWithholdingTax { get; init; }
    public decimal WithholdingTaxRate { get; init; }
    public decimal WithholdingTaxAmount { get; init; }
    public string? WithholdingTaxCode { get; init; }

    // Fatura Numaralama (VUK Uyumlu)
    public string? InvoiceSeries { get; init; }
    public int SequenceNumber { get; init; }
    public int InvoiceYear { get; init; }

    // Müşteri Vergi Bilgileri (Genişletilmiş)
    public string? CustomerTaxIdType { get; init; }
    public string? CustomerTaxOfficeCode { get; init; }

    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<InvoiceItemDto> Items { get; init; } = new();

    // Source Document Relations - traceability to originating documents
    public string? SalesOrderNumber { get; init; }
    public Guid? ShipmentId { get; init; }
    public string? ShipmentNumber { get; init; }
    public Guid? DeliveryNoteId { get; init; }
    public string? DeliveryNoteNumber { get; init; }
    public Guid? QuotationId { get; init; }

    // Additional Customer Info
    public string? CustomerPhone { get; init; }
    public string? CustomerTaxOffice { get; init; }

    // Billing Address Snapshot
    public AddressSnapshotDto? BillingAddressSnapshot { get; init; }

    public static InvoiceDto FromEntity(Invoice entity)
    {
        return new InvoiceDto
        {
            Id = entity.Id,
            InvoiceNumber = entity.InvoiceNumber,
            InvoiceDate = entity.InvoiceDate,
            DueDate = entity.DueDate,
            SalesOrderId = entity.SalesOrderId,
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            CustomerEmail = entity.CustomerEmail,
            CustomerTaxNumber = entity.CustomerTaxNumber,
            CustomerAddress = entity.CustomerAddress,
            SubTotal = entity.SubTotal,
            DiscountAmount = entity.DiscountAmount,
            DiscountRate = entity.DiscountRate,
            VatAmount = entity.VatAmount,
            TotalAmount = entity.TotalAmount,
            PaidAmount = entity.PaidAmount,
            RemainingAmount = entity.RemainingAmount,
            Currency = entity.Currency,
            ExchangeRate = entity.ExchangeRate,
            Status = entity.Status.ToString(),
            Type = entity.Type.ToString(),
            Notes = entity.Notes,
            // E-Fatura / E-Arşiv
            EInvoiceId = entity.EInvoiceId,
            IsEInvoice = entity.IsEInvoice,
            EInvoiceDate = entity.EInvoiceDate,
            GibUuid = entity.GibUuid,
            EInvoiceStatus = entity.EInvoiceStatus?.ToString(),
            EInvoiceErrorMessage = entity.EInvoiceErrorMessage,
            IsEArchive = entity.IsEArchive,
            EArchiveNumber = entity.EArchiveNumber,
            EArchiveDate = entity.EArchiveDate,
            EArchiveStatus = entity.EArchiveStatus?.ToString(),

            // Tevkifat
            HasWithholdingTax = entity.HasWithholdingTax,
            WithholdingTaxRate = entity.WithholdingTaxRate,
            WithholdingTaxAmount = entity.WithholdingTaxAmount,
            WithholdingTaxCode = entity.WithholdingTaxCode,

            // Fatura Numaralama
            InvoiceSeries = entity.InvoiceSeries,
            SequenceNumber = entity.SequenceNumber,
            InvoiceYear = entity.InvoiceYear,

            // Müşteri Vergi Bilgileri
            CustomerTaxIdType = entity.CustomerTaxIdType?.ToString(),
            CustomerTaxOfficeCode = entity.CustomerTaxOfficeCode,

            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Items = entity.Items.Select(InvoiceItemDto.FromEntity).ToList(),

            // Source Document Relations
            SalesOrderNumber = entity.SalesOrderNumber,
            ShipmentId = entity.ShipmentId,
            ShipmentNumber = entity.ShipmentNumber,
            DeliveryNoteId = entity.DeliveryNoteId,
            DeliveryNoteNumber = entity.DeliveryNoteNumber,
            QuotationId = entity.QuotationId,

            // Additional Customer Info
            CustomerPhone = entity.CustomerPhone,
            CustomerTaxOffice = entity.CustomerTaxOffice,

            // Billing Address Snapshot
            BillingAddressSnapshot = entity.BillingAddressSnapshot != null
                ? new AddressSnapshotDto
                {
                    RecipientName = entity.BillingAddressSnapshot.RecipientName,
                    RecipientPhone = entity.BillingAddressSnapshot.RecipientPhone,
                    CompanyName = entity.BillingAddressSnapshot.CompanyName,
                    AddressLine1 = entity.BillingAddressSnapshot.AddressLine1,
                    AddressLine2 = entity.BillingAddressSnapshot.AddressLine2,
                    District = entity.BillingAddressSnapshot.District,
                    Town = entity.BillingAddressSnapshot.Town,
                    City = entity.BillingAddressSnapshot.City,
                    State = entity.BillingAddressSnapshot.State,
                    Country = entity.BillingAddressSnapshot.Country,
                    PostalCode = entity.BillingAddressSnapshot.PostalCode,
                    TaxId = entity.BillingAddressSnapshot.TaxId,
                    TaxOffice = entity.BillingAddressSnapshot.TaxOffice
                }
                : null
        };
    }
}

public record InvoiceItemDto
{
    public Guid Id { get; init; }
    public Guid InvoiceId { get; init; }
    public Guid? SalesOrderItemId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal VatRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal LineTotal { get; init; }
    public int LineNumber { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static InvoiceItemDto FromEntity(InvoiceItem entity)
    {
        return new InvoiceItemDto
        {
            Id = entity.Id,
            InvoiceId = entity.InvoiceId,
            SalesOrderItemId = entity.SalesOrderItemId,
            ProductId = entity.ProductId,
            ProductCode = entity.ProductCode,
            ProductName = entity.ProductName,
            Description = entity.Description,
            Unit = entity.Unit,
            Quantity = entity.Quantity,
            UnitPrice = entity.UnitPrice,
            DiscountRate = entity.DiscountRate,
            DiscountAmount = entity.DiscountAmount,
            VatRate = entity.VatRate,
            VatAmount = entity.VatAmount,
            LineTotal = entity.LineTotal,
            LineNumber = entity.LineNumber,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}

public record InvoiceListDto
{
    public Guid Id { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public DateTime InvoiceDate { get; init; }
    public DateTime? DueDate { get; init; }
    public string? CustomerName { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public bool IsEInvoice { get; init; }
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }

    // Source Document References for list view
    public string? SalesOrderNumber { get; init; }
    public string? ShipmentNumber { get; init; }
    public string? DeliveryNoteNumber { get; init; }

    public static InvoiceListDto FromEntity(Invoice entity)
    {
        return new InvoiceListDto
        {
            Id = entity.Id,
            InvoiceNumber = entity.InvoiceNumber,
            InvoiceDate = entity.InvoiceDate,
            DueDate = entity.DueDate,
            CustomerName = entity.CustomerName,
            TotalAmount = entity.TotalAmount,
            PaidAmount = entity.PaidAmount,
            RemainingAmount = entity.RemainingAmount,
            Currency = entity.Currency,
            Status = entity.Status.ToString(),
            Type = entity.Type.ToString(),
            IsEInvoice = entity.IsEInvoice,
            ItemCount = entity.Items.Count,
            CreatedAt = entity.CreatedAt,
            SalesOrderNumber = entity.SalesOrderNumber,
            ShipmentNumber = entity.ShipmentNumber,
            DeliveryNoteNumber = entity.DeliveryNoteNumber
        };
    }
}
