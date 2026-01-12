using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Stock.Commands;

/// <summary>
/// Command to move stock between warehouses/locations
/// </summary>
public class MoveStockCommand : IRequest<Result<StockMovementDto>>
{
    public Guid TenantId { get; set; }
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
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.MoveData)
            .NotNull().WithMessage("Transfer bilgileri gereklidir");

        When(x => x.MoveData != null, () =>
        {
            RuleFor(x => x.MoveData.ProductId)
                .NotEmpty().WithMessage("Ürün kimliği gereklidir");

            RuleFor(x => x.MoveData.SourceWarehouseId)
                .NotEmpty().WithMessage("Kaynak depo kimliği gereklidir");

            RuleFor(x => x.MoveData.DestinationWarehouseId)
                .NotEmpty().WithMessage("Hedef depo kimliği gereklidir");

            RuleFor(x => x.MoveData.Quantity)
                .NotEmpty().WithMessage("Miktar sıfırdan büyük olmalıdır");

            RuleFor(x => x)
                .Must(x => !(x.MoveData.SourceWarehouseId == x.MoveData.DestinationWarehouseId
                           && x.MoveData.SourceLocationId == x.MoveData.DestinationLocationId))
                .WithMessage("Kaynak ve hedef farklı olmalıdır");
        });
    }
}

/// <summary>
/// Handler for MoveStockCommand
/// </summary>
public class MoveStockCommandHandler : IRequestHandler<MoveStockCommand, Result<StockMovementDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public MoveStockCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StockMovementDto>> Handle(MoveStockCommand request, CancellationToken cancellationToken)
    {
        var data = request.MoveData;

        // Validate product exists
        var product = await _unitOfWork.Products.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<StockMovementDto>.Failure(
                Error.NotFound("Product", $"Ürün bulunamadı (ID: {data.ProductId})"));
        }

        // Validate source warehouse exists
        var sourceWarehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.SourceWarehouseId, cancellationToken);
        if (sourceWarehouse == null)
        {
            return Result<StockMovementDto>.Failure(
                Error.NotFound("Warehouse", $"Kaynak depo bulunamadı (ID: {data.SourceWarehouseId})"));
        }

        // Validate destination warehouse exists
        var destWarehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.DestinationWarehouseId, cancellationToken);
        if (destWarehouse == null)
        {
            return Result<StockMovementDto>.Failure(
                Error.NotFound("Warehouse", $"Hedef depo bulunamadı (ID: {data.DestinationWarehouseId})"));
        }

        // Get source stock
        var sourceStock = await _unitOfWork.Stocks.GetByProductAndLocationAsync(
            data.ProductId, data.SourceWarehouseId, data.SourceLocationId, cancellationToken);

        if (sourceStock == null || sourceStock.AvailableQuantity < data.Quantity)
        {
            return Result<StockMovementDto>.Failure(
                Error.Validation("Stock.Insufficient", "Kaynak konumda yeterli stok bulunmuyor"));
        }

        // Get or create destination stock
        var destStock = await _unitOfWork.Stocks.GetByProductAndLocationAsync(
            data.ProductId, data.DestinationWarehouseId, data.DestinationLocationId, cancellationToken);

        if (destStock == null)
        {
            destStock = new Domain.Entities.Stock(data.ProductId, data.DestinationWarehouseId, 0);
            destStock.SetTenantId(request.TenantId);
            if (data.DestinationLocationId.HasValue)
            {
                destStock.SetLocation(data.DestinationLocationId.Value);
            }
            await _unitOfWork.Stocks.AddAsync(destStock, cancellationToken);
        }

        // Perform the transfer
        sourceStock.DecreaseStock(data.Quantity);
        destStock.IncreaseStock(data.Quantity);

        // Create stock movement record
        var documentNumber = await _unitOfWork.StockMovements.GenerateDocumentNumberAsync(
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

        movement.SetTenantId(request.TenantId);
        movement.SetLocations(data.SourceLocationId, data.DestinationLocationId);

        if (!string.IsNullOrEmpty(data.Notes))
        {
            movement.SetDescription(data.Notes);
        }

        await _unitOfWork.StockMovements.AddAsync(movement, cancellationToken);
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
