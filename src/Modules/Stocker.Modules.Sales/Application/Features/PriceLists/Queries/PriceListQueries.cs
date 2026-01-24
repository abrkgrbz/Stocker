using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.PriceLists.Queries;

public record GetPriceListByIdQuery(Guid Id) : IRequest<Result<PriceListDto>>;

public record GetPriceListByCodeQuery(string Code) : IRequest<Result<PriceListDto>>;

public record GetPriceListsQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    PriceListType? Type = null,
    bool? IsActive = null,
    string? SortBy = null,
    bool SortDescending = false
) : IRequest<Result<PagedResult<PriceListListDto>>>;

public record GetActivePriceListsQuery() : IRequest<Result<List<PriceListListDto>>>;

public record GetPriceListsByCustomerQuery(Guid CustomerId) : IRequest<Result<List<PriceListListDto>>>;

public record GetProductPriceQuery(Guid PriceListId, Guid ProductId, decimal Quantity = 1) : IRequest<Result<ProductPriceResultDto>>;
