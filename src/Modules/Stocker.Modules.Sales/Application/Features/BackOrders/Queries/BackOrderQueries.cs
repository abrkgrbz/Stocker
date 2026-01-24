using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.BackOrders.Queries;

public record GetBackOrderByIdQuery(Guid Id) : IRequest<Result<BackOrderDto>>;

public record GetBackOrderByNumberQuery(string BackOrderNumber) : IRequest<Result<BackOrderDto>>;

public record GetBackOrdersPagedQuery(
    int Page = 1,
    int PageSize = 20,
    string? Status = null,
    string? Priority = null,
    string? Type = null,
    Guid? CustomerId = null,
    Guid? SalesOrderId = null) : IRequest<Result<PagedResult<BackOrderListDto>>>;

public record GetBackOrdersBySalesOrderQuery(Guid SalesOrderId) : IRequest<Result<IReadOnlyList<BackOrderListDto>>>;

public record GetBackOrdersByCustomerQuery(Guid CustomerId) : IRequest<Result<IReadOnlyList<BackOrderListDto>>>;

public record GetBackOrdersByStatusQuery(string Status) : IRequest<Result<IReadOnlyList<BackOrderListDto>>>;

public record GetPendingBackOrdersQuery() : IRequest<Result<IReadOnlyList<BackOrderListDto>>>;
