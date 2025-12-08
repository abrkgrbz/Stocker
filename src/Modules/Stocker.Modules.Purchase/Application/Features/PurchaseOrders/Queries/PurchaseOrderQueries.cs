using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseOrders.Queries;

public record GetPurchaseOrderByIdQuery(Guid Id) : IRequest<Result<PurchaseOrderDto>>;

public record GetPurchaseOrderByNumberQuery(string OrderNumber) : IRequest<Result<PurchaseOrderDto>>;

public record GetPurchaseOrdersQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    PurchaseOrderStatus? Status = null,
    PurchaseOrderType? Type = null,
    Guid? SupplierId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<PurchaseOrderListDto>>>;

public record GetPurchaseOrdersBySupplierQuery(Guid SupplierId, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<PurchaseOrderListDto>>>;

public record GetPendingPurchaseOrdersQuery() : IRequest<Result<List<PurchaseOrderListDto>>>;

public record GetOverduePurchaseOrdersQuery() : IRequest<Result<List<PurchaseOrderListDto>>>;

public record GetPurchaseOrderSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<PurchaseOrderSummaryDto>>;

public record GetPurchaseOrderItemsQuery(Guid OrderId) : IRequest<Result<List<PurchaseOrderItemDto>>>;
