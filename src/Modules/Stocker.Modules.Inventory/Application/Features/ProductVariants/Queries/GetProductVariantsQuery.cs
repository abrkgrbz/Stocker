using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductVariants.Queries;

/// <summary>
/// Query to get all variants for a product
/// </summary>
public class GetProductVariantsQuery : IRequest<Result<List<ProductVariantDto>>>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetProductVariantsQuery
/// </summary>
public class GetProductVariantsQueryHandler : IRequestHandler<GetProductVariantsQuery, Result<List<ProductVariantDto>>>
{
    private readonly IProductVariantRepository _repository;

    public GetProductVariantsQueryHandler(IProductVariantRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<ProductVariantDto>>> Handle(GetProductVariantsQuery request, CancellationToken cancellationToken)
    {
        var variants = request.IncludeInactive
            ? await _repository.GetByProductIdAsync(request.ProductId, cancellationToken)
            : await _repository.GetActiveVariantsAsync(request.ProductId, cancellationToken);

        var dtos = variants.Select(v => new ProductVariantDto
        {
            Id = v.Id,
            ProductId = v.ProductId,
            ProductName = v.Product?.Name ?? string.Empty,
            Sku = v.Sku,
            Barcode = v.Barcode,
            VariantName = v.VariantName,
            Price = v.Price?.Amount,
            PriceCurrency = v.Price?.Currency,
            CostPrice = v.CostPrice?.Amount,
            CostPriceCurrency = v.CostPrice?.Currency,
            CompareAtPrice = v.CompareAtPrice?.Amount,
            CompareAtPriceCurrency = v.CompareAtPrice?.Currency,
            Weight = v.Weight,
            WeightUnit = v.WeightUnit,
            Dimensions = v.Dimensions,
            ImageUrl = v.ImageUrl,
            IsDefault = v.IsDefault,
            IsActive = v.IsActive,
            TrackInventory = v.TrackInventory,
            AllowBackorder = v.AllowBackorder,
            LowStockThreshold = v.LowStockThreshold,
            DisplayOrder = v.DisplayOrder,
            CreatedAt = v.CreatedDate,
            UpdatedAt = v.UpdatedDate,
            Options = v.Options?.Select(o => new ProductVariantOptionDto
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
            TotalStock = v.Stocks?.Sum(s => s.Quantity) ?? 0
        }).ToList();

        return Result<List<ProductVariantDto>>.Success(dtos);
    }
}
