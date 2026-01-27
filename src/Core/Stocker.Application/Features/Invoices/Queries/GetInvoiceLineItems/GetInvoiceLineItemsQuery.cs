using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Queries.GetInvoiceLineItems;

public record GetInvoiceLineItemsQuery : IRequest<Result<List<InvoiceLineItemDto>>>
{
    public Guid InvoiceId { get; init; }
}

public record InvoiceLineItemDto(
    Guid Id,
    string Description,
    int Quantity,
    decimal UnitPrice,
    decimal TaxRate,
    decimal TaxAmount,
    decimal DiscountAmount,
    decimal LineTotal,
    string? ProductCode,
    string? ProductName,
    string Currency
);
