using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductBundles.Queries;

/// <summary>
/// Query to get a product bundle by ID
/// </summary>
public class GetProductBundleByIdQuery : IRequest<Result<ProductBundleDto>>
{
    public Guid TenantId { get; set; }
    public int BundleId { get; set; }
}

/// <summary>
/// Handler for GetProductBundleByIdQuery
/// </summary>
public class GetProductBundleByIdQueryHandler : IRequestHandler<GetProductBundleByIdQuery, Result<ProductBundleDto>>
{
    private readonly IProductBundleRepository _repository;

    public GetProductBundleByIdQueryHandler(IProductBundleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ProductBundleDto>> Handle(GetProductBundleByIdQuery request, CancellationToken cancellationToken)
    {
        var bundle = await _repository.GetWithItemsAsync(request.BundleId, cancellationToken);

        if (bundle == null)
        {
            return Result<ProductBundleDto>.Failure(
                new Error("ProductBundle.NotFound", $"Product bundle with ID {request.BundleId} not found", ErrorType.NotFound));
        }

        var dto = new ProductBundleDto
        {
            Id = bundle.Id,
            Code = bundle.Code,
            Name = bundle.Name,
            Description = bundle.Description,
            BundleType = bundle.BundleType,
            PricingType = bundle.PricingType,
            FixedPrice = bundle.FixedPrice?.Amount,
            FixedPriceCurrency = bundle.FixedPrice?.Currency,
            DiscountPercentage = bundle.DiscountPercentage,
            DiscountAmount = bundle.DiscountAmount,
            RequireAllItems = bundle.RequireAllItems,
            MinSelectableItems = bundle.MinSelectableItems,
            MaxSelectableItems = bundle.MaxSelectableItems,
            ValidFrom = bundle.ValidFrom,
            ValidTo = bundle.ValidTo,
            IsActive = bundle.IsActive,
            ImageUrl = bundle.ImageUrl,
            DisplayOrder = bundle.DisplayOrder,
            IsValid = bundle.IsValid(),
            CreatedAt = bundle.CreatedDate,
            UpdatedAt = bundle.UpdatedDate,
            Items = bundle.Items?.Select(i => new ProductBundleItemDto
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
            CalculatedPrice = bundle.CalculatePrice().Amount
        };

        return Result<ProductBundleDto>.Success(dto);
    }
}
