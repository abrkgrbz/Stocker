using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.RefundInvoice;

public record RefundInvoiceCommand : IRequest<Result<RefundInvoiceResponse>>
{
    public Guid InvoiceId { get; init; }
    public decimal RefundAmount { get; init; }
    public string Reason { get; init; } = string.Empty;
    public bool IsFullRefund { get; init; }
    public string? RefundedBy { get; set; }
}

public record RefundInvoiceResponse(
    Guid OriginalInvoiceId,
    Guid? CreditNoteId,
    string? CreditNoteNumber,
    decimal RefundAmount,
    string Currency,
    DateTime RefundDate
);
