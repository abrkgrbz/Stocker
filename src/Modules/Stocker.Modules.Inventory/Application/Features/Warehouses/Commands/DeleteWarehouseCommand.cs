using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Commands;

/// <summary>
/// Command to delete a warehouse
/// </summary>
public class DeleteWarehouseCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int WarehouseId { get; set; }
}

/// <summary>
/// Handler for DeleteWarehouseCommand
/// </summary>
public class DeleteWarehouseCommandHandler : IRequestHandler<DeleteWarehouseCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteWarehouseCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteWarehouseCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(request.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result.Failure(Error.NotFound("Warehouse", $"Depo bulunamadı (ID: {request.WarehouseId})"));
        }

        // Check if warehouse has stock
        var stocks = await _unitOfWork.Stocks.GetByWarehouseAsync(request.WarehouseId, cancellationToken);
        if (stocks.Any(s => s.Quantity > 0))
        {
            return Result.Failure(Error.Validation("Warehouse.HasStock", "Stoku olan depo silinemez. Önce stokları taşıyın veya silin."));
        }

        // Check if it's the default warehouse
        if (warehouse.IsDefault)
        {
            return Result.Failure(Error.Validation("Warehouse.IsDefault", "Varsayılan depo silinemez"));
        }

        await _unitOfWork.Warehouses.RemoveByIdAsync(warehouse.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
