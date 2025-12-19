using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Application.Features.Products.Commands;

/// <summary>
/// Command to create a new product
/// </summary>
public class CreateProductCommand : IRequest<Result<ProductDto>>
{
    public Guid TenantId { get; set; }
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
            .NotEmpty().WithMessage("Tenant ID is required");

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
                .NotEmpty().WithMessage("Category is required");

            RuleFor(x => x.ProductData.UnitId)
                .NotEmpty().WithMessage("Unit is required");

            RuleFor(x => x.ProductData.UnitPrice)
                .GreaterThanOrEqualTo(0).When(x => x.ProductData.UnitPrice.HasValue)
                .WithMessage("Unit price cannot be negative");

            RuleFor(x => x.ProductData.CostPrice)
                .GreaterThanOrEqualTo(0).When(x => x.ProductData.CostPrice.HasValue)
                .WithMessage("Cost price cannot be negative");

            RuleFor(x => x.ProductData.MinStockLevel)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum stock level cannot be negative");

            RuleFor(x => x.ProductData.ReorderQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("Reorder quantity cannot be negative");

            RuleFor(x => x.ProductData.LeadTimeDays)
                .GreaterThanOrEqualTo(0).WithMessage("Lead time cannot be negative");

            RuleFor(x => x.ProductData.Barcode)
                .MaximumLength(50).WithMessage("Barcode must not exceed 50 characters");

            RuleFor(x => x.ProductData.SKU)
                .MaximumLength(100).WithMessage("SKU must not exceed 100 characters");
        });
    }
}

/// <summary>
/// Handler for CreateProductCommand
/// Uses IInventoryUnitOfWork to ensure repository and SaveChanges use the same DbContext instance
/// </summary>
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateProductCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var data = request.ProductData;

        // Check if product with same code already exists
        var existingProduct = await _unitOfWork.Products.GetByCodeAsync(data.Code, cancellationToken);
        if (existingProduct != null)
        {
            return Result<ProductDto>.Failure(
                Error.Conflict("Product.Code", "A product with this code already exists"));
        }

        // Check if SKU is unique (if provided)
        if (!string.IsNullOrEmpty(data.SKU))
        {
            var existingBySku = await _unitOfWork.Products.GetBySkuAsync(data.SKU, cancellationToken);
            if (existingBySku != null)
            {
                return Result<ProductDto>.Failure(
                    Error.Conflict("Product.SKU", "A product with this SKU already exists"));
            }
        }

        // Check if category exists
        var category = await _unitOfWork.Categories.GetByIdAsync(data.CategoryId, cancellationToken);
        if (category == null)
        {
            return Result<ProductDto>.Failure(
                Error.NotFound("Category", $"Category with ID {data.CategoryId} not found"));
        }

        // Check if unit exists
        var unit = await _unitOfWork.Units.GetByIdAsync(data.UnitId, cancellationToken);
        if (unit == null)
        {
            return Result<ProductDto>.Failure(
                Error.NotFound("Unit", $"Unit with ID {data.UnitId} not found"));
        }

        // Check if brand exists (if provided)
        Domain.Entities.Brand? brand = null;
        if (data.BrandId.HasValue)
        {
            brand = await _unitOfWork.Brands.GetByIdAsync(data.BrandId.Value, cancellationToken);
            if (brand == null)
            {
                return Result<ProductDto>.Failure(
                    Error.NotFound("Brand", $"Brand with ID {data.BrandId} not found"));
            }
        }

        // Create the product with all fields
        var unitPrice = Money.Create(
            data.UnitPrice ?? 0,
            data.UnitPriceCurrency ?? "TRY");

        var product = new Product(
            data.Code,
            data.Name,
            data.CategoryId,
            unit.Code, // Use unit code as the Unit string
            unitPrice,
            18, // Default VAT rate
            data.SKU,
            data.ProductType,
            data.UnitId,
            data.ReorderQuantity,
            data.LeadTimeDays);

        // Set cost price and description
        var costPrice = data.CostPrice.HasValue
            ? Money.Create(data.CostPrice.Value, data.CostPriceCurrency ?? "TRY")
            : null;

        product.UpdateProductInfo(
            data.Name,
            data.Description,
            unitPrice,
            costPrice,
            18); // Default VAT rate

        // Set barcode
        if (!string.IsNullOrEmpty(data.Barcode))
        {
            product.SetBarcode(data.Barcode);
        }

        // Set stock levels
        product.SetStockLevels(
            data.MinStockLevel,
            data.MaxStockLevel,
            data.ReorderLevel);

        // Set tracking options
        product.SetTrackingOptions(
            true, // IsStockTracked
            data.TrackSerialNumbers,
            data.TrackLotNumbers);

        // Set brand
        if (data.BrandId.HasValue)
        {
            product.SetBrand(data.BrandId.Value);
        }

        // Set physical properties
        product.SetPhysicalProperties(
            data.Weight,
            data.WeightUnit,
            data.Length,
            data.Width,
            data.Height,
            data.DimensionUnit);

        // Save to repository
        await _unitOfWork.Products.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Create initial stock entries if provided
        if (data.InitialStock != null && data.InitialStock.Count > 0)
        {
            foreach (var stockEntry in data.InitialStock)
            {
                if (stockEntry.Quantity <= 0) continue;

                // Verify warehouse exists
                var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(stockEntry.WarehouseId, cancellationToken);
                if (warehouse == null) continue;

                // Create stock record
                var stock = new Domain.Entities.Stock(product.Id, stockEntry.WarehouseId, stockEntry.Quantity);
                if (stockEntry.LocationId.HasValue)
                {
                    stock.SetLocation(stockEntry.LocationId.Value);
                }
                await _unitOfWork.Stocks.AddAsync(stock, cancellationToken);

                // Create stock movement record for audit trail
                var documentNumber = await _unitOfWork.StockMovements.GenerateDocumentNumberAsync(
                    StockMovementType.AdjustmentIncrease, cancellationToken);

                var movement = new StockMovement(
                    documentNumber,
                    DateTime.UtcNow,
                    product.Id,
                    stockEntry.WarehouseId,
                    StockMovementType.AdjustmentIncrease,
                    stockEntry.Quantity,
                    product.CostPrice?.Amount ?? 0,
                    0); // userId - should get from context

                movement.SetReference("InitialStock", "Initial stock entry on product creation", null);
                await _unitOfWork.StockMovements.AddAsync(movement, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // Map to DTO
        var productDto = new ProductDto
        {
            Id = product.Id,
            Code = product.Code,
            Name = product.Name,
            Description = product.Description,
            Barcode = product.Barcode,
            SKU = product.SKU,
            ProductType = product.ProductType,
            CategoryId = product.CategoryId,
            CategoryName = category.Name,
            BrandId = product.BrandId,
            BrandName = brand?.Name,
            UnitId = product.UnitId ?? data.UnitId,
            UnitName = unit.Name,
            UnitSymbol = unit.Symbol,
            UnitPrice = product.UnitPrice?.Amount,
            UnitPriceCurrency = product.UnitPrice?.Currency,
            CostPrice = product.CostPrice?.Amount,
            CostPriceCurrency = product.CostPrice?.Currency,
            Weight = product.Weight,
            WeightUnit = product.WeightUnit,
            Length = product.Length,
            Width = product.Width,
            Height = product.Height,
            DimensionUnit = product.DimensionUnit,
            MinStockLevel = product.MinimumStock,
            MaxStockLevel = product.MaximumStock,
            ReorderLevel = product.ReorderPoint,
            ReorderQuantity = product.ReorderQuantity,
            LeadTimeDays = product.LeadTimeDays,
            TrackSerialNumbers = product.IsSerialTracked,
            TrackLotNumbers = product.IsLotTracked,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedDate,
            UpdatedAt = product.UpdatedDate
        };

        return Result<ProductDto>.Success(productDto);
    }
}
