using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductBundles.Queries;

/// <summary>
/// Query to get all product bundles
/// </summary>
public class GetProductBundlesQuery : IRequest<Result<List<ProductBundleDto>>>
{
    public int TenantId { get; set; }
    public bool IncludeInactive { get; set; }
    public bool ValidOnly { get; set; }
    public BundleType? BundleType { get; set; }
}

/// <summary>
/// Handler for GetProductBundlesQuery
/// </summary>
public class GetProductBundlesQueryHandler : IRequestHandler<GetProductBundlesQuery, Result<List<ProductBundleDto>>>
{
    private readonly IProductBundleRepository _repository;

    public GetProductBundlesQueryHandler(IProductBundleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<ProductBundleDto>>> Handle(GetProductBundlesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<ProductBundle> bundles;

        if (request.BundleType.HasValue)
        {
            bundles = await _repository.GetByTypeAsync(request.BundleType.Value, cancellationToken);
        }
        else if (request.ValidOnly)
        {
            bundles = await _repository.GetValidBundlesAsync(cancellationToken);
        }
        else if (request.IncludeInactive)
        {
            bundles = await _repository.GetAllAsync(cancellationToken);
        }
        else
        {
            bundles = await _repository.GetActiveBundlesAsync(cancellationToken);
        }

        var dtos = bundles.Select(b => new ProductBundleDto
        {
            Id = b.Id,
            Code = b.Code,
            Name = b.Name,
            Description = b.Description,
            BundleType = b.BundleType,
            PricingType = b.PricingType,
            FixedPrice = b.FixedPrice?.Amount,
            FixedPriceCurrency = b.FixedPrice?.Currency,
            DiscountPercentage = b.DiscountPercentage,
            DiscountAmount = b.DiscountAmount,
            RequireAllItems = b.RequireAllItems,
            MinSelectableItems = b.MinSelectableItems,
            MaxSelectableItems = b.MaxSelectableItems,
            ValidFrom = b.ValidFrom,
            ValidTo = b.ValidTo,
            IsActive = b.IsActive,
            ImageUrl = b.ImageUrl,
            DisplayOrder = b.DisplayOrder,
            IsValid = b.IsValid(),
            CreatedAt = b.CreatedDate,
            UpdatedAt = b.UpdatedDate,
            Items = b.Items?.Select(i => new ProductBundleItemDto
            {
                Id = i.Id,
                ProductBundleId = i.ProductBundleId,
                ProductId = i.ProductId,
                ProductCode = i.Product?.Code ?? string.Empty,
                ProductName = i.Product?.Name ?? string.Empty,
                Quantity = i.Quantity,
                IsRequired = i.IsRequired,
                IsDefault = i.IsDefault,
                OverridePrice = i.OverridePrice?.Amount,
                OverridePriceCurrency = i.OverridePrice?.Currency,
                DiscountPercentage = i.DiscountPercentage,
                DisplayOrder = i.DisplayOrder,
                MinQuantity = i.MinQuantity,
                MaxQuantity = i.MaxQuantity,
                ProductPrice = i.Product?.UnitPrice.Amount,
                ProductPriceCurrency = i.Product?.UnitPrice.Currency
            }).ToList() ?? new List<ProductBundleItemDto>(),
            CalculatedPrice = b.CalculatePrice().Amount
        }).ToList();

        return Result<List<ProductBundleDto>>.Success(dtos);
    }
}
