using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Payments.Queries;

public record GetPaymentsQuery : IRequest<Result<PagedResult<PaymentListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Status { get; init; }
    public string? Method { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? InvoiceId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public string? SortBy { get; init; } = "PaymentDate";
    public bool SortDescending { get; init; } = true;
}

public record GetPaymentByIdQuery : IRequest<Result<PaymentDto>>
{
    public Guid Id { get; init; }
}

public record GetPaymentByNumberQuery : IRequest<Result<PaymentDto>>
{
    public string PaymentNumber { get; init; } = string.Empty;
}

public record GetPaymentsByInvoiceQuery : IRequest<Result<List<PaymentDto>>>
{
    public Guid InvoiceId { get; init; }
}

public record GetPaymentStatisticsQuery : IRequest<Result<PaymentStatisticsDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public record PaymentStatisticsDto
{
    public int TotalPayments { get; init; }
    public int PendingPayments { get; init; }
    public int CompletedPayments { get; init; }
    public int RejectedPayments { get; init; }
    public int RefundedPayments { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal CompletedAmount { get; init; }
    public decimal RefundedAmount { get; init; }
    public Dictionary<string, decimal> AmountByMethod { get; init; } = new();
    public string Currency { get; init; } = "TRY";
}
