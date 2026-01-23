using MediatR;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Commands;

public class DeactivateLocationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int LocationId { get; set; }
}

public class DeactivateLocationCommandHandler : IRequestHandler<DeactivateLocationCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivateLocationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(request.LocationId, cancellationToken);
        if (location == null)
        {
            return Result<bool>.Failure(new Error("Location.NotFound", $"Konum bulunamadı (ID: {request.LocationId})", ErrorType.NotFound));
        }

        if (!location.IsActive)
        {
            return Result<bool>.Failure(new Error("Location.AlreadyInactive", "Konum zaten pasif durumda", ErrorType.Validation));
        }

        // Check if location has stock (using repository query instead of navigation property)
        var stocks = await _unitOfWork.Stocks.GetByLocationAsync(request.LocationId, cancellationToken);
        if (stocks.Any(s => s.Quantity > 0))
        {
            return Result<bool>.Failure(new Error("Location.HasStock", "Stoku olan konum pasifleştirilemez. Önce stokları taşıyın veya silin.", ErrorType.Validation));
        }

        // Check for active reservations at this location
        var warehouseReservations = await _unitOfWork.StockReservations.GetByWarehouseAsync(location.WarehouseId, cancellationToken);
        if (warehouseReservations.Any(r => r.LocationId == request.LocationId &&
            (r.Status == ReservationStatus.Active || r.Status == ReservationStatus.PartiallyFulfilled)))
        {
            return Result<bool>.Failure(new Error("Location.HasActiveReservations", "Aktif rezervasyonu olan konum pasifleştirilemez.", ErrorType.Validation));
        }

        // Check for active cycle counts covering this location
        var hasActiveCycleCount = await _unitOfWork.CycleCounts.HasActiveCountForLocationAsync(location.WarehouseId, request.LocationId, cancellationToken);
        if (hasActiveCycleCount)
        {
            return Result<bool>.Failure(new Error("Location.HasActiveCycleCount", "Aktif sayım işlemi olan konum pasifleştirilemez.", ErrorType.Validation));
        }

        location.Deactivate();
        await _unitOfWork.Locations.UpdateAsync(location, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
