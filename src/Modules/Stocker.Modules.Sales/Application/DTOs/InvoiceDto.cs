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
    public string? EInvoiceId { get; init; }
    public bool IsEInvoice { get; init; }
    public DateTime? EInvoiceDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<InvoiceItemDto> Items { get; init; } = new();

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
            EInvoiceId = entity.EInvoiceId,
            IsEInvoice = entity.IsEInvoice,
            EInvoiceDate = entity.EInvoiceDate,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Items = entity.Items.Select(InvoiceItemDto.FromEntity).ToList()
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
            CreatedAt = entity.CreatedAt
        };
    }
}
