using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Stock.Queries;

/// <summary>
/// Query to get stock movements
/// </summary>
public class GetStockMovementsQuery : IRequest<Result<List<StockMovementDto>>>
{
    public int TenantId { get; set; }
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public StockMovementType? MovementType { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? Take { get; set; } = 100;
}

/// <summary>
/// Handler for GetStockMovementsQuery
/// </summary>
public class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, Result<List<StockMovementDto>>>
{
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;

    public GetStockMovementsQueryHandler(
        IStockMovementRepository stockMovementRepository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository)
    {
        _stockMovementRepository = stockMovementRepository;
        _productRepository = productRepository;
        _warehouseRepository = warehouseRepository;
    }

    public async Task<Result<List<StockMovementDto>>> Handle(GetStockMovementsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.StockMovement> movements;

        if (request.ProductId.HasValue)
        {
            movements = await _stockMovementRepository.GetByProductAsync(request.ProductId.Value, cancellationToken);
        }
        else if (request.WarehouseId.HasValue)
        {
            movements = await _stockMovementRepository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            movements = await _stockMovementRepository.GetByDateRangeAsync(
                request.StartDate.Value, request.EndDate.Value, cancellationToken);
        }
        else
        {
            movements = await _stockMovementRepository.GetAllAsync(cancellationToken);
        }

        if (request.MovementType.HasValue)
        {
            movements = movements.Where(m => m.MovementType == request.MovementType.Value).ToList();
        }

        // Order by date descending and take limit
        movements = movements
            .OrderByDescending(m => m.MovementDate)
            .Take(request.Take ?? 100)
            .ToList();

        var movementDtos = new List<StockMovementDto>();

        foreach (var movement in movements)
        {
            var product = await _productRepository.GetByIdAsync(movement.ProductId, cancellationToken);
            var warehouse = await _warehouseRepository.GetByIdAsync(movement.WarehouseId, cancellationToken);

            movementDtos.Add(new StockMovementDto
            {
                Id = movement.Id,
                DocumentNumber = movement.DocumentNumber,
                ProductId = movement.ProductId,
                ProductCode = product?.Code ?? string.Empty,
                ProductName = product?.Name ?? string.Empty,
                WarehouseId = movement.WarehouseId,
                WarehouseName = warehouse?.Name ?? string.Empty,
                FromLocationId = movement.FromLocationId,
                ToLocationId = movement.ToLocationId,
                MovementType = movement.MovementType,
                Quantity = movement.Quantity,
                Description = movement.Description,
                MovementDate = movement.MovementDate,
                CreatedAt = movement.CreatedDate
            });
        }

        return Result<List<StockMovementDto>>.Success(movementDtos);
    }
}
