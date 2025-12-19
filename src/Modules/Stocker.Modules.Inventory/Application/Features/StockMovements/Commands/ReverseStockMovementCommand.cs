using MediatR;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockMovements.Commands;

public class ReverseStockMovementCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; set; }
    public int MovementId { get; set; }
    public int UserId { get; set; }
    public string? Description { get; set; }
}

public class ReverseStockMovementCommandHandler : IRequestHandler<ReverseStockMovementCommand, Result<int>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ReverseStockMovementCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(ReverseStockMovementCommand request, CancellationToken cancellationToken)
    {
        var movement = await _unitOfWork.StockMovements.GetByIdAsync(request.MovementId, cancellationToken);
        if (movement == null)
        {
            return Result<int>.Failure(new Error("StockMovement.NotFound", $"Stock movement with ID {request.MovementId} not found", ErrorType.NotFound));
        }

        if (movement.IsReversed)
        {
            return Result<int>.Failure(new Error("StockMovement.AlreadyReversed", "This movement has already been reversed", ErrorType.Validation));
        }

        // Create reversal movement with opposite quantity effect
        var reversalType = GetReversalType(movement.MovementType);
        var reversalMovement = new StockMovement(
            $"REV-{movement.DocumentNumber}",
            DateTime.UtcNow,
            movement.ProductId,
            movement.WarehouseId,
            reversalType,
            movement.Quantity,
            movement.UnitCost,
            request.UserId);

        reversalMovement.SetTenantId(request.TenantId);
        reversalMovement.SetLocations(movement.ToLocationId, movement.FromLocationId); // Swap locations
        reversalMovement.SetReference("Reversal", movement.DocumentNumber, movement.Id);

        if (!string.IsNullOrEmpty(request.Description))
            reversalMovement.SetDescription(request.Description);
        else
            reversalMovement.SetDescription($"Reversal of movement {movement.DocumentNumber}");

        await _unitOfWork.StockMovements.AddAsync(reversalMovement, cancellationToken);

        // Mark original movement as reversed
        movement.Reverse(reversalMovement.Id);
        await _unitOfWork.StockMovements.UpdateAsync(movement, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(reversalMovement.Id);
    }

    private static Domain.Enums.StockMovementType GetReversalType(Domain.Enums.StockMovementType originalType)
    {
        return originalType switch
        {
            Domain.Enums.StockMovementType.Purchase => Domain.Enums.StockMovementType.PurchaseReturn,
            Domain.Enums.StockMovementType.PurchaseReturn => Domain.Enums.StockMovementType.Purchase,
            Domain.Enums.StockMovementType.Sales => Domain.Enums.StockMovementType.SalesReturn,
            Domain.Enums.StockMovementType.SalesReturn => Domain.Enums.StockMovementType.Sales,
            Domain.Enums.StockMovementType.AdjustmentIncrease => Domain.Enums.StockMovementType.AdjustmentDecrease,
            Domain.Enums.StockMovementType.AdjustmentDecrease => Domain.Enums.StockMovementType.AdjustmentIncrease,
            _ => Domain.Enums.StockMovementType.AdjustmentDecrease // Default reversal for other types
        };
    }
}
