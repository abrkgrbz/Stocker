using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductBundles.Commands;

/// <summary>
/// Command to update a product bundle item
/// </summary>
public class UpdateProductBundleItemCommand : IRequest<Result<ProductBundleItemDto>>
{
    public Guid TenantId { get; set; }
    public int BundleId { get; set; }
    public int ItemId { get; set; }
    public UpdateProductBundleItemDto ItemData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateProductBundleItemCommand
/// </summary>
public class UpdateProductBundleItemCommandValidator : AbstractValidator<UpdateProductBundleItemCommand>
{
    public UpdateProductBundleItemCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.BundleId).NotEmpty();
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.ItemData).NotNull();
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
/// Handler for UpdateProductBundleItemCommand
/// </summary>
public class UpdateProductBundleItemCommandHandler : IRequestHandler<UpdateProductBundleItemCommand, Result<ProductBundleItemDto>>
{
    private readonly IProductBundleRepository _bundleRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductBundleItemCommandHandler(
        IProductBundleRepository bundleRepository,
        IProductRepository productRepository,
        IUnitOfWork unitOfWork)
    {
        _bundleRepository = bundleRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductBundleItemDto>> Handle(UpdateProductBundleItemCommand request, CancellationToken cancellationToken)
    {
        var bundle = await _bundleRepository.GetWithItemsAsync(request.BundleId, cancellationToken);

        if (bundle == null)
        {
            return Result<ProductBundleItemDto>.Failure(
                new Error("ProductBundle.NotFound", $"Product bundle with ID {request.BundleId} not found", ErrorType.NotFound));
        }

        var item = bundle.Items?.FirstOrDefault(i => i.Id == request.ItemId);
        if (item == null)
        {
            return Result<ProductBundleItemDto>.Failure(
                new Error("ProductBundleItem.NotFound", $"Bundle item with ID {request.ItemId} not found", ErrorType.NotFound));
        }

        var data = request.ItemData;

        item.UpdateQuantity(data.Quantity);
        item.SetDisplayOrder(data.DisplayOrder);
        item.SetQuantityLimits(data.MinQuantity, data.MaxQuantity);

        Money? overridePrice = data.OverridePrice.HasValue
            ? Money.Create(data.OverridePrice.Value, data.OverridePriceCurrency ?? "TRY")
            : null;
        item.SetOverridePrice(overridePrice);
        item.SetDiscount(data.DiscountPercentage);

        item.SetRequired(data.IsRequired);
        item.SetDefault(data.IsDefault);

        _bundleRepository.Update(bundle);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get product info for DTO
        var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);

        var dto = new ProductBundleItemDto
        {
            Id = item.Id,
            ProductBundleId = item.ProductBundleId,
            ProductId = item.ProductId,
            ProductCode = product?.Code ?? string.Empty,
            ProductName = product?.Name ?? string.Empty,
            Quantity = item.Quantity,
            IsRequired = item.IsRequired,
            IsDefault = item.IsDefault,
            OverridePrice = item.OverridePrice?.Amount,
            OverridePriceCurrency = item.OverridePrice?.Currency,
            DiscountPercentage = item.DiscountPercentage,
            DisplayOrder = item.DisplayOrder,
            MinQuantity = item.MinQuantity,
            MaxQuantity = item.MaxQuantity,
            ProductPrice = product?.UnitPrice.Amount,
            ProductPriceCurrency = product?.UnitPrice.Currency
        };

        return Result<ProductBundleItemDto>.Success(dto);
    }
}
