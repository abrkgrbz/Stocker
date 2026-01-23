using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Commands;

/// <summary>
/// Command to deactivate a warehouse
/// </summary>
public class DeactivateWarehouseCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int WarehouseId { get; set; }
}

/// <summary>
/// Handler for DeactivateWarehouseCommand
/// </summary>
public class DeactivateWarehouseCommandHandler : IRequestHandler<DeactivateWarehouseCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivateWarehouseCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeactivateWarehouseCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(request.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result.Failure(Error.NotFound("Warehouse", $"Depo bulunamadı (ID: {request.WarehouseId})"));
        }

        if (!warehouse.IsActive)
        {
            return Result.Failure(Error.Validation("Warehouse.AlreadyInactive", "Depo zaten pasif durumda"));
        }

        // Check if it's the default warehouse
        if (warehouse.IsDefault)
        {
            return Result.Failure(Error.Validation("Warehouse.IsDefault", "Varsayılan depo pasifleştirilemez"));
        }

        // Check if warehouse has active stock
        var stocks = await _unitOfWork.Stocks.GetByWarehouseAsync(request.WarehouseId, cancellationToken);
        if (stocks.Any(s => s.Quantity > 0))
        {
            return Result.Failure(Error.Validation("Warehouse.HasStock", "Stoku olan depo pasifleştirilemez. Önce stokları taşıyın veya silin."));
        }

        // Check for active reservations
        var reservations = await _unitOfWork.StockReservations.GetByWarehouseAsync(request.WarehouseId, cancellationToken);
        if (reservations.Any(r => r.Status == Domain.Enums.ReservationStatus.Active || r.Status == Domain.Enums.ReservationStatus.PartiallyFulfilled))
        {
            return Result.Failure(Error.Validation("Warehouse.HasActiveReservations", "Aktif rezervasyonu olan depo pasifleştirilemez. Önce rezervasyonları iptal edin."));
        }

        // Check for active/pending transfers
        var transfers = await _unitOfWork.StockTransfers.GetByWarehouseAsync(request.WarehouseId, cancellationToken);
        if (transfers.Any(t => t.Status != Domain.Enums.TransferStatus.Completed && t.Status != Domain.Enums.TransferStatus.Cancelled))
        {
            return Result.Failure(Error.Validation("Warehouse.HasActiveTransfers", "Tamamlanmamış transfer emri olan depo pasifleştirilemez."));
        }

        // Check for active cycle counts
        var hasActiveCycleCount = await _unitOfWork.CycleCounts.HasActiveCountForLocationAsync(request.WarehouseId, null, cancellationToken);
        if (hasActiveCycleCount)
        {
            return Result.Failure(Error.Validation("Warehouse.HasActiveCycleCount", "Aktif sayım işlemi olan depo pasifleştirilemez."));
        }

        warehouse.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
