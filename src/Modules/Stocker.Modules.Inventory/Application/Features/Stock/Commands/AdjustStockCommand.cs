using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Stock.Commands;

/// <summary>
/// Command to adjust stock quantity
/// </summary>
public class AdjustStockCommand : IRequest<Result<StockDto>>
{
    public Guid TenantId { get; set; }
    public StockAdjustmentDto AdjustmentData { get; set; } = null!;
}

/// <summary>
/// Validator for AdjustStockCommand
/// </summary>
public class AdjustStockCommandValidator : AbstractValidator<AdjustStockCommand>
{
    public AdjustStockCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.AdjustmentData)
            .NotNull().WithMessage("Adjustment data is required");

        When(x => x.AdjustmentData != null, () =>
        {
            RuleFor(x => x.AdjustmentData.ProductId)
                .NotEmpty().WithMessage("Product ID is required");

            RuleFor(x => x.AdjustmentData.WarehouseId)
                .NotEmpty().WithMessage("Warehouse ID is required");

            RuleFor(x => x.AdjustmentData.NewQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("New quantity cannot be negative");
        });
    }
}

/// <summary>
/// Handler for AdjustStockCommand
/// </summary>
public class AdjustStockCommandHandler : IRequestHandler<AdjustStockCommand, Result<StockDto>>
{
    private readonly IStockRepository _stockRepository;
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AdjustStockCommandHandler(
        IStockRepository stockRepository,
        IStockMovementRepository stockMovementRepository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository,
        IUnitOfWork unitOfWork)
    {
        _stockRepository = stockRepository;
        _stockMovementRepository = stockMovementRepository;
        _productRepository = productRepository;
        _warehouseRepository = warehouseRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StockDto>> Handle(AdjustStockCommand request, CancellationToken cancellationToken)
    {
        var data = request.AdjustmentData;

        var product = await _productRepository.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<StockDto>.Failure(
                Error.NotFound("Product", $"Product with ID {data.ProductId} not found"));
        }

        var warehouse = await _warehouseRepository.GetByIdAsync(data.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<StockDto>.Failure(
                Error.NotFound("Warehouse", $"Warehouse with ID {data.WarehouseId} not found"));
        }

        var stock = await _stockRepository.GetByProductAndLocationAsync(
            data.ProductId, data.WarehouseId, data.LocationId, cancellationToken);

        decimal previousQuantity = 0;

        if (stock == null)
        {
            stock = new Domain.Entities.Stock(data.ProductId, data.WarehouseId, data.NewQuantity);
            if (data.LocationId.HasValue)
            {
                stock.SetLocation(data.LocationId.Value);
            }
            await _stockRepository.AddAsync(stock, cancellationToken);
        }
        else
        {
            previousQuantity = stock.Quantity;
            stock.AdjustStock(data.NewQuantity);
        }

        // Create stock movement record
        var quantityChange = data.NewQuantity - previousQuantity;
        var movementType = quantityChange >= 0 ? StockMovementType.AdjustmentIncrease : StockMovementType.AdjustmentDecrease;

        var documentNumber = await _stockMovementRepository.GenerateDocumentNumberAsync(
            movementType, cancellationToken);

        var movement = new StockMovement(
            documentNumber,
            DateTime.UtcNow,
            data.ProductId,
            data.WarehouseId,
            movementType,
            Math.Abs(quantityChange),
            0, // unitCost
            0); // userId - should get from context

        movement.SetReference("Adjustment", data.Reason ?? "Manual stock adjustment", null);

        if (!string.IsNullOrEmpty(data.Notes))
        {
            movement.SetDescription(data.Notes);
        }

        await _stockMovementRepository.AddAsync(movement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var stockDto = new StockDto
        {
            Id = stock.Id,
            ProductId = stock.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            WarehouseId = stock.WarehouseId,
            WarehouseName = warehouse.Name,
            LocationId = stock.LocationId,
            Quantity = stock.Quantity,
            ReservedQuantity = stock.ReservedQuantity,
            AvailableQuantity = stock.AvailableQuantity,
            LastMovementDate = stock.LastMovementDate,
            LastCountDate = stock.LastCountDate
        };

        return Result<StockDto>.Success(stockDto);
    }
}
