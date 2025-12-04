using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductVariants.Commands;

/// <summary>
/// Command to update a product variant
/// </summary>
public class UpdateProductVariantCommand : IRequest<Result<ProductVariantDto>>
{
    public Guid TenantId { get; set; }
    public int VariantId { get; set; }
    public UpdateProductVariantDto VariantData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateProductVariantCommand
/// </summary>
public class UpdateProductVariantCommandValidator : AbstractValidator<UpdateProductVariantCommand>
{
    public UpdateProductVariantCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.VariantId).NotEmpty();
        RuleFor(x => x.VariantData).NotNull();
        RuleFor(x => x.VariantData.Sku).NotEmpty().MaximumLength(100);
        RuleFor(x => x.VariantData.VariantName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.VariantData.Barcode).MaximumLength(100);
        RuleFor(x => x.VariantData.Dimensions).MaximumLength(100);
        RuleFor(x => x.VariantData.ImageUrl).MaximumLength(500);
    }
}

/// <summary>
/// Handler for UpdateProductVariantCommand
/// </summary>
public class UpdateProductVariantCommandHandler : IRequestHandler<UpdateProductVariantCommand, Result<ProductVariantDto>>
{
    private readonly IProductVariantRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductVariantCommandHandler(IProductVariantRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductVariantDto>> Handle(UpdateProductVariantCommand request, CancellationToken cancellationToken)
    {
        var variant = await _repository.GetWithOptionsAsync(request.VariantId, cancellationToken);

        if (variant == null)
        {
            return Result<ProductVariantDto>.Failure(
                new Error("ProductVariant.NotFound", $"Product variant with ID {request.VariantId} not found", ErrorType.NotFound));
        }

        var data = request.VariantData;

        // Check SKU uniqueness if changed
        if (variant.Sku != data.Sku && await _repository.ExistsWithSkuAsync(data.Sku, request.VariantId, cancellationToken))
        {
            return Result<ProductVariantDto>.Failure(
                new Error("ProductVariant.DuplicateSku", $"Variant with SKU '{data.Sku}' already exists", ErrorType.Conflict));
        }

        // Check barcode uniqueness if changed
        if (!string.IsNullOrEmpty(data.Barcode) && variant.Barcode != data.Barcode &&
            await _repository.ExistsWithBarcodeAsync(data.Barcode, request.VariantId, cancellationToken))
        {
            return Result<ProductVariantDto>.Failure(
                new Error("ProductVariant.DuplicateBarcode", $"Variant with barcode '{data.Barcode}' already exists", ErrorType.Conflict));
        }

        variant.UpdateVariant(data.Sku, data.VariantName);
        variant.SetBarcode(data.Barcode);
        variant.SetImage(data.ImageUrl);
        variant.SetInventoryOptions(data.TrackInventory, data.AllowBackorder, data.LowStockThreshold);
        variant.SetDisplayOrder(data.DisplayOrder);

        // Update pricing
        Money? price = data.Price.HasValue ? Money.Create(data.Price.Value, data.PriceCurrency ?? "TRY") : null;
        Money? costPrice = data.CostPrice.HasValue ? Money.Create(data.CostPrice.Value, data.CostPriceCurrency ?? "TRY") : null;
        Money? compareAtPrice = data.CompareAtPrice.HasValue ? Money.Create(data.CompareAtPrice.Value, data.CompareAtPriceCurrency ?? "TRY") : null;
        variant.SetPricing(price, costPrice, compareAtPrice);

        // Update physical properties
        variant.SetPhysicalProperties(data.Weight, data.WeightUnit, data.Dimensions);

        _repository.Update(variant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
                Value = o.Value,
                DisplayOrder = o.DisplayOrder
            }).ToList() ?? new List<ProductVariantOptionDto>(),
            TotalStock = variant.Stocks?.Sum(s => s.Quantity) ?? 0
        };

        return Result<ProductVariantDto>.Success(dto);
    }
}
