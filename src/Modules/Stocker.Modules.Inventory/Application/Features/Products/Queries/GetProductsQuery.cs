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

    public GetProductsQueryHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<List<ProductDto>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Product> products;

        if (request.CategoryId.HasValue)
        {
            products = await _productRepository.GetByCategoryAsync(request.CategoryId.Value, cancellationToken);
        }
        else
        {
            products = request.IncludeInactive
                ? await _productRepository.GetAllAsync(cancellationToken)
                : await _productRepository.GetActiveProductsAsync(cancellationToken);
        }

        var productDtos = new List<ProductDto>();
        foreach (var product in products)
        {
            var category = await _categoryRepository.GetByIdAsync(product.CategoryId, cancellationToken);
            productDtos.Add(MapToDto(product, category?.Name));
        }

        return Result<List<ProductDto>>.Success(productDtos);
    }

    private static ProductDto MapToDto(Domain.Entities.Product product, string? categoryName)
    {
        return new ProductDto
        {
            Id = product.Id,
            Code = product.Code,
            Name = product.Name,
            Description = product.Description,
            Barcode = product.Barcode,
            CategoryId = product.CategoryId,
            CategoryName = categoryName,
            BrandId = product.BrandId,
            UnitPrice = product.UnitPrice?.Amount,
            UnitPriceCurrency = product.UnitPrice?.Currency,
            CostPrice = product.CostPrice?.Amount,
            CostPriceCurrency = product.CostPrice?.Currency,
            MinStockLevel = product.MinimumStock,
            MaxStockLevel = product.MaximumStock,
            ReorderLevel = product.ReorderPoint,
            TrackSerialNumbers = product.IsSerialTracked,
            TrackLotNumbers = product.IsLotTracked,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedDate,
            UpdatedAt = product.UpdatedDate
        };
    }
}
