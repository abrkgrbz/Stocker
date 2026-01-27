using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Queries.GenerateInvoicePdf;

public record GenerateInvoicePdfQuery : IRequest<Result<InvoicePdfResponse>>
{
    public Guid InvoiceId { get; init; }
}

public record InvoicePdfResponse(
    byte[] PdfContent,
    string FileName,
    string ContentType
);
