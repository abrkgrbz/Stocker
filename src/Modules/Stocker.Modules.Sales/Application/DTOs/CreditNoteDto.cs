using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record CreditNoteDto
{
    public Guid Id { get; init; }
    public string CreditNoteNumber { get; init; } = string.Empty;
    public DateTime CreditNoteDate { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public string? ReasonDescription { get; init; }

    // Source Documents
    public Guid InvoiceId { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public Guid? SalesReturnId { get; init; }
    public string? SalesReturnNumber { get; init; }
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }

    // Customer
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerTaxNumber { get; init; }
    public string? CustomerAddress { get; init; }

    // Amounts
    public decimal SubTotal { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }

    // Application
    public decimal AppliedAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public bool IsFullyApplied { get; init; }

    // Status
    public string Status { get; init; } = string.Empty;
    public bool IsApproved { get; init; }
    public Guid? ApprovedBy { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public bool IsVoided { get; init; }
    public string? VoidReason { get; init; }
    public DateTime? VoidedDate { get; init; }

    // e-Document
    public bool IsEDocument { get; init; }
    public string? EDocumentId { get; init; }
    public DateTime? EDocumentDate { get; init; }

    // Metadata
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public List<CreditNoteItemDto> Items { get; init; } = new();

    public static CreditNoteDto FromEntity(CreditNote entity)
    {
        return new CreditNoteDto
        {
            Id = entity.Id,
            CreditNoteNumber = entity.CreditNoteNumber,
            CreditNoteDate = entity.CreditNoteDate,
            Type = entity.Type.ToString(),
            Reason = entity.Reason.ToString(),
            ReasonDescription = entity.ReasonDescription,
            InvoiceId = entity.InvoiceId,
            InvoiceNumber = entity.InvoiceNumber,
            SalesReturnId = entity.SalesReturnId,
            SalesReturnNumber = entity.SalesReturnNumber,
            SalesOrderId = entity.SalesOrderId,
            SalesOrderNumber = entity.SalesOrderNumber,
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            CustomerTaxNumber = entity.CustomerTaxNumber,
            CustomerAddress = entity.CustomerAddress,
            SubTotal = entity.SubTotal,
            DiscountAmount = entity.DiscountAmount,
            TaxAmount = entity.TaxAmount,
            TotalAmount = entity.TotalAmount,
            Currency = entity.Currency,
            ExchangeRate = entity.ExchangeRate,
            AppliedAmount = entity.AppliedAmount,
            RemainingAmount = entity.RemainingAmount,
            IsFullyApplied = entity.IsFullyApplied,
            Status = entity.Status.ToString(),
            IsApproved = entity.IsApproved,
            ApprovedBy = entity.ApprovedBy,
            ApprovedDate = entity.ApprovedDate,
            IsVoided = entity.IsVoided,
            VoidReason = entity.VoidReason,
            VoidedDate = entity.VoidedDate,
            IsEDocument = entity.IsEDocument,
            EDocumentId = entity.EDocumentId,
            EDocumentDate = entity.EDocumentDate,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Items = entity.Items.Select(CreditNoteItemDto.FromEntity).ToList()
        };
    }
}

public record CreditNoteItemDto
{
    public Guid Id { get; init; }
    public Guid CreditNoteId { get; init; }
    public int LineNumber { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? InvoiceItemId { get; init; }
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal TaxRate { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal LineTotal { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static CreditNoteItemDto FromEntity(CreditNoteItem entity)
    {
        return new CreditNoteItemDto
        {
            Id = entity.Id,
            CreditNoteId = entity.CreditNoteId,
            LineNumber = entity.LineNumber,
            ProductId = entity.ProductId,
            ProductCode = entity.ProductCode,
            ProductName = entity.ProductName,
            Description = entity.Description,
            InvoiceItemId = entity.InvoiceItemId,
            Quantity = entity.Quantity,
            Unit = entity.Unit,
            UnitPrice = entity.UnitPrice,
            DiscountRate = entity.DiscountRate,
            DiscountAmount = entity.DiscountAmount,
            TaxRate = entity.TaxRate,
            TaxAmount = entity.TaxAmount,
            LineTotal = entity.LineTotal,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}

public record CreditNoteListDto
{
    public Guid Id { get; init; }
    public string CreditNoteNumber { get; init; } = string.Empty;
    public DateTime CreditNoteDate { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public string InvoiceNumber { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public decimal AppliedAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string Status { get; init; } = string.Empty;
    public bool IsApproved { get; init; }
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }

    public static CreditNoteListDto FromEntity(CreditNote entity)
    {
        return new CreditNoteListDto
        {
            Id = entity.Id,
            CreditNoteNumber = entity.CreditNoteNumber,
            CreditNoteDate = entity.CreditNoteDate,
            Type = entity.Type.ToString(),
            Reason = entity.Reason.ToString(),
            InvoiceNumber = entity.InvoiceNumber,
            CustomerName = entity.CustomerName,
            TotalAmount = entity.TotalAmount,
            AppliedAmount = entity.AppliedAmount,
            RemainingAmount = entity.RemainingAmount,
            Currency = entity.Currency,
            Status = entity.Status.ToString(),
            IsApproved = entity.IsApproved,
            ItemCount = entity.Items.Count,
            CreatedAt = entity.CreatedAt
        };
    }
}
