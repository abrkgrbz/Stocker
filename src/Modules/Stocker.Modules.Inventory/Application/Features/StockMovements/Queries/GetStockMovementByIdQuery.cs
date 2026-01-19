using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockMovements.Queries;

/// <summary>
/// Query to get a stock movement by ID
/// </summary>
public class GetStockMovementByIdQuery : IRequest<Result<StockMovementDto>>
{
    public Guid TenantId { get; set; }
    public int MovementId { get; set; }
}

/// <summary>
/// Handler for GetStockMovementByIdQuery
/// </summary>
public class GetStockMovementByIdQueryHandler : IRequestHandler<GetStockMovementByIdQuery, Result<StockMovementDto>>
{
    private readonly IStockMovementRepository _stockMovementRepository;

    public GetStockMovementByIdQueryHandler(IStockMovementRepository stockMovementRepository)
    {
        _stockMovementRepository = stockMovementRepository;
    }

    public async Task<Result<StockMovementDto>> Handle(GetStockMovementByIdQuery request, CancellationToken cancellationToken)
    {
        var movement = await _stockMovementRepository.GetWithDetailsAsync(request.MovementId, cancellationToken);

        if (movement == null)
        {
            return Result<StockMovementDto>.Failure(new Error("StockMovement.NotFound", $"Stock movement with ID {request.MovementId} not found", ErrorType.NotFound));
        }

        var dto = new StockMovementDto
        {
            Id = movement.Id,
            DocumentNumber = movement.DocumentNumber,
            ProductId = movement.ProductId,
            ProductCode = movement.Product?.Code ?? string.Empty,
            ProductName = movement.Product?.Name ?? string.Empty,
            WarehouseId = movement.WarehouseId,
            WarehouseName = movement.Warehouse?.Name ?? string.Empty,
            FromLocationId = movement.FromLocationId,
            FromLocationName = movement.FromLocation?.Name,
            ToLocationId = movement.ToLocationId,
            ToLocationName = movement.ToLocation?.Name,
            MovementType = movement.MovementType,
            Quantity = movement.Quantity,
            UnitCost = movement.UnitCost,
            TotalCost = movement.TotalCost,
            ReferenceDocumentType = movement.ReferenceDocumentType,
            ReferenceDocumentNumber = movement.ReferenceDocumentNumber,
            ReferenceDocumentId = movement.ReferenceDocumentId,
            SerialNumber = movement.SerialNumber,
            LotNumber = movement.LotNumber,
            Description = movement.Description,
            UserId = movement.UserId,
            IsReversed = movement.IsReversed,
            ReversedMovementId = movement.ReversedMovementId,
            MovementDate = movement.MovementDate,
            CreatedAt = movement.CreatedDate
        };

        return Result<StockMovementDto>.Success(dto);
    }
}
