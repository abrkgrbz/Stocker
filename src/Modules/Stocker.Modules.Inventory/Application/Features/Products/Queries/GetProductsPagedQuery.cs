using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Products.Queries;

/// <summary>
/// Product filter parameters for advanced filtering
/// </summary>
public class ProductFilterParams
{
    public string? SearchTerm { get; set; }
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    public List<ProductType>? ProductTypes { get; set; }
    public StockStatus? StockStatus { get; set; }
    public TrackingType? TrackingType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool IncludeInactive { get; set; } = false;
    public string? SortBy { get; set; } = "name";
    public bool SortDescending { get; set; } = false;
}

/// <summary>
/// Stock status filter enum
/// </summary>
public enum StockStatus
{
    All,
    InStock,
    LowStock,
    OutOfStock
}

/// <summary>
/// Tracking type filter enum
/// </summary>
public enum TrackingType
{
    All,
    Serial,
    Lot,
    None
}

/// <summary>
/// Query to get products with pagination and advanced filtering
/// </summary>
public class GetProductsPagedQuery : IRequest<Result<PagedResult<ProductDto>>>
{
    public Guid TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public ProductFilterParams Filters { get; set; } = new();
}

/// <summary>
/// Validator for GetProductsPagedQuery
/// </summary>
public class GetProductsPagedQueryValidator : AbstractValidator<GetProductsPagedQuery>
{
    public GetProductsPagedQueryValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.PageNumber).GreaterThan(0).WithMessage("Sayfa numarası 1 veya daha büyük olmalıdır");
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100).WithMessage("Sayfa boyutu 1-100 arasında olmalıdır");
        RuleFor(x => x.Filters.MinPrice)
            .LessThanOrEqualTo(x => x.Filters.MaxPrice)
            .When(x => x.Filters.MinPrice.HasValue && x.Filters.MaxPrice.HasValue)
            .WithMessage("Minimum fiyat maksimum fiyattan büyük olamaz");
    }
}

/// <summary>
/// Handler for GetProductsPagedQuery
/// </summary>
public class GetProductsPagedQueryHandler : IRequestHandler<GetProductsPagedQuery, Result<PagedResult<ProductDto>>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public GetProductsPagedQueryHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<ProductDto>>> Handle(GetProductsPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Products.AsQueryable();

        // Apply filters
        query = ApplyFilters(query, request.Filters);

        // Get total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = ApplySorting(query, request.Filters.SortBy, request.Filters.SortDescending);

        // Apply pagination
        var products = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Map to DTOs with related data
        var productDtos = new List<ProductDto>();
        foreach (var product in products)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId, cancellationToken);
            var brand = product.BrandId.HasValue 
                ? await _unitOfWork.Brands.GetByIdAsync(product.BrandId.Value, cancellationToken) 
                : null;
            
            // Get current stock for stock status filtering
            var stocks = await _unitOfWork.Stocks.GetByProductAsync(product.Id, cancellationToken);
            var totalStock = stocks.Sum(s => s.Quantity);

            productDtos.Add(MapToDto(product, category?.Name, brand?.Name, totalStock));
        }

        var result = PagedResult<ProductDto>.Create(productDtos, totalCount, request.PageNumber, request.PageSize);
        return Result<PagedResult<ProductDto>>.Success(result);
    }

    private IQueryable<Domain.Entities.Product> ApplyFilters(
        IQueryable<Domain.Entities.Product> query, 
        ProductFilterParams filters)
    {
        // Active filter
        if (!filters.IncludeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        // Search term (name, code, barcode)
        if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
        {
            var searchTerm = filters.SearchTerm.ToLower();
            query = query.Where(p => 
                p.Name.ToLower().Contains(searchTerm) ||
                p.Code.ToLower().Contains(searchTerm) ||
                (p.Barcode != null && p.Barcode.ToLower().Contains(searchTerm)) ||
                (p.SKU != null && p.SKU.ToLower().Contains(searchTerm)));
        }

        // Category filter
        if (filters.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == filters.CategoryId.Value);
        }

        // Brand filter
        if (filters.BrandId.HasValue)
        {
            query = query.Where(p => p.BrandId == filters.BrandId.Value);
        }

        // Product type filter
        if (filters.ProductTypes != null && filters.ProductTypes.Any())
        {
            query = query.Where(p => filters.ProductTypes.Contains(p.ProductType));
        }

        // Price range filter
        if (filters.MinPrice.HasValue)
        {
            query = query.Where(p => p.UnitPrice != null && p.UnitPrice.Amount >= filters.MinPrice.Value);
        }

        if (filters.MaxPrice.HasValue)
        {
            query = query.Where(p => p.UnitPrice != null && p.UnitPrice.Amount <= filters.MaxPrice.Value);
        }

        // Tracking type filter
        if (filters.TrackingType.HasValue && filters.TrackingType.Value != TrackingType.All)
        {
            switch (filters.TrackingType.Value)
            {
                case TrackingType.Serial:
                    query = query.Where(p => p.IsSerialTracked);
                    break;
                case TrackingType.Lot:
                    query = query.Where(p => p.IsLotTracked);
                    break;
                case TrackingType.None:
                    query = query.Where(p => !p.IsSerialTracked && !p.IsLotTracked);
                    break;
            }
        }

        return query;
    }

    private IQueryable<Domain.Entities.Product> ApplySorting(
        IQueryable<Domain.Entities.Product> query,
        string? sortBy,
        bool sortDescending)
    {
        return (sortBy?.ToLower(), sortDescending) switch
        {
            ("name", false) => query.OrderBy(p => p.Name),
            ("name", true) => query.OrderByDescending(p => p.Name),
            ("code", false) => query.OrderBy(p => p.Code),
            ("code", true) => query.OrderByDescending(p => p.Code),
            ("price", false) => query.OrderBy(p => p.UnitPrice != null ? p.UnitPrice.Amount : 0),
            ("price", true) => query.OrderByDescending(p => p.UnitPrice != null ? p.UnitPrice.Amount : 0),
            ("created", false) => query.OrderBy(p => p.CreatedDate),
            ("created", true) => query.OrderByDescending(p => p.CreatedDate),
            ("updated", false) => query.OrderBy(p => p.UpdatedDate),
            ("updated", true) => query.OrderByDescending(p => p.UpdatedDate),
            _ => query.OrderBy(p => p.Name)
        };
    }

    private static ProductDto MapToDto(
        Domain.Entities.Product product, 
        string? categoryName, 
        string? brandName,
        decimal totalStock)
    {
        return new ProductDto
        {
            Id = product.Id,
            Code = product.Code,
            Name = product.Name,
            Description = product.Description,
            Barcode = product.Barcode,
            SKU = product.SKU,
            CategoryId = product.CategoryId,
            CategoryName = categoryName,
            BrandId = product.BrandId,
            BrandName = brandName,
            ProductType = product.ProductType,
            UnitPrice = product.UnitPrice?.Amount,
            UnitPriceCurrency = product.UnitPrice?.Currency,
            CostPrice = product.CostPrice?.Amount,
            CostPriceCurrency = product.CostPrice?.Currency,
            MinStockLevel = product.MinimumStock,
            MaxStockLevel = product.MaximumStock,
            ReorderLevel = product.ReorderPoint,
            ReorderQuantity = product.ReorderQuantity,
            LeadTimeDays = product.LeadTimeDays,
            TotalStockQuantity = totalStock,
            TrackSerialNumbers = product.IsSerialTracked,
            TrackLotNumbers = product.IsLotTracked,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedDate,
            UpdatedAt = product.UpdatedDate
        };
    }
}
