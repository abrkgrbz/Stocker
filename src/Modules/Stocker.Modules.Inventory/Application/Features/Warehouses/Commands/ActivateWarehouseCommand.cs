using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Commands;

/// <summary>
/// Command to activate a warehouse
/// </summary>
public class ActivateWarehouseCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int WarehouseId { get; set; }
}

/// <summary>
/// Handler for ActivateWarehouseCommand
/// </summary>
public class ActivateWarehouseCommandHandler : IRequestHandler<ActivateWarehouseCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivateWarehouseCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ActivateWarehouseCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(request.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result.Failure(Error.NotFound("Warehouse", $"Depo bulunamadı (ID: {request.WarehouseId})"));
        }

        if (warehouse.IsActive)
        {
            return Result.Failure(Error.Validation("Warehouse.AlreadyActive", "Depo zaten aktif durumda"));
        }

        warehouse.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
