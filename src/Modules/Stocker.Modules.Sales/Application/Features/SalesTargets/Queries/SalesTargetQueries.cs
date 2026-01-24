using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesTargets.Queries;

public record GetSalesTargetByIdQuery(Guid Id) : IRequest<Result<SalesTargetDto>>;

public record GetSalesTargetByCodeQuery(string Code) : IRequest<Result<SalesTargetDto>>;

public record GetSalesTargetsPagedQuery(
    int Page = 1,
    int PageSize = 20,
    int? Year = null,
    string? Status = null,
    string? TargetType = null,
    Guid? SalesRepresentativeId = null,
    Guid? SalesTeamId = null) : IRequest<Result<PagedResult<SalesTargetListDto>>>;

public record GetSalesTargetsByYearQuery(int Year) : IRequest<Result<IReadOnlyList<SalesTargetListDto>>>;

public record GetSalesTargetsByRepresentativeQuery(Guid SalesRepId) : IRequest<Result<IReadOnlyList<SalesTargetListDto>>>;

public record GetSalesTargetsByTeamQuery(Guid TeamId) : IRequest<Result<IReadOnlyList<SalesTargetListDto>>>;

public record GetActiveSalesTargetsQuery() : IRequest<Result<IReadOnlyList<SalesTargetListDto>>>;
