using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesProducts.Queries;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesProducts.Handlers;

public class GetSalesProductByIdQueryHandler : IRequestHandler<GetSalesProductByIdQuery, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;

    public GetSalesProductByIdQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SalesProductDto>> Handle(GetSalesProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                new Error("Product.NotFound", $"Product with ID '{request.Id}' not found", ErrorType.NotFound));
        }

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class GetSalesProductByCodeQueryHandler : IRequestHandler<GetSalesProductByCodeQuery, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;

    public GetSalesProductByCodeQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SalesProductDto>> Handle(GetSalesProductByCodeQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.ProductCode == request.ProductCode, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                new Error("Product.NotFound", $"Product with code '{request.ProductCode}' not found", ErrorType.NotFound));
        }

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class GetSalesProductByBarcodeQueryHandler : IRequestHandler<GetSalesProductByBarcodeQuery, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;

    public GetSalesProductByBarcodeQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SalesProductDto>> Handle(GetSalesProductByBarcodeQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Barcode == request.Barcode, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                new Error("Product.NotFound", $"Product with barcode '{request.Barcode}' not found", ErrorType.NotFound));
        }

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class GetSalesProductBySKUQueryHandler : IRequestHandler<GetSalesProductBySKUQuery, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;

    public GetSalesProductBySKUQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SalesProductDto>> Handle(GetSalesProductBySKUQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.SKU == request.SKU, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                new Error("Product.NotFound", $"Product with SKU '{request.SKU}' not found", ErrorType.NotFound));
        }

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class GetAllSalesProductsQueryHandler : IRequestHandler<GetAllSalesProductsQuery, Result<List<SalesProductListDto>>>
{
    private readonly SalesDbContext _context;

    public GetAllSalesProductsQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SalesProductListDto>>> Handle(GetAllSalesProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesProducts.AsNoTracking();

        if (!request.IncludeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        if (request.OnlyAvailableForSale)
        {
            query = query.Where(p => p.IsAvailableForSale);
        }

        var products = await query
            .OrderBy(p => p.ProductCode)
            .Select(p => SalesProductListDto.FromEntity(p))
            .ToListAsync(cancellationToken);

        return Result<List<SalesProductListDto>>.Success(products);
    }
}

public class GetSalesProductsPagedQueryHandler : IRequestHandler<GetSalesProductsPagedQuery, Result<PagedResult<SalesProductListDto>>>
{
    private readonly SalesDbContext _context;

    public GetSalesProductsPagedQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<SalesProductListDto>>> Handle(GetSalesProductsPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesProducts.AsNoTracking();

        // Filter by active status
        if (!request.IncludeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        // Filter by sale availability
        if (request.OnlyAvailableForSale)
        {
            query = query.Where(p => p.IsAvailableForSale);
        }

        // Filter by web visibility
        if (request.OnlyShowOnWeb)
        {
            query = query.Where(p => p.ShowOnWeb);
        }

        // Filter by product type
        if (request.ProductType.HasValue)
        {
            query = query.Where(p => p.ProductType == request.ProductType.Value);
        }

        // Filter by category
        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(p => p.Category == request.Category);
        }

        // Filter by sub-category
        if (!string.IsNullOrWhiteSpace(request.SubCategory))
        {
            query = query.Where(p => p.SubCategory == request.SubCategory);
        }

        // Filter by brand
        if (!string.IsNullOrWhiteSpace(request.Brand))
        {
            query = query.Where(p => p.Brand == request.Brand);
        }

        // Filter by price range
        if (request.MinPrice.HasValue)
        {
            query = query.Where(p => p.UnitPrice >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(p => p.UnitPrice <= request.MaxPrice.Value);
        }

        // Filter by stock
        if (request.InStock.HasValue)
        {
            if (request.InStock.Value)
                query = query.Where(p => !p.TrackStock || p.StockQuantity > 0);
            else
                query = query.Where(p => p.TrackStock && p.StockQuantity <= 0);
        }

        // Search
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.ProductCode.ToLower().Contains(term) ||
                p.Name.ToLower().Contains(term) ||
                (p.Barcode != null && p.Barcode.Contains(term)) ||
                (p.SKU != null && p.SKU.ToLower().Contains(term)) ||
                (p.Category != null && p.Category.ToLower().Contains(term)) ||
                (p.Brand != null && p.Brand.ToLower().Contains(term)));
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "productcode" => request.SortDescending ? query.OrderByDescending(p => p.ProductCode) : query.OrderBy(p => p.ProductCode),
            "name" => request.SortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "unitprice" => request.SortDescending ? query.OrderByDescending(p => p.UnitPrice) : query.OrderBy(p => p.UnitPrice),
            "stockquantity" => request.SortDescending ? query.OrderByDescending(p => p.StockQuantity) : query.OrderBy(p => p.StockQuantity),
            "category" => request.SortDescending ? query.OrderByDescending(p => p.Category) : query.OrderBy(p => p.Category),
            "createdat" => request.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            _ => query.OrderBy(p => p.ProductCode)
        };

        // Apply pagination
        var products = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => SalesProductListDto.FromEntity(p))
            .ToListAsync(cancellationToken);

        var pagedResult = new PagedResult<SalesProductListDto>(
            products,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PagedResult<SalesProductListDto>>.Success(pagedResult);
    }
}

public class SearchSalesProductsQueryHandler : IRequestHandler<SearchSalesProductsQuery, Result<List<SalesProductListDto>>>
{
    private readonly SalesDbContext _context;

    public SearchSalesProductsQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SalesProductListDto>>> Handle(SearchSalesProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesProducts.AsNoTracking();

        if (request.OnlyActive)
        {
            query = query.Where(p => p.IsActive);
        }

        if (request.OnlyAvailableForSale)
        {
            query = query.Where(p => p.IsAvailableForSale);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.ProductCode.ToLower().Contains(term) ||
                p.Name.ToLower().Contains(term) ||
                (p.Barcode != null && p.Barcode.Contains(term)) ||
                (p.SKU != null && p.SKU.ToLower().Contains(term)));
        }

        var products = await query
            .OrderBy(p => p.ProductCode)
            .Take(request.MaxResults)
            .Select(p => SalesProductListDto.FromEntity(p))
            .ToListAsync(cancellationToken);

        return Result<List<SalesProductListDto>>.Success(products);
    }
}

public class GetProductsByCategoryQueryHandler : IRequestHandler<GetProductsByCategoryQuery, Result<List<SalesProductListDto>>>
{
    private readonly SalesDbContext _context;

    public GetProductsByCategoryQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SalesProductListDto>>> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesProducts
            .AsNoTracking()
            .Where(p => p.Category == request.Category);

        if (!string.IsNullOrWhiteSpace(request.SubCategory))
        {
            query = query.Where(p => p.SubCategory == request.SubCategory);
        }

        if (request.OnlyActive)
        {
            query = query.Where(p => p.IsActive);
        }

        var products = await query
            .OrderBy(p => p.ProductCode)
            .Select(p => SalesProductListDto.FromEntity(p))
            .ToListAsync(cancellationToken);

        return Result<List<SalesProductListDto>>.Success(products);
    }
}

public class GetProductsByBrandQueryHandler : IRequestHandler<GetProductsByBrandQuery, Result<List<SalesProductListDto>>>
{
    private readonly SalesDbContext _context;

    public GetProductsByBrandQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SalesProductListDto>>> Handle(GetProductsByBrandQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesProducts
            .AsNoTracking()
            .Where(p => p.Brand == request.Brand);

        if (request.OnlyActive)
        {
            query = query.Where(p => p.IsActive);
        }

        var products = await query
            .OrderBy(p => p.ProductCode)
            .Select(p => SalesProductListDto.FromEntity(p))
            .ToListAsync(cancellationToken);

        return Result<List<SalesProductListDto>>.Success(products);
    }
}

public class GetLowStockProductsQueryHandler : IRequestHandler<GetLowStockProductsQuery, Result<List<SalesProductListDto>>>
{
    private readonly SalesDbContext _context;

    public GetLowStockProductsQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SalesProductListDto>>> Handle(GetLowStockProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesProducts
            .AsNoTracking()
            .Where(p => p.TrackStock && p.StockQuantity <= p.MinimumStock);

        if (request.OnlyActive)
        {
            query = query.Where(p => p.IsActive);
        }

        var products = await query
            .OrderBy(p => p.StockQuantity)
            .Select(p => SalesProductListDto.FromEntity(p))
            .ToListAsync(cancellationToken);

        return Result<List<SalesProductListDto>>.Success(products);
    }
}

public class GetWebProductsQueryHandler : IRequestHandler<GetWebProductsQuery, Result<List<SalesProductListDto>>>
{
    private readonly SalesDbContext _context;

    public GetWebProductsQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SalesProductListDto>>> Handle(GetWebProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesProducts
            .AsNoTracking()
            .Where(p => p.IsActive && p.IsAvailableForSale && p.ShowOnWeb);

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(p => p.Category == request.Category);
        }

        if (!string.IsNullOrWhiteSpace(request.Brand))
        {
            query = query.Where(p => p.Brand == request.Brand);
        }

        if (request.OnlyInStock)
        {
            query = query.Where(p => !p.TrackStock || p.StockQuantity > 0);
        }

        var products = await query
            .OrderBy(p => p.ProductCode)
            .Select(p => SalesProductListDto.FromEntity(p))
            .ToListAsync(cancellationToken);

        return Result<List<SalesProductListDto>>.Success(products);
    }
}

public class CheckBarcodeExistsQueryHandler : IRequestHandler<CheckBarcodeExistsQuery, Result<bool>>
{
    private readonly SalesDbContext _context;

    public CheckBarcodeExistsQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(CheckBarcodeExistsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesProducts
            .AsNoTracking()
            .Where(p => p.Barcode == request.Barcode);

        if (request.ExcludeProductId.HasValue)
        {
            query = query.Where(p => p.Id != request.ExcludeProductId.Value);
        }

        var exists = await query.AnyAsync(cancellationToken);

        return Result<bool>.Success(exists);
    }
}

public class CheckSKUExistsQueryHandler : IRequestHandler<CheckSKUExistsQuery, Result<bool>>
{
    private readonly SalesDbContext _context;

    public CheckSKUExistsQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(CheckSKUExistsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesProducts
            .AsNoTracking()
            .Where(p => p.SKU == request.SKU);

        if (request.ExcludeProductId.HasValue)
        {
            query = query.Where(p => p.Id != request.ExcludeProductId.Value);
        }

        var exists = await query.AnyAsync(cancellationToken);

        return Result<bool>.Success(exists);
    }
}

public class GetProductCategoriesQueryHandler : IRequestHandler<GetProductCategoriesQuery, Result<List<string>>>
{
    private readonly SalesDbContext _context;

    public GetProductCategoriesQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<string>>> Handle(GetProductCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.SalesProducts
            .AsNoTracking()
            .Where(p => p.IsActive && p.Category != null)
            .Select(p => p.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);

        return Result<List<string>>.Success(categories);
    }
}

public class GetProductBrandsQueryHandler : IRequestHandler<GetProductBrandsQuery, Result<List<string>>>
{
    private readonly SalesDbContext _context;

    public GetProductBrandsQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<string>>> Handle(GetProductBrandsQuery request, CancellationToken cancellationToken)
    {
        var brands = await _context.SalesProducts
            .AsNoTracking()
            .Where(p => p.IsActive && p.Brand != null)
            .Select(p => p.Brand!)
            .Distinct()
            .OrderBy(b => b)
            .ToListAsync(cancellationToken);

        return Result<List<string>>.Success(brands);
    }
}
