using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.CustomerSegments.Queries;

public record GetCustomerSegmentByIdQuery(Guid Id) : IRequest<Result<CustomerSegmentDto>>;

public record GetCustomerSegmentByCodeQuery(string Code) : IRequest<Result<CustomerSegmentDto>>;

public record GetCustomerSegmentsPagedQuery(
    int Page = 1,
    int PageSize = 20,
    string? Priority = null,
    bool? IsActive = null) : IRequest<Result<PagedResult<CustomerSegmentListDto>>>;

public record GetActiveCustomerSegmentsQuery() : IRequest<Result<IReadOnlyList<CustomerSegmentListDto>>>;

public record GetDefaultCustomerSegmentQuery() : IRequest<Result<CustomerSegmentDto>>;

public record GetCustomerSegmentsByPriorityQuery(string Priority) : IRequest<Result<IReadOnlyList<CustomerSegmentListDto>>>;
