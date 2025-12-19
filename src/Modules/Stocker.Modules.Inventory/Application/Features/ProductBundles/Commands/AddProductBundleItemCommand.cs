using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductBundles.Commands;

/// <summary>
/// Command to add an item to a product bundle
/// </summary>
public class AddProductBundleItemCommand : IRequest<Result<ProductBundleItemDto>>
{
    public Guid TenantId { get; set; }
    public int BundleId { get; set; }
    public CreateProductBundleItemDto ItemData { get; set; } = null!;
}

/// <summary>
/// Validator for AddProductBundleItemCommand
/// </summary>
public class AddProductBundleItemCommandValidator : AbstractValidator<AddProductBundleItemCommand>
{
    public AddProductBundleItemCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.BundleId).NotEmpty();
        RuleFor(x => x.ItemData).NotNull();
        RuleFor(x => x.ItemData.ProductId).NotEmpty();
        RuleFor(x => x.ItemData.Quantity).NotEmpty();
        RuleFor(x => x.ItemData.DiscountPercentage)
            .InclusiveBetween(0, 100)
            .When(x => x.ItemData.DiscountPercentage.HasValue);
        RuleFor(x => x.ItemData.MinQuantity)
            .NotEmpty()
            .When(x => x.ItemData.MinQuantity.HasValue);
        RuleFor(x => x.ItemData.MaxQuantity)
            .GreaterThanOrEqualTo(x => x.ItemData.MinQuantity ?? 1)
            .When(x => x.ItemData.MaxQuantity.HasValue);
    }
}

/// <summary>
/// Handler for AddProductBundleItemCommand
/// </summary>
public class AddProductBundleItemCommandHandler : IRequestHandler<AddProductBundleItemCommand, Result<ProductBundleItemDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public AddProductBundleItemCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductBundleItemDto>> Handle(AddProductBundleItemCommand request, CancellationToken cancellationToken)
    {
        var bundle = await _unitOfWork.ProductBundles.GetWithItemsAsync(request.BundleId, cancellationToken);

        if (bundle == null)
        {
            return Result<ProductBundleItemDto>.Failure(
                new Error("ProductBundle.NotFound", $"Product bundle with ID {request.BundleId} not found", ErrorType.NotFound));
        }

        // Verify product exists
        var product = await _unitOfWork.Products.GetByIdAsync(request.ItemData.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<ProductBundleItemDto>.Failure(
                new Error("Product.NotFound", $"Product with ID {request.ItemData.ProductId} not found", ErrorType.NotFound));
        }

        // Check if product is already in bundle
        if (bundle.Items?.Any(i => i.ProductId == request.ItemData.ProductId) == true)
        {
            return Result<ProductBundleItemDto>.Failure(
                new Error("ProductBundle.DuplicateItem", "This product is already in the bundle", ErrorType.Validation));
        }

        var data = request.ItemData;

        // Use the bundle's AddItem method which creates and adds the item
        var item = bundle.AddItem(data.ProductId, data.Quantity, data.IsRequired);

        item.SetDefault(data.IsDefault);
        item.SetDisplayOrder(data.DisplayOrder);
        item.SetQuantityLimits(data.MinQuantity, data.MaxQuantity);

        if (data.OverridePrice.HasValue)
        {
            item.SetOverridePrice(Money.Create(data.OverridePrice.Value, data.OverridePriceCurrency ?? "TRY"));
        }

        if (data.DiscountPercentage.HasValue)
        {
            item.SetDiscount(data.DiscountPercentage);
        }

        _unitOfWork.ProductBundles.Update(bundle);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ProductBundleItemDto
        {
            Id = item.Id,
            ProductBundleId = item.ProductBundleId,
            ProductId = item.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            Quantity = item.Quantity,
            IsRequired = item.IsRequired,
            IsDefault = item.IsDefault,
            OverridePrice = item.OverridePrice?.Amount,
            OverridePriceCurrency = item.OverridePrice?.Currency,
            DiscountPercentage = item.DiscountPercentage,
            DisplayOrder = item.DisplayOrder,
            MinQuantity = item.MinQuantity,
            MaxQuantity = item.MaxQuantity,
            ProductPrice = product.UnitPrice.Amount,
            ProductPriceCurrency = product.UnitPrice.Currency
        };

        return Result<ProductBundleItemDto>.Success(dto);
    }
}
