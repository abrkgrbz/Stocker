using MediatR;
using Stocker.Application.DTOs.Invoice;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Queries.GetTenantInvoices;

public class GetTenantInvoicesQuery : IRequest<Result<List<InvoiceDto>>>
{
    public Guid TenantId { get; set; }
    public string? Status { get; set; }
}