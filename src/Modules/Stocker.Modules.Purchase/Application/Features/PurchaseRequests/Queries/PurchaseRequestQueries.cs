using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Queries;

public record GetPurchaseRequestByIdQuery(Guid Id) : IRequest<Result<PurchaseRequestDto>>;

public record GetPurchaseRequestsQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    PurchaseRequestStatus? Status = null,
    PurchaseRequestPriority? Priority = null,
    Guid? RequestedById = null,
    Guid? DepartmentId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<PurchaseRequestListDto>>>;

public record GetPendingPurchaseRequestsQuery() : IRequest<Result<List<PurchaseRequestListDto>>>;

public record GetPurchaseRequestsByDepartmentQuery(Guid DepartmentId, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<PurchaseRequestListDto>>>;

public record GetMyPurchaseRequestsQuery(int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<PurchaseRequestListDto>>>;

public record GetPurchaseRequestSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<PurchaseRequestSummaryDto>>;
