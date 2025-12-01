using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockMovements.Queries;

/// <summary>
/// Query to get stock movements
/// </summary>
public class GetStockMovementsQuery : IRequest<Result<List<StockMovementListDto>>>
{
    public int TenantId { get; set; }
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public StockMovementType? MovementType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Handler for GetStockMovementsQuery
/// </summary>
public class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, Result<List<StockMovementListDto>>>
{
    private readonly IStockMovementRepository _stockMovementRepository;

    public GetStockMovementsQueryHandler(IStockMovementRepository stockMovementRepository)
    {
        _stockMovementRepository = stockMovementRepository;
    }

    public async Task<Result<List<StockMovementListDto>>> Handle(GetStockMovementsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.StockMovement> movements;

        if (request.FromDate.HasValue && request.ToDate.HasValue)
        {
            movements = await _stockMovementRepository.GetByDateRangeAsync(request.FromDate.Value, request.ToDate.Value, cancellationToken);
        }
        else if (request.MovementType.HasValue)
        {
            movements = await _stockMovementRepository.GetByTypeAsync(request.MovementType.Value, cancellationToken);
        }
        else if (request.ProductId.HasValue)
        {
            movements = await _stockMovementRepository.GetByProductAsync(request.ProductId.Value, cancellationToken);
        }
        else if (request.WarehouseId.HasValue)
        {
            movements = await _stockMovementRepository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else
        {
            movements = await _stockMovementRepository.GetAllAsync(cancellationToken);
        }

        var dtos = movements.Select(m => new StockMovementListDto
        {
            Id = m.Id,
            DocumentNumber = m.DocumentNumber,
            ProductCode = m.Product?.Code ?? string.Empty,
            ProductName = m.Product?.Name ?? string.Empty,
            WarehouseName = m.Warehouse?.Name ?? string.Empty,
            MovementType = m.MovementType,
            Quantity = m.Quantity,
            MovementDate = m.MovementDate
        }).ToList();

        return Result<List<StockMovementListDto>>.Success(dtos);
    }
}
