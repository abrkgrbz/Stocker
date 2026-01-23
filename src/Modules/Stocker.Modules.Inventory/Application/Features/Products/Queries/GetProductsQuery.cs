using System.Linq;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Products.Queries;

/// <summary>
/// Query to get all products
/// </summary>
public class GetProductsQuery : IRequest<Result<List<ProductDto>>>
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; } = false;
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
}

/// <summary>
/// Handler for GetProductsQuery
/// </summary>
public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<List<ProductDto>>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IStockRepository _stockRepository;

    public GetProductsQueryHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IStockRepository stockRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _stockRepository = stockRepository;
    }

    public async Task<Result<List<ProductDto>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Product> products;

        if (request.CategoryId.HasValue)
        {
            products = await _productRepository.GetByCategoryAsync(request.CategoryId.Value, cancellationToken);
        }
        else if (request.BrandId.HasValue)
        {
            products = await _productRepository.GetByBrandAsync(request.BrandId.Value, cancellationToken);
        }
        else
        {
            products = request.IncludeInactive
                ? await _productRepository.GetAllAsync(cancellationToken)
                : await _productRepository.GetActiveProductsAsync(cancellationToken);
        }

        // Apply BrandId filter if CategoryId was used (both filters can be active)
        if (request.CategoryId.HasValue && request.BrandId.HasValue)
        {
            products = products.Where(p => p.BrandId == request.BrandId.Value).ToList();
        }

        // Apply IncludeInactive filter when using category or brand filter
        if (!request.IncludeInactive && (request.CategoryId.HasValue || request.BrandId.HasValue))
        {
            products = products.Where(p => p.IsActive).ToList();
        }

        var productDtos = new List<ProductDto>();
        foreach (var product in products)
        {
            var category = await _categoryRepository.GetByIdAsync(product.CategoryId, cancellationToken);
            var stocks = await _stockRepository.GetByProductAsync(product.Id, cancellationToken);
            var totalStock = stocks.Sum(s => s.Quantity);
            var availableStock = stocks.Sum(s => s.AvailableQuantity);
            productDtos.Add(MapToDto(product, category?.Name, totalStock, availableStock));
        }

        return Result<List<ProductDto>>.Success(productDtos);
    }

    private static ProductDto MapToDto(Domain.Entities.Product product, string? categoryName, decimal totalStock, decimal availableStock)
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
            UnitId = product.UnitId ?? 0,
            ProductType = product.ProductType,
            UnitPrice = product.UnitPrice?.Amount,
            UnitPriceCurrency = product.UnitPrice?.Currency,
            CostPrice = product.CostPrice?.Amount,
            CostPriceCurrency = product.CostPrice?.Currency,
            TotalStockQuantity = totalStock,
            AvailableStockQuantity = availableStock,
            MinStockLevel = product.MinimumStock,
            MaxStockLevel = product.MaximumStock,
            ReorderLevel = product.ReorderPoint,
            ReorderQuantity = product.ReorderQuantity,
            LeadTimeDays = product.LeadTimeDays,
            TrackSerialNumbers = product.IsSerialTracked,
            TrackLotNumbers = product.IsLotTracked,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedDate,
            UpdatedAt = product.UpdatedDate
        };
    }
}
