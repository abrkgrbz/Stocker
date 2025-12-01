using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Application.Features.Products.Commands;

/// <summary>
/// Command to create a new product
/// </summary>
public class CreateProductCommand : IRequest<Result<ProductDto>>
{
    public int TenantId { get; set; }
    public CreateProductDto ProductData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateProductCommand
/// </summary>
public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .GreaterThan(0).WithMessage("Tenant ID is required");

        RuleFor(x => x.ProductData)
            .NotNull().WithMessage("Product data is required");

        When(x => x.ProductData != null, () =>
        {
            RuleFor(x => x.ProductData.Code)
                .NotEmpty().WithMessage("Product code is required")
                .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

            RuleFor(x => x.ProductData.Name)
                .NotEmpty().WithMessage("Product name is required")
                .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

            RuleFor(x => x.ProductData.CategoryId)
                .GreaterThan(0).WithMessage("Category is required");

            RuleFor(x => x.ProductData.UnitPrice)
                .GreaterThanOrEqualTo(0).When(x => x.ProductData.UnitPrice.HasValue)
                .WithMessage("Unit price cannot be negative");

            RuleFor(x => x.ProductData.MinStockLevel)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum stock level cannot be negative");

            RuleFor(x => x.ProductData.Barcode)
                .MaximumLength(50).WithMessage("Barcode must not exceed 50 characters");
        });
    }
}

/// <summary>
/// Handler for CreateProductCommand
/// </summary>
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateProductCommandHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // Check if product with same code already exists
        var existingProduct = await _productRepository.GetByCodeAsync(request.ProductData.Code, cancellationToken);
        if (existingProduct != null)
        {
            return Result<ProductDto>.Failure(
                Error.Conflict("Product.Code", "A product with this code already exists"));
        }

        // Check if category exists
        var category = await _categoryRepository.GetByIdAsync(request.ProductData.CategoryId, cancellationToken);
        if (category == null)
        {
            return Result<ProductDto>.Failure(
                Error.NotFound("Category", $"Category with ID {request.ProductData.CategoryId} not found"));
        }

        // Create the product
        var unitPrice = Money.Create(
            request.ProductData.UnitPrice ?? 0,
            request.ProductData.UnitPriceCurrency ?? "TRY");

        var product = new Product(
            request.ProductData.Code,
            request.ProductData.Name,
            request.ProductData.CategoryId,
            "PCS", // Default unit
            unitPrice);

        // Set additional properties
        if (!string.IsNullOrEmpty(request.ProductData.Description) || request.ProductData.CostPrice.HasValue)
        {
            var costPrice = request.ProductData.CostPrice.HasValue
                ? Money.Create(request.ProductData.CostPrice.Value, request.ProductData.CostPriceCurrency ?? "TRY")
                : null;

            product.UpdateProductInfo(
                request.ProductData.Name,
                request.ProductData.Description,
                unitPrice,
                costPrice,
                18); // Default VAT rate
        }

        if (!string.IsNullOrEmpty(request.ProductData.Barcode))
        {
            product.SetBarcode(request.ProductData.Barcode);
        }

        product.SetStockLevels(
            request.ProductData.MinStockLevel,
            request.ProductData.MaxStockLevel,
            request.ProductData.ReorderLevel);

        product.SetTrackingOptions(
            true, // IsStockTracked
            request.ProductData.TrackSerialNumbers,
            request.ProductData.TrackLotNumbers);

        if (request.ProductData.BrandId.HasValue)
        {
            product.SetBrand(request.ProductData.BrandId.Value);
        }

        // Save to repository
        await _productRepository.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var productDto = new ProductDto
        {
            Id = product.Id,
            Code = product.Code,
            Name = product.Name,
            Description = product.Description,
            Barcode = product.Barcode,
            CategoryId = product.CategoryId,
            CategoryName = category.Name,
            BrandId = product.BrandId,
            UnitPrice = product.UnitPrice?.Amount,
            UnitPriceCurrency = product.UnitPrice?.Currency,
            CostPrice = product.CostPrice?.Amount,
            CostPriceCurrency = product.CostPrice?.Currency,
            MinStockLevel = product.MinimumStock,
            MaxStockLevel = product.MaximumStock,
            ReorderLevel = product.ReorderPoint,
            TrackSerialNumbers = product.IsSerialTracked,
            TrackLotNumbers = product.IsLotTracked,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedDate,
            UpdatedAt = product.UpdatedDate
        };

        return Result<ProductDto>.Success(productDto);
    }
}
