using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Invoices.Commands;

public record CreateInvoiceCommand : IRequest<Result<InvoiceDto>>
{
    public DateTime InvoiceDate { get; init; } = DateTime.UtcNow;
    public DateTime? DueDate { get; init; }
    public InvoiceType Type { get; init; } = InvoiceType.Sales;
    public Guid? SalesOrderId { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerTaxNumber { get; init; }
    public string? CustomerAddress { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? Notes { get; init; }
    public List<CreateInvoiceItemCommand> Items { get; init; } = new();
}

public record CreateInvoiceItemCommand
{
    public Guid? SalesOrderItemId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; } = 20;
    public decimal DiscountRate { get; init; }
}

public record CreateInvoiceFromOrderCommand : IRequest<Result<InvoiceDto>>
{
    public Guid SalesOrderId { get; init; }
    public DateTime? DueDate { get; init; }
    public string? Notes { get; init; }
}

public record UpdateInvoiceCommand : IRequest<Result<InvoiceDto>>
{
    public Guid Id { get; init; }
    public DateTime? DueDate { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerTaxNumber { get; init; }
    public string? CustomerAddress { get; init; }
    public string? Notes { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal DiscountRate { get; init; }
}

public record AddInvoiceItemCommand : IRequest<Result<InvoiceDto>>
{
    public Guid InvoiceId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; } = 20;
    public decimal DiscountRate { get; init; }
}

public record RemoveInvoiceItemCommand : IRequest<Result<InvoiceDto>>
{
    public Guid InvoiceId { get; init; }
    public Guid ItemId { get; init; }
}

public record IssueInvoiceCommand : IRequest<Result<InvoiceDto>>
{
    public Guid Id { get; init; }
}

public record SendInvoiceCommand : IRequest<Result<InvoiceDto>>
{
    public Guid Id { get; init; }
}

public record RecordPaymentCommand : IRequest<Result<InvoiceDto>>
{
    public Guid InvoiceId { get; init; }
    public decimal Amount { get; init; }
}

public record SetEInvoiceCommand : IRequest<Result<InvoiceDto>>
{
    public Guid Id { get; init; }
    public string EInvoiceId { get; init; } = string.Empty;
}

public record CancelInvoiceCommand : IRequest<Result<InvoiceDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record DeleteInvoiceCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
