using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseReturns.Queries;

public record GetPurchaseReturnByIdQuery(Guid Id) : IRequest<Result<PurchaseReturnDto>>;

public record GetPurchaseReturnByNumberQuery(string ReturnNumber) : IRequest<Result<PurchaseReturnDto>>;

public record GetPurchaseReturnByRmaQuery(string RmaNumber) : IRequest<Result<PurchaseReturnDto>>;

public record GetPurchaseReturnsQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    PurchaseReturnStatus? Status = null,
    PurchaseReturnType? Type = null,
    PurchaseReturnReason? Reason = null,
    Guid? SupplierId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<PurchaseReturnListDto>>>;

public record GetPurchaseReturnsBySupplierQuery(Guid SupplierId, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<PurchaseReturnListDto>>>;

public record GetPurchaseReturnsByOrderQuery(Guid PurchaseOrderId) : IRequest<Result<List<PurchaseReturnListDto>>>;

public record GetPendingPurchaseReturnsQuery() : IRequest<Result<List<PurchaseReturnListDto>>>;

public record GetPurchaseReturnSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<PurchaseReturnSummaryDto>>;

public record GetReturnableItemsQuery(Guid PurchaseOrderId) : IRequest<Result<List<ReturnableItemDto>>>;

public record ReturnableItemDto
{
    public Guid PurchaseOrderItemId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductCode { get; init; }
    public decimal QuantityOrdered { get; init; }
    public decimal QuantityReceived { get; init; }
    public decimal QuantityReturned { get; init; }
    public decimal QuantityAvailable { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; }
    public string Unit { get; init; } = "Adet";
}
