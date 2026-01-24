using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Opportunities.Queries;

public record GetOpportunityByIdQuery(Guid Id) : IRequest<Result<OpportunityDto>>;

public record GetOpportunityByNumberQuery(string OpportunityNumber) : IRequest<Result<OpportunityDto>>;

public record GetOpportunitiesPagedQuery(
    int Page = 1,
    int PageSize = 20,
    string? Stage = null,
    string? Priority = null,
    string? Source = null,
    Guid? CustomerId = null,
    Guid? SalesPersonId = null,
    Guid? PipelineId = null,
    bool? IsOpen = null) : IRequest<Result<PagedResult<OpportunityListDto>>>;

public record GetOpportunitiesByCustomerQuery(Guid CustomerId) : IRequest<Result<IReadOnlyList<OpportunityListDto>>>;

public record GetOpportunitiesBySalesPersonQuery(Guid SalesPersonId) : IRequest<Result<IReadOnlyList<OpportunityListDto>>>;

public record GetOpportunitiesByStageQuery(string Stage) : IRequest<Result<IReadOnlyList<OpportunityListDto>>>;

public record GetOpportunitiesByPipelineQuery(Guid PipelineId) : IRequest<Result<IReadOnlyList<OpportunityListDto>>>;

public record GetOpenOpportunitiesQuery() : IRequest<Result<IReadOnlyList<OpportunityListDto>>>;
