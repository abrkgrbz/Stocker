using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Commissions.Queries;

public record GetCommissionPlanByIdQuery(Guid Id) : IRequest<Result<CommissionPlanDto>>;

public record GetCommissionPlansQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    CommissionType? Type = null,
    bool? IsActive = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<CommissionPlanListDto>>>;

public record GetActiveCommissionPlansQuery() : IRequest<Result<List<CommissionPlanListDto>>>;

public record GetSalesCommissionByIdQuery(Guid Id) : IRequest<Result<SalesCommissionDto>>;

public record GetSalesCommissionsQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? SalesPersonId = null,
    SalesCommissionStatus? Status = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<SalesCommissionListDto>>>;

public record GetCommissionsBySalesPersonQuery(
    Guid SalesPersonId,
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<List<SalesCommissionDto>>>;

public record GetCommissionSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<List<CommissionSummaryDto>>>;

public record GetSalesPersonCommissionSummaryQuery(
    Guid SalesPersonId,
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<CommissionSummaryDto>>;

public record GetPendingCommissionsQuery() : IRequest<Result<List<SalesCommissionListDto>>>;

public record GetApprovedCommissionsQuery() : IRequest<Result<List<SalesCommissionListDto>>>;
