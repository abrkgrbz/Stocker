using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.AdvancePayments.Queries;

public record GetAdvancePaymentsQuery : IRequest<Result<PagedResult<AdvancePaymentListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Status { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? SalesOrderId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public bool? IsCaptured { get; init; }
    public string? SortBy { get; init; } = "PaymentDate";
    public bool SortDescending { get; init; } = true;
}

public record GetAdvancePaymentByIdQuery : IRequest<Result<AdvancePaymentDto>>
{
    public Guid Id { get; init; }
}

public record GetAdvancePaymentByNumberQuery : IRequest<Result<AdvancePaymentDto>>
{
    public string PaymentNumber { get; init; } = string.Empty;
}

public record GetAdvancePaymentStatisticsQuery : IRequest<Result<AdvancePaymentStatisticsDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public record AdvancePaymentStatisticsDto
{
    public int TotalPayments { get; init; }
    public int PendingPayments { get; init; }
    public int CapturedPayments { get; init; }
    public int AppliedPayments { get; init; }
    public int RefundedPayments { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal AppliedAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public decimal RefundedAmount { get; init; }
    public string Currency { get; init; } = "TRY";
}
