using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductBundles.Commands;

/// <summary>
/// Command to create a new product bundle
/// </summary>
public class CreateProductBundleCommand : IRequest<Result<ProductBundleDto>>
{
    public Guid TenantId { get; set; }
    public CreateProductBundleDto BundleData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateProductBundleCommand
/// </summary>
public class CreateProductBundleCommandValidator : AbstractValidator<CreateProductBundleCommand>
{
    public CreateProductBundleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.BundleData).NotNull();
        RuleFor(x => x.BundleData.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.BundleData.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BundleData.Description).MaximumLength(1000);
        RuleFor(x => x.BundleData.ImageUrl).MaximumLength(500);
        RuleFor(x => x.BundleData.BundleType).IsInEnum();
        RuleFor(x => x.BundleData.PricingType).IsInEnum();
        RuleFor(x => x.BundleData.DiscountPercentage)
            .InclusiveBetween(0, 100)
            .When(x => x.BundleData.DiscountPercentage.HasValue);
    }
}

/// <summary>
/// Handler for CreateProductBundleCommand
/// </summary>
public class CreateProductBundleCommandHandler : IRequestHandler<CreateProductBundleCommand, Result<ProductBundleDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateProductBundleCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductBundleDto>> Handle(CreateProductBundleCommand request, CancellationToken cancellationToken)
    {
        var data = request.BundleData;

        // Check if bundle with same code already exists
        if (await _unitOfWork.ProductBundles.ExistsWithCodeAsync(data.Code, null, cancellationToken))
        {
            return Result<ProductBundleDto>.Failure(
                new Error("ProductBundle.DuplicateCode", $"Bundle with code '{data.Code}' already exists", ErrorType.Conflict));
        }

        // Create the bundle
        var bundle = new ProductBundle(data.Code, data.Name, data.BundleType, data.PricingType);
        bundle.UpdateBundle(data.Name, data.Description);
        bundle.SetImage(data.ImageUrl);
        bundle.SetDisplayOrder(data.DisplayOrder);
        bundle.SetSelectableOptions(data.RequireAllItems, data.MinSelectableItems, data.MaxSelectableItems);

        // Set validity period
        if (data.ValidFrom.HasValue || data.ValidTo.HasValue)
        {
            bundle.SetValidityPeriod(data.ValidFrom, data.ValidTo);
        }

        // Set pricing
        Money? fixedPrice = data.FixedPrice.HasValue ? Money.Create(data.FixedPrice.Value, data.FixedPriceCurrency ?? "TRY") : null;
        bundle.SetPricing(data.PricingType, fixedPrice, data.DiscountPercentage, data.DiscountAmount);

        bundle.SetTenantId(request.TenantId);
        await _unitOfWork.ProductBundles.AddAsync(bundle, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add items if provided
        if (data.Items != null && data.Items.Any())
        {
            foreach (var itemData in data.Items.OrderBy(i => i.DisplayOrder))
            {
                // Verify product exists
                var product = await _unitOfWork.Products.GetByIdAsync(itemData.ProductId, cancellationToken);
                if (product == null)
                {
                    return Result<ProductBundleDto>.Failure(
                        new Error("Product.NotFound", $"Product with ID {itemData.ProductId} not found", ErrorType.NotFound));
                }

                var item = bundle.AddItem(itemData.ProductId, itemData.Quantity, itemData.IsRequired);
                item.SetDefault(itemData.IsDefault);
                item.SetDisplayOrder(itemData.DisplayOrder);
                item.SetQuantityLimits(itemData.MinQuantity, itemData.MaxQuantity);

                if (itemData.OverridePrice.HasValue)
                {
                    item.SetOverridePrice(Money.Create(itemData.OverridePrice.Value, itemData.OverridePriceCurrency ?? "TRY"));
                }

                if (itemData.DiscountPercentage.HasValue)
                {
                    item.SetDiscount(itemData.DiscountPercentage);
                }
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // Reload to get items
        bundle = await _unitOfWork.ProductBundles.GetWithItemsAsync(bundle.Id, cancellationToken);

        var dto = new ProductBundleDto
        {
            Id = bundle!.Id,
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
