using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Commands;

/// <summary>
/// Command to set a warehouse as default
/// </summary>
public class SetDefaultWarehouseCommand : IRequest<Result>
{
    public int TenantId { get; set; }
    public int WarehouseId { get; set; }
}

/// <summary>
/// Handler for SetDefaultWarehouseCommand
/// </summary>
public class SetDefaultWarehouseCommandHandler : IRequestHandler<SetDefaultWarehouseCommand, Result>
{
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SetDefaultWarehouseCommandHandler(
        IWarehouseRepository warehouseRepository,
        IUnitOfWork unitOfWork)
    {
        _warehouseRepository = warehouseRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(SetDefaultWarehouseCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(request.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result.Failure(Error.NotFound("Warehouse", $"Warehouse with ID {request.WarehouseId} not found"));
        }

        if (!warehouse.IsActive)
        {
            return Result.Failure(Error.Validation("Warehouse.Inactive", "Cannot set inactive warehouse as default"));
        }

        // Unset current default warehouse
        var currentDefault = await _warehouseRepository.GetDefaultWarehouseAsync(cancellationToken);
        if (currentDefault != null && currentDefault.Id != request.WarehouseId)
        {
            currentDefault.UnsetDefault();
        }

        // Set new default
        warehouse.SetAsDefault();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
