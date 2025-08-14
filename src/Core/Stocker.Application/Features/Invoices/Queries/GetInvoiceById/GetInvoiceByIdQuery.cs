using MediatR;
using Stocker.Application.DTOs.Invoice;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Queries.GetInvoiceById;

public class GetInvoiceByIdQuery : IRequest<Result<InvoiceDto>>
{
    public Guid InvoiceId { get; set; }
}