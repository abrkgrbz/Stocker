using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
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
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteWarehouseCommandHandler(
        IWarehouseRepository warehouseRepository,
        IStockRepository stockRepository,
        IUnitOfWork unitOfWork)
    {
        _warehouseRepository = warehouseRepository;
        _stockRepository = stockRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteWarehouseCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(request.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result.Failure(Error.NotFound("Warehouse", $"Warehouse with ID {request.WarehouseId} not found"));
        }

        // Check if warehouse has stock
        var stocks = await _stockRepository.GetByWarehouseAsync(request.WarehouseId, cancellationToken);
        if (stocks.Any(s => s.Quantity > 0))
        {
            return Result.Failure(Error.Validation("Warehouse.HasStock", "Cannot delete warehouse with existing stock"));
        }

        // Check if it's the default warehouse
        if (warehouse.IsDefault)
        {
            return Result.Failure(Error.Validation("Warehouse.IsDefault", "Cannot delete the default warehouse"));
        }

        await _warehouseRepository.RemoveByIdAsync(warehouse.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
