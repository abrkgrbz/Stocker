using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Products.Queries;

/// <summary>
/// Query to get a product by ID
/// </summary>
public class GetProductByIdQuery : IRequest<Result<ProductDto>>
{
    public int TenantId { get; set; }
    public int ProductId { get; set; }
}

/// <summary>
/// Handler for GetProductByIdQuery
/// </summary>
public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;

    public GetProductByIdQueryHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<ProductDto>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);

        if (product == null)
        {
            return Result<ProductDto>.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        var category = await _categoryRepository.GetByIdAsync(product.CategoryId, cancellationToken);

        var productDto = new ProductDto
        {
            Id = product.Id,
            Code = product.Code,
            Name = product.Name,
            Description = product.Description,
            Barcode = product.Barcode,
            CategoryId = product.CategoryId,
            CategoryName = category?.Name,
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

        return Result<ProductDto>.Success(productDto);
    }
}
