using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Enums;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesProducts.Queries;

/// <summary>
/// Query to get a sales product by ID
/// </summary>
public record GetSalesProductByIdQuery : IRequest<Result<SalesProductDto>>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Query to get a sales product by code
/// </summary>
public record GetSalesProductByCodeQuery : IRequest<Result<SalesProductDto>>
{
    public string ProductCode { get; init; } = string.Empty;
}

/// <summary>
/// Query to get a sales product by barcode
/// </summary>
public record GetSalesProductByBarcodeQuery : IRequest<Result<SalesProductDto>>
{
    public string Barcode { get; init; } = string.Empty;
}

/// <summary>
/// Query to get a sales product by SKU
/// </summary>
public record GetSalesProductBySKUQuery : IRequest<Result<SalesProductDto>>
{
    public string SKU { get; init; } = string.Empty;
}

/// <summary>
/// Query to get all sales products (not paginated)
/// </summary>
public record GetAllSalesProductsQuery : IRequest<Result<List<SalesProductListDto>>>
{
    public bool IncludeInactive { get; init; }
    public bool OnlyAvailableForSale { get; init; }
}

/// <summary>
/// Query to get paginated sales products with filtering
/// </summary>
public record GetSalesProductsPagedQuery : IRequest<Result<PagedResult<SalesProductListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public SalesProductType? ProductType { get; init; }
    public string? Category { get; init; }
    public string? SubCategory { get; init; }
    public string? Brand { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public bool? InStock { get; init; }
    public bool IncludeInactive { get; init; }
    public bool OnlyAvailableForSale { get; init; }
    public bool OnlyShowOnWeb { get; init; }
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; }
}

/// <summary>
/// Query to search sales products for autocomplete/dropdown
/// </summary>
public record SearchSalesProductsQuery : IRequest<Result<List<SalesProductListDto>>>
{
    public string SearchTerm { get; init; } = string.Empty;
    public int MaxResults { get; init; } = 10;
    public bool OnlyActive { get; init; } = true;
    public bool OnlyAvailableForSale { get; init; } = true;
}

/// <summary>
/// Query to get products by category
/// </summary>
public record GetProductsByCategoryQuery : IRequest<Result<List<SalesProductListDto>>>
{
    public string Category { get; init; } = string.Empty;
    public string? SubCategory { get; init; }
    public bool OnlyActive { get; init; } = true;
}

/// <summary>
/// Query to get products by brand
/// </summary>
public record GetProductsByBrandQuery : IRequest<Result<List<SalesProductListDto>>>
{
    public string Brand { get; init; } = string.Empty;
    public bool OnlyActive { get; init; } = true;
}

/// <summary>
/// Query to get low stock products
/// </summary>
public record GetLowStockProductsQuery : IRequest<Result<List<SalesProductListDto>>>
{
    public bool OnlyActive { get; init; } = true;
}

/// <summary>
/// Query to get products available for web
/// </summary>
public record GetWebProductsQuery : IRequest<Result<List<SalesProductListDto>>>
{
    public string? Category { get; init; }
    public string? Brand { get; init; }
    public bool OnlyInStock { get; init; }
}

/// <summary>
/// Query to check if a barcode exists
/// </summary>
public record CheckBarcodeExistsQuery : IRequest<Result<bool>>
{
    public string Barcode { get; init; } = string.Empty;
    public Guid? ExcludeProductId { get; init; }
}

/// <summary>
/// Query to check if a SKU exists
/// </summary>
public record CheckSKUExistsQuery : IRequest<Result<bool>>
{
    public string SKU { get; init; } = string.Empty;
    public Guid? ExcludeProductId { get; init; }
}

/// <summary>
/// Query to get product categories
/// </summary>
public record GetProductCategoriesQuery : IRequest<Result<List<string>>>
{
}

/// <summary>
/// Query to get product brands
/// </summary>
public record GetProductBrandsQuery : IRequest<Result<List<string>>>
{
}
