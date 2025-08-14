using MediatR;
using Stocker.Application.DTOs.TenantInvoice;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantInvoices.Queries.GetInvoices;

public class GetInvoicesQuery : IRequest<Result<List<TenantInvoiceDto>>>
{
    public string? Status { get; set; }
    public Guid? CustomerId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}