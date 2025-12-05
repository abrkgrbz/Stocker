using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Application.Features.Products.Queries;

/// <summary>
/// Query to get a product by ID
/// </summary>
public class GetProductByIdQuery : IRequest<Result<ProductDto>>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
}

/// <summary>
/// Handler for GetProductByIdQuery
/// </summary>
public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IUnitRepository _unitRepository;

    public GetProductByIdQueryHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IBrandRepository brandRepository,
        IUnitRepository unitRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
        _unitRepository = unitRepository;
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

        Brand? brand = null;
        if (product.BrandId.HasValue)
        {
            brand = await _brandRepository.GetByIdAsync(product.BrandId.Value, cancellationToken);
        }

        Domain.Entities.Unit? unit = null;
        if (product.UnitId.HasValue)
        {
            unit = await _unitRepository.GetByIdAsync(product.UnitId.Value, cancellationToken);
        }

        var productDto = new ProductDto
        {
            Id = product.Id,
            Code = product.Code,
            Name = product.Name,
            Description = product.Description,
            Barcode = product.Barcode,
            SKU = product.SKU,
            ProductType = product.ProductType,
            CategoryId = product.CategoryId,
            CategoryName = category?.Name,
            BrandId = product.BrandId,
            BrandName = brand?.Name,
            UnitId = product.UnitId ?? 0,
            UnitName = unit?.Name,
            UnitSymbol = unit?.Symbol,
            UnitPrice = product.UnitPrice?.Amount,
            UnitPriceCurrency = product.UnitPrice?.Currency,
            CostPrice = product.CostPrice?.Amount,
            CostPriceCurrency = product.CostPrice?.Currency,
            Weight = product.Weight,
            WeightUnit = product.WeightUnit,
            Length = product.Length,
            Width = product.Width,
            Height = product.Height,
            DimensionUnit = product.DimensionUnit,
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

        return Result<ProductDto>.Success(productDto);
    }
}
