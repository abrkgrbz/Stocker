using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductVariants.Commands;

/// <summary>
/// Command to create a new product variant
/// </summary>
public class CreateProductVariantCommand : IRequest<Result<ProductVariantDto>>
{
    public Guid TenantId { get; set; }
    public CreateProductVariantDto VariantData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateProductVariantCommand
/// </summary>
public class CreateProductVariantCommandValidator : AbstractValidator<CreateProductVariantCommand>
{
    public CreateProductVariantCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.VariantData).NotNull();
        RuleFor(x => x.VariantData.ProductId).NotEmpty();
        RuleFor(x => x.VariantData.Sku).NotEmpty().MaximumLength(100);
        RuleFor(x => x.VariantData.VariantName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.VariantData.Barcode).MaximumLength(100);
        RuleFor(x => x.VariantData.Dimensions).MaximumLength(100);
        RuleFor(x => x.VariantData.ImageUrl).MaximumLength(500);
        RuleFor(x => x.VariantData.PriceCurrency).MaximumLength(3);
        RuleFor(x => x.VariantData.CostPriceCurrency).MaximumLength(3);
        RuleFor(x => x.VariantData.WeightUnit).MaximumLength(20);
    }
}

/// <summary>
/// Handler for CreateProductVariantCommand
/// </summary>
public class CreateProductVariantCommandHandler : IRequestHandler<CreateProductVariantCommand, Result<ProductVariantDto>>
{
    private readonly IProductVariantRepository _repository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateProductVariantCommandHandler(
        IProductVariantRepository repository,
        IProductRepository productRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductVariantDto>> Handle(CreateProductVariantCommand request, CancellationToken cancellationToken)
    {
        var data = request.VariantData;

        // Verify product exists
        var product = await _productRepository.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<ProductVariantDto>.Failure(
                new Error("Product.NotFound", $"Product with ID {data.ProductId} not found", ErrorType.NotFound));
        }

        // Check if variant with same SKU already exists
        if (await _repository.ExistsWithSkuAsync(data.Sku, null, cancellationToken))
        {
            return Result<ProductVariantDto>.Failure(
                new Error("ProductVariant.DuplicateSku", $"Variant with SKU '{data.Sku}' already exists", ErrorType.Conflict));
        }

        // Check if variant with same barcode already exists
        if (!string.IsNullOrEmpty(data.Barcode) && await _repository.ExistsWithBarcodeAsync(data.Barcode, null, cancellationToken))
        {
            return Result<ProductVariantDto>.Failure(
                new Error("ProductVariant.DuplicateBarcode", $"Variant with barcode '{data.Barcode}' already exists", ErrorType.Conflict));
        }

        // Create the variant
        var variant = new ProductVariant(data.ProductId, data.Sku, data.VariantName);
        variant.SetBarcode(data.Barcode);
        variant.SetImage(data.ImageUrl);
        variant.SetInventoryOptions(data.TrackInventory, data.AllowBackorder, data.LowStockThreshold);
        variant.SetDisplayOrder(data.DisplayOrder);

        // Set pricing if provided
        Money? price = data.Price.HasValue ? Money.Create(data.Price.Value, data.PriceCurrency ?? "TRY") : null;
        Money? costPrice = data.CostPrice.HasValue ? Money.Create(data.CostPrice.Value, data.CostPriceCurrency ?? "TRY") : null;
        Money? compareAtPrice = data.CompareAtPrice.HasValue ? Money.Create(data.CompareAtPrice.Value, data.CompareAtPriceCurrency ?? "TRY") : null;
        variant.SetPricing(price, costPrice, compareAtPrice);

        // Set physical properties
        variant.SetPhysicalProperties(data.Weight, data.WeightUnit, data.Dimensions);

        // Set as default if requested
        if (data.IsDefault)
        {
            // Unset other defaults first
            var existingDefault = await _repository.GetDefaultVariantAsync(data.ProductId, cancellationToken);
            if (existingDefault != null)
            {
                existingDefault.UnsetDefault();
                _repository.Update(existingDefault);
            }
            variant.SetAsDefault();
        }

        await _repository.AddAsync(variant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add options if provided
        if (data.Options != null && data.Options.Any())
        {
            foreach (var optionData in data.Options)
            {
                var option = variant.AddOption(optionData.ProductAttributeId, optionData.ProductAttributeOptionId ?? 0, optionData.Value);
                option.SetDisplayOrder(optionData.DisplayOrder);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var dto = new ProductVariantDto
        {
            Id = variant.Id,
            ProductId = variant.ProductId,
            ProductName = product.Name,
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
            Options = variant.Options?.Select(o => new ProductVariantOptionDto
            {
                Id = o.Id,
                ProductVariantId = o.ProductVariantId,
                ProductAttributeId = o.ProductAttributeId,
                Value = o.Value,
                DisplayOrder = o.DisplayOrder
            }).ToList() ?? new List<ProductVariantOptionDto>(),
            TotalStock = 0
        };

        return Result<ProductVariantDto>.Success(dto);
    }
}
