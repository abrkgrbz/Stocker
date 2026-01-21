using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockMovements.Commands;

public class CreateStockMovementCommand : IRequest<Result<StockMovementDto>>
{
    public Guid TenantId { get; set; }
    public CreateStockMovementDto Data { get; set; } = null!;
}

public class CreateStockMovementCommandValidator : AbstractValidator<CreateStockMovementCommand>
{
    public CreateStockMovementCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.DocumentNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.ProductId).NotEmpty();
        RuleFor(x => x.Data.WarehouseId).NotEmpty();
        RuleFor(x => x.Data.Quantity).NotEmpty();
        RuleFor(x => x.Data.UnitCost).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Data.UserId).NotEmpty();
    }
}

public class CreateStockMovementCommandHandler : IRequestHandler<CreateStockMovementCommand, Result<StockMovementDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateStockMovementCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StockMovementDto>> Handle(CreateStockMovementCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var product = await _unitOfWork.Products.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<StockMovementDto>.Failure(new Error("Product.NotFound", $"Product with ID {data.ProductId} not found", ErrorType.NotFound));
        }

        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<StockMovementDto>.Failure(new Error("Warehouse.NotFound", $"Warehouse with ID {data.WarehouseId} not found", ErrorType.NotFound));
        }

        var movement = new StockMovement(
            data.DocumentNumber,
            data.MovementDate,
            data.ProductId,
            data.WarehouseId,
            data.MovementType,
            data.Quantity,
            data.UnitCost,
            data.UserId);

        movement.SetTenantId(request.TenantId);
        movement.RaiseCreatedEvent();
        movement.SetLocations(data.FromLocationId, data.ToLocationId);

        if (!string.IsNullOrEmpty(data.SerialNumber))
            movement.SetSerialNumber(data.SerialNumber);

        if (!string.IsNullOrEmpty(data.LotNumber))
            movement.SetLotNumber(data.LotNumber);

        if (!string.IsNullOrEmpty(data.ReferenceDocumentType) && !string.IsNullOrEmpty(data.ReferenceDocumentNumber))
            movement.SetReference(data.ReferenceDocumentType, data.ReferenceDocumentNumber, data.ReferenceDocumentId);

        if (!string.IsNullOrEmpty(data.Description))
            movement.SetDescription(data.Description);

        await _unitOfWork.StockMovements.AddAsync(movement, cancellationToken);

        // Update Stock table based on movement type
        var stock = await _unitOfWork.Stocks.GetByProductAndWarehouseAsync(data.ProductId, data.WarehouseId, cancellationToken);
        
        if (stock == null)
        {
            // Create new stock record if it doesn't exist
            stock = new Domain.Entities.Stock(data.ProductId, data.WarehouseId, 0);
            stock.SetTenantId(request.TenantId);
            if (data.ToLocationId.HasValue)
                stock.SetLocation(data.ToLocationId);
            if (!string.IsNullOrEmpty(data.SerialNumber))
                stock.SetSerialNumber(data.SerialNumber);
            if (!string.IsNullOrEmpty(data.LotNumber))
                stock.SetLotNumber(data.LotNumber);
            await _unitOfWork.Stocks.AddAsync(stock, cancellationToken);
        }

        // Determine if this is an incoming or outgoing movement
        var isIncoming = data.MovementType switch
        {
            StockMovementType.Purchase => true,
            StockMovementType.SalesReturn => true,
            StockMovementType.Production => true,
            StockMovementType.Opening => true,
            StockMovementType.AdjustmentIncrease => true,
            StockMovementType.Found => true,
            StockMovementType.Sales => false,
            StockMovementType.PurchaseReturn => false,
            StockMovementType.Consumption => false,
            StockMovementType.AdjustmentDecrease => false,
            StockMovementType.Damage => false,
            StockMovementType.Loss => false,
            StockMovementType.Transfer => false, // Transfer handled separately
            StockMovementType.Counting => true, // Counting adjusts to exact quantity
            _ => throw new ArgumentException($"Unknown movement type: {data.MovementType}")
        };

        if (data.MovementType == StockMovementType.Counting)
        {
            // Counting sets the stock to exact quantity
            stock.AdjustStock(data.Quantity);
        }
        else if (isIncoming)
        {
            stock.IncreaseStock(data.Quantity);
        }
        else
        {
            stock.DecreaseStock(data.Quantity);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<StockMovementDto>.Success(new StockMovementDto
        {
            Id = movement.Id,
            DocumentNumber = movement.DocumentNumber,
            MovementDate = movement.MovementDate,
            ProductId = movement.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            WarehouseId = movement.WarehouseId,
            WarehouseName = warehouse.Name,
            FromLocationId = movement.FromLocationId,
            ToLocationId = movement.ToLocationId,
            MovementType = movement.MovementType,
            Quantity = movement.Quantity,
            UnitCost = movement.UnitCost,
            TotalCost = movement.TotalCost,
            SerialNumber = movement.SerialNumber,
            LotNumber = movement.LotNumber,
            ReferenceDocumentType = movement.ReferenceDocumentType,
            ReferenceDocumentNumber = movement.ReferenceDocumentNumber,
            ReferenceDocumentId = movement.ReferenceDocumentId,
            Description = movement.Description,
            UserId = movement.UserId,
            IsReversed = movement.IsReversed,
            ReversedMovementId = movement.ReversedMovementId,
            CreatedAt = movement.CreatedDate
        });
    }
}
