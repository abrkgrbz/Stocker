using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesReturns.Queries;

public record GetSalesReturnByIdQuery(Guid Id) : IRequest<Result<SalesReturnDto>>;

public record GetSalesReturnsQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    SalesReturnStatus? Status = null,
    SalesReturnReason? Reason = null,
    Guid? CustomerId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<SalesReturnListDto>>>;

public record GetSalesReturnsByOrderQuery(Guid SalesOrderId) : IRequest<Result<List<SalesReturnListDto>>>;

public record GetSalesReturnsByCustomerQuery(Guid CustomerId, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<SalesReturnListDto>>>;

public record GetPendingReturnsQuery() : IRequest<Result<List<SalesReturnListDto>>>;

public record GetReturnSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<SalesReturnSummaryDto>>;

public record GetReturnableItemsQuery(Guid SalesOrderId) : IRequest<Result<List<ReturnableItemDto>>>;

public record ReturnableItemDto
{
    public Guid SalesOrderItemId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductCode { get; init; }
    public decimal QuantityOrdered { get; init; }
    public decimal QuantityReturned { get; init; }
    public decimal QuantityAvailable { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; }
    public string Unit { get; init; } = "Adet";
}
