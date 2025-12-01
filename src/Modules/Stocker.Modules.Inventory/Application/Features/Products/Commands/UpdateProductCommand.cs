using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Application.Features.Products.Commands;

/// <summary>
/// Command to update a product
/// </summary>
public class UpdateProductCommand : IRequest<Result<ProductDto>>
{
    public int TenantId { get; set; }
    public int ProductId { get; set; }
    public UpdateProductDto ProductData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateProductCommand
/// </summary>
public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .GreaterThan(0).WithMessage("Tenant ID is required");

        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("Product ID is required");

        RuleFor(x => x.ProductData)
            .NotNull().WithMessage("Product data is required");

        When(x => x.ProductData != null, () =>
        {
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
        });
    }
}

/// <summary>
/// Handler for UpdateProductCommand
/// </summary>
public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductCommandHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductDto>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<ProductDto>.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        var category = await _categoryRepository.GetByIdAsync(request.ProductData.CategoryId, cancellationToken);
        if (category == null)
        {
            return Result<ProductDto>.Failure(
                Error.NotFound("Category", $"Category with ID {request.ProductData.CategoryId} not found"));
        }

        var unitPrice = Money.Create(
            request.ProductData.UnitPrice ?? 0,
            request.ProductData.UnitPriceCurrency ?? "TRY");

        var costPrice = request.ProductData.CostPrice.HasValue
            ? Money.Create(request.ProductData.CostPrice.Value, request.ProductData.CostPriceCurrency ?? "TRY")
            : null;

        product.UpdateProductInfo(
            request.ProductData.Name,
            request.ProductData.Description,
            unitPrice,
            costPrice,
            18);

        if (!string.IsNullOrEmpty(request.ProductData.Barcode))
        {
            product.SetBarcode(request.ProductData.Barcode);
        }

        product.SetStockLevels(
            request.ProductData.MinStockLevel,
            request.ProductData.MaxStockLevel,
            request.ProductData.ReorderLevel);

        product.SetTrackingOptions(
            true,
            request.ProductData.TrackSerialNumbers,
            request.ProductData.TrackLotNumbers);

        product.SetCategory(request.ProductData.CategoryId);
        product.SetBrand(request.ProductData.BrandId);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
