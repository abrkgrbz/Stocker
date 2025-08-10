using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Invoice;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Features.Invoices.Queries.GetInvoicesList;

public class GetInvoicesListQuery : IRequest<Result<InvoicesListResponse>>
{
    public Guid? TenantId { get; set; }
    public InvoiceStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class InvoicesListResponse
{
    public List<InvoiceDto> Data { get; set; } = new();
    public int TotalCount { get; set; }
    public InvoiceSummary Summary { get; set; } = new();
}

public class InvoiceSummary
{
    public int TotalInvoices { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalPending { get; set; }
    public decimal TotalOverdue { get; set; }
}