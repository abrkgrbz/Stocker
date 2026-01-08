using MediatR;
using Stocker.Modules.Inventory.Application.Contracts;
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
/// Generates presigned URLs for product images
/// </summary>
public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IUnitRepository _unitRepository;
    private readonly IProductImageStorageService _storageService;

    public GetProductByIdQueryHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IBrandRepository brandRepository,
        IUnitRepository unitRepository,
        IProductImageStorageService storageService)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
        _unitRepository = unitRepository;
        _storageService = storageService;
    }

    public async Task<Result<ProductDto>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        // Use GetWithDetailsAsync to include Images
        var product = await _productRepository.GetWithDetailsAsync(request.ProductId, cancellationToken);

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

        // Generate presigned URLs for images
        var images = new List<ProductImageDto>();
        var activeImages = product.Images?
            .Where(i => i.IsActive)
            .OrderBy(i => i.DisplayOrder)
            .ToList() ?? new List<ProductImage>();

        foreach (var img in activeImages)
        {
            var imageUrl = img.Url;

            // If StoragePath is available, generate presigned URL (24 hours expiry)
            if (!string.IsNullOrEmpty(img.StoragePath))
            {
                var urlResult = await _storageService.GetImageUrlAsync(img.StoragePath, TimeSpan.FromHours(24), cancellationToken);
                if (urlResult.IsSuccess)
                {
                    imageUrl = urlResult.Value;
                }
            }

            images.Add(new ProductImageDto
            {
                Id = img.Id,
                ImageUrl = imageUrl,
                AltText = img.AltText,
                IsPrimary = img.IsPrimary,
                DisplayOrder = img.DisplayOrder
            });
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
            UpdatedAt = product.UpdatedDate,
            Images = images
        };

        return Result<ProductDto>.Success(productDto);
    }
}
