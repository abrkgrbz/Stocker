using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesTerritories.Queries;

public record GetSalesTerritoriesQuery : IRequest<Result<PagedResult<SalesTerritoryListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public TerritoryStatus? Status { get; init; }
    public TerritoryType? TerritoryType { get; init; }
    public string? Region { get; init; }
    public string? City { get; init; }
    public Guid? ParentTerritoryId { get; init; }
    public string? SortBy { get; init; } = "Name";
    public bool SortDescending { get; init; }
}

public record GetSalesTerritoryByIdQuery : IRequest<Result<SalesTerritoryDto>>
{
    public Guid Id { get; init; }
}

public record GetSalesTerritoryByCodeQuery : IRequest<Result<SalesTerritoryDto>>
{
    public string TerritoryCode { get; init; } = string.Empty;
}

public record GetActiveTerritoriesQuery : IRequest<Result<IReadOnlyList<SalesTerritoryListDto>>>
{
}

public record GetTerritoriesByTypeQuery : IRequest<Result<IReadOnlyList<SalesTerritoryListDto>>>
{
    public TerritoryType TerritoryType { get; init; }
}

public record GetChildTerritoriesQuery : IRequest<Result<IReadOnlyList<SalesTerritoryListDto>>>
{
    public Guid ParentTerritoryId { get; init; }
}

public record GetTerritoriesBySalesRepQuery : IRequest<Result<IReadOnlyList<SalesTerritoryListDto>>>
{
    public Guid SalesRepId { get; init; }
}

public record GetTerritoryForCustomerQuery : IRequest<Result<SalesTerritoryDto>>
{
    public Guid CustomerId { get; init; }
    public string? PostalCode { get; init; }
    public string? City { get; init; }
    public string? Region { get; init; }
}

public record ValidateSalesAccessQuery : IRequest<Result<bool>>
{
    public Guid TerritoryId { get; init; }
    public Guid SalesPersonId { get; init; }
}
