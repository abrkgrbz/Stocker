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
/// Command to move stock between warehouses/locations
/// </summary>
public class MoveStockCommand : IRequest<Result<StockMovementDto>>
{
    public int TenantId { get; set; }
    public StockMoveDto MoveData { get; set; } = null!;
}

/// <summary>
/// Validator for MoveStockCommand
/// </summary>
public class MoveStockCommandValidator : AbstractValidator<MoveStockCommand>
{
    public MoveStockCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .GreaterThan(0).WithMessage("Tenant ID is required");

        RuleFor(x => x.MoveData)
            .NotNull().WithMessage("Move data is required");

        When(x => x.MoveData != null, () =>
        {
            RuleFor(x => x.MoveData.ProductId)
                .GreaterThan(0).WithMessage("Product ID is required");

            RuleFor(x => x.MoveData.SourceWarehouseId)
                .GreaterThan(0).WithMessage("Source warehouse ID is required");

            RuleFor(x => x.MoveData.DestinationWarehouseId)
                .GreaterThan(0).WithMessage("Destination warehouse ID is required");

            RuleFor(x => x.MoveData.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero");

            RuleFor(x => x)
                .Must(x => !(x.MoveData.SourceWarehouseId == x.MoveData.DestinationWarehouseId
                           && x.MoveData.SourceLocationId == x.MoveData.DestinationLocationId))
                .WithMessage("Source and destination must be different");
        });
    }
}

/// <summary>
/// Handler for MoveStockCommand
/// </summary>
public class MoveStockCommandHandler : IRequestHandler<MoveStockCommand, Result<StockMovementDto>>
{
    private readonly IStockRepository _stockRepository;
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MoveStockCommandHandler(
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

    public async Task<Result<StockMovementDto>> Handle(MoveStockCommand request, CancellationToken cancellationToken)
    {
        var data = request.MoveData;

        // Validate product exists
        var product = await _productRepository.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<StockMovementDto>.Failure(
                Error.NotFound("Product", $"Product with ID {data.ProductId} not found"));
        }

        // Validate source warehouse exists
        var sourceWarehouse = await _warehouseRepository.GetByIdAsync(data.SourceWarehouseId, cancellationToken);
        if (sourceWarehouse == null)
        {
            return Result<StockMovementDto>.Failure(
                Error.NotFound("Warehouse", $"Source warehouse with ID {data.SourceWarehouseId} not found"));
        }

        // Validate destination warehouse exists
        var destWarehouse = await _warehouseRepository.GetByIdAsync(data.DestinationWarehouseId, cancellationToken);
        if (destWarehouse == null)
        {
            return Result<StockMovementDto>.Failure(
                Error.NotFound("Warehouse", $"Destination warehouse with ID {data.DestinationWarehouseId} not found"));
        }

        // Get source stock
        var sourceStock = await _stockRepository.GetByProductAndLocationAsync(
            data.ProductId, data.SourceWarehouseId, data.SourceLocationId, cancellationToken);

        if (sourceStock == null || sourceStock.AvailableQuantity < data.Quantity)
        {
            return Result<StockMovementDto>.Failure(
                Error.Validation("Stock.Insufficient", "Insufficient available stock at source location"));
        }

        // Get or create destination stock
        var destStock = await _stockRepository.GetByProductAndLocationAsync(
            data.ProductId, data.DestinationWarehouseId, data.DestinationLocationId, cancellationToken);

        if (destStock == null)
        {
            destStock = new Domain.Entities.Stock(data.ProductId, data.DestinationWarehouseId, 0);
            if (data.DestinationLocationId.HasValue)
            {
                destStock.SetLocation(data.DestinationLocationId.Value);
            }
            await _stockRepository.AddAsync(destStock, cancellationToken);
        }

        // Perform the transfer
        sourceStock.DecreaseStock(data.Quantity);
        destStock.IncreaseStock(data.Quantity);

        // Create stock movement record
        var documentNumber = await _stockMovementRepository.GenerateDocumentNumberAsync(
            StockMovementType.Transfer, cancellationToken);

        var movement = new StockMovement(
            documentNumber,
            DateTime.UtcNow,
            data.ProductId,
            data.SourceWarehouseId,
            StockMovementType.Transfer,
            data.Quantity,
            0, // unitCost
            0); // userId - should get from context

        movement.SetLocations(data.SourceLocationId, data.DestinationLocationId);

        if (!string.IsNullOrEmpty(data.Notes))
        {
            movement.SetDescription(data.Notes);
        }

        await _stockMovementRepository.AddAsync(movement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Return DTO
        var movementDto = new StockMovementDto
        {
            Id = movement.Id,
            DocumentNumber = movement.DocumentNumber,
            ProductId = movement.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            WarehouseId = movement.WarehouseId,
            WarehouseName = sourceWarehouse.Name,
            FromLocationId = movement.FromLocationId,
            ToLocationId = movement.ToLocationId,
            MovementType = movement.MovementType,
            Quantity = movement.Quantity,
            Description = movement.Description,
            MovementDate = movement.MovementDate,
            CreatedAt = movement.CreatedDate
        };

        return Result<StockMovementDto>.Success(movementDto);
    }
}
