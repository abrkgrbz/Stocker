using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Invoices.Queries;

public record GetInvoicesQuery : IRequest<Result<PagedResult<InvoiceListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Status { get; init; }
    public string? Type { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? SalesOrderId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public bool? IsOverdue { get; init; }
    public string? SortBy { get; init; } = "InvoiceDate";
    public bool SortDescending { get; init; } = true;
}

public record GetInvoiceByIdQuery : IRequest<Result<InvoiceDto>>
{
    public Guid Id { get; init; }
}

public record GetInvoiceByNumberQuery : IRequest<Result<InvoiceDto>>
{
    public string InvoiceNumber { get; init; } = string.Empty;
}

public record GetInvoiceStatisticsQuery : IRequest<Result<InvoiceStatisticsDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public record InvoiceStatisticsDto
{
    public int TotalInvoices { get; init; }
    public int DraftInvoices { get; init; }
    public int IssuedInvoices { get; init; }
    public int PaidInvoices { get; init; }
    public int OverdueInvoices { get; init; }
    public int CancelledInvoices { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal OutstandingAmount { get; init; }
    public decimal AverageInvoiceValue { get; init; }
    public string Currency { get; init; } = "TRY";
}
