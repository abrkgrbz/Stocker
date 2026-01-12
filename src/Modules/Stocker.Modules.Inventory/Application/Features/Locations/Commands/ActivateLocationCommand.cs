using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Commands;

public class ActivateLocationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int LocationId { get; set; }
}

public class ActivateLocationCommandHandler : IRequestHandler<ActivateLocationCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivateLocationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(request.LocationId, cancellationToken);
        if (location == null)
        {
            return Result<bool>.Failure(new Error("Location.NotFound", $"Konum bulunamadı (ID: {request.LocationId})", ErrorType.NotFound));
        }

        if (location.IsActive)
        {
            return Result<bool>.Failure(new Error("Location.AlreadyActive", "Konum zaten aktif durumda", ErrorType.Validation));
        }

        // Check if parent warehouse is active
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(location.WarehouseId, cancellationToken);
        if (warehouse != null && !warehouse.IsActive)
        {
            return Result<bool>.Failure(new Error("Location.WarehouseInactive", "Bağlı olduğu depo pasif durumda. Önce depoyu aktifleştirin.", ErrorType.Validation));
        }

        location.Activate();
        await _unitOfWork.Locations.UpdateAsync(location, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
