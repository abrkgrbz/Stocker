using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductVariants.Queries;

/// <summary>
/// Query to get a product variant by ID
/// </summary>
public class GetProductVariantByIdQuery : IRequest<Result<ProductVariantDto>>
{
    public int TenantId { get; set; }
    public int VariantId { get; set; }
}

/// <summary>
/// Handler for GetProductVariantByIdQuery
/// </summary>
public class GetProductVariantByIdQueryHandler : IRequestHandler<GetProductVariantByIdQuery, Result<ProductVariantDto>>
{
    private readonly IProductVariantRepository _repository;

    public GetProductVariantByIdQueryHandler(IProductVariantRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ProductVariantDto>> Handle(GetProductVariantByIdQuery request, CancellationToken cancellationToken)
    {
        var variant = await _repository.GetWithOptionsAsync(request.VariantId, cancellationToken);

        if (variant == null)
        {
            return Result<ProductVariantDto>.Failure(
                new Error("ProductVariant.NotFound", $"Product variant with ID {request.VariantId} not found", ErrorType.NotFound));
        }

        var dto = new ProductVariantDto
        {
            Id = variant.Id,
            ProductId = variant.ProductId,
            ProductName = variant.Product?.Name ?? string.Empty,
            Sku = variant.Sku,
            Barcode = variant.Barcode,
            VariantName = variant.VariantName,
            Price = variant.Price?.Amount,
            PriceCurrency = variant.Price?.Currency,
            CostPrice = variant.CostPrice?.Amount,
            CostPriceCurrency = variant.CostPrice?.Currency,
            CompareAtPrice = variant.CompareAtPrice?.Amount,
            CompareAtPriceCurrency = variant.CompareAtPrice?.Currency,
            Weight = variant.Weight,
            WeightUnit = variant.WeightUnit,
            Dimensions = variant.Dimensions,
            ImageUrl = variant.ImageUrl,
            IsDefault = variant.IsDefault,
            IsActive = variant.IsActive,
            TrackInventory = variant.TrackInventory,
            AllowBackorder = variant.AllowBackorder,
            LowStockThreshold = variant.LowStockThreshold,
            DisplayOrder = variant.DisplayOrder,
            CreatedAt = variant.CreatedDate,
            UpdatedAt = variant.UpdatedDate,
            Options = variant.Options?.Select(o => new ProductVariantOptionDto
            {
                Id = o.Id,
                ProductVariantId = o.ProductVariantId,
                ProductAttributeId = o.ProductAttributeId,
                AttributeCode = o.ProductAttribute?.Code ?? string.Empty,
                AttributeName = o.ProductAttribute?.Name ?? string.Empty,
                ProductAttributeOptionId = o.ProductAttributeOptionId,
                Value = o.Value,
                DisplayOrder = o.DisplayOrder
            }).ToList() ?? new List<ProductVariantOptionDto>(),
            TotalStock = variant.Stocks?.Sum(s => s.Quantity) ?? 0
        };

        return Result<ProductVariantDto>.Success(dto);
    }
}
