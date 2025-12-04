using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductBundles.Commands;

/// <summary>
/// Command to update a product bundle
/// </summary>
public class UpdateProductBundleCommand : IRequest<Result<ProductBundleDto>>
{
    public int TenantId { get; set; }
    public int BundleId { get; set; }
    public UpdateProductBundleDto BundleData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateProductBundleCommand
/// </summary>
public class UpdateProductBundleCommandValidator : AbstractValidator<UpdateProductBundleCommand>
{
    public UpdateProductBundleCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.BundleId).GreaterThan(0);
        RuleFor(x => x.BundleData).NotNull();
        RuleFor(x => x.BundleData.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BundleData.Description).MaximumLength(1000);
        RuleFor(x => x.BundleData.ImageUrl).MaximumLength(500);
        RuleFor(x => x.BundleData.PricingType).IsInEnum();
        RuleFor(x => x.BundleData.DiscountPercentage)
            .InclusiveBetween(0, 100)
            .When(x => x.BundleData.DiscountPercentage.HasValue);
    }
}

/// <summary>
/// Handler for UpdateProductBundleCommand
/// </summary>
public class UpdateProductBundleCommandHandler : IRequestHandler<UpdateProductBundleCommand, Result<ProductBundleDto>>
{
    private readonly IProductBundleRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductBundleCommandHandler(IProductBundleRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductBundleDto>> Handle(UpdateProductBundleCommand request, CancellationToken cancellationToken)
    {
        var bundle = await _repository.GetWithItemsAsync(request.BundleId, cancellationToken);

        if (bundle == null)
        {
            return Result<ProductBundleDto>.Failure(
                new Error("ProductBundle.NotFound", $"Product bundle with ID {request.BundleId} not found", ErrorType.NotFound));
        }

        var data = request.BundleData;

        bundle.UpdateBundle(data.Name, data.Description);
        bundle.SetImage(data.ImageUrl);
        bundle.SetDisplayOrder(data.DisplayOrder);
        bundle.SetSelectableOptions(data.RequireAllItems, data.MinSelectableItems, data.MaxSelectableItems);
        bundle.SetValidityPeriod(data.ValidFrom, data.ValidTo);

        // Update pricing
        Money? fixedPrice = data.FixedPrice.HasValue ? Money.Create(data.FixedPrice.Value, data.FixedPriceCurrency ?? "TRY") : null;
        bundle.SetPricing(data.PricingType, fixedPrice, data.DiscountPercentage, data.DiscountAmount);

        _repository.Update(bundle);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
