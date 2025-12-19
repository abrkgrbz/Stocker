using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Discounts.Queries;

public record GetDiscountByIdQuery(Guid Id) : IRequest<Result<DiscountDto>>;

public record GetDiscountByCodeQuery(string Code) : IRequest<Result<DiscountDto>>;

public record GetDiscountsQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    DiscountType? Type = null,
    bool? IsActive = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<DiscountListDto>>>;

public record GetActiveDiscountsQuery() : IRequest<Result<List<DiscountListDto>>>;

public record GetApplicableDiscountsQuery(
    Guid? CustomerId = null,
    Guid? CustomerGroupId = null,
    List<Guid>? ProductIds = null,
    List<Guid>? CategoryIds = null
) : IRequest<Result<List<DiscountDto>>>;
