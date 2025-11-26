using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;

public record GetSalesOrdersQuery : IRequest<Result<PagedResult<SalesOrderListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Status { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? SalesPersonId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public string? SortBy { get; init; } = "OrderDate";
    public bool SortDescending { get; init; } = true;
}

public record GetSalesOrderByIdQuery : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record GetSalesOrderByNumberQuery : IRequest<Result<SalesOrderDto>>
{
    public string OrderNumber { get; init; } = string.Empty;
}

public record GetSalesOrderStatisticsQuery : IRequest<Result<SalesOrderStatisticsDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public record SalesOrderStatisticsDto
{
    public int TotalOrders { get; init; }
    public int DraftOrders { get; init; }
    public int ApprovedOrders { get; init; }
    public int CompletedOrders { get; init; }
    public int CancelledOrders { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal AverageOrderValue { get; init; }
    public string Currency { get; init; } = "TRY";
}

public record PagedResult<T>
{
    public List<T> Items { get; init; } = new();
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}
