using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Queries;

public record GetGoodsReceiptByIdQuery(Guid Id) : IRequest<Result<GoodsReceiptDto>>;

public record GetGoodsReceiptByNumberQuery(string ReceiptNumber) : IRequest<Result<GoodsReceiptDto>>;

public record GetGoodsReceiptsQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    GoodsReceiptStatus? Status = null,
    GoodsReceiptType? Type = null,
    Guid? SupplierId = null,
    Guid? WarehouseId = null,
    Guid? PurchaseOrderId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<GoodsReceiptListDto>>>;

public record GetGoodsReceiptsByPurchaseOrderQuery(Guid PurchaseOrderId) : IRequest<Result<List<GoodsReceiptListDto>>>;

public record GetGoodsReceiptsBySupplierQuery(Guid SupplierId, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<GoodsReceiptListDto>>>;

public record GetPendingQualityCheckQuery() : IRequest<Result<List<GoodsReceiptListDto>>>;

public record GetGoodsReceiptSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<GoodsReceiptSummaryDto>>;
