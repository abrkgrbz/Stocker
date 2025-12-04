using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockReservations.Queries;

/// <summary>
/// Query to get a stock reservation by ID
/// </summary>
public class GetStockReservationByIdQuery : IRequest<Result<StockReservationDto>>
{
    public Guid TenantId { get; set; }
    public int ReservationId { get; set; }
}

/// <summary>
/// Handler for GetStockReservationByIdQuery
/// </summary>
public class GetStockReservationByIdQueryHandler : IRequestHandler<GetStockReservationByIdQuery, Result<StockReservationDto>>
{
    private readonly IStockReservationRepository _stockReservationRepository;

    public GetStockReservationByIdQueryHandler(IStockReservationRepository stockReservationRepository)
    {
        _stockReservationRepository = stockReservationRepository;
    }

    public async Task<Result<StockReservationDto>> Handle(GetStockReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var reservation = await _stockReservationRepository.GetByIdAsync(request.ReservationId, cancellationToken);

        if (reservation == null)
        {
            return Result<StockReservationDto>.Failure(new Error("StockReservation.NotFound", $"Stock reservation with ID {request.ReservationId} not found", ErrorType.NotFound));
        }

        var dto = new StockReservationDto
        {
            Id = reservation.Id,
            ReservationNumber = reservation.ReservationNumber,
            ProductId = reservation.ProductId,
            ProductCode = reservation.Product?.Code ?? string.Empty,
            ProductName = reservation.Product?.Name ?? string.Empty,
            WarehouseId = reservation.WarehouseId,
            WarehouseName = reservation.Warehouse?.Name ?? string.Empty,
            LocationId = reservation.LocationId,
            LocationName = reservation.Location?.Name,
            Quantity = reservation.Quantity,
            FulfilledQuantity = reservation.FulfilledQuantity,
            RemainingQuantity = reservation.RemainingQuantity,
            Status = reservation.Status,
            ReservationType = reservation.ReservationType,
            ReferenceDocumentType = reservation.ReferenceDocumentType,
            ReferenceDocumentNumber = reservation.ReferenceDocumentNumber,
            ReferenceDocumentId = reservation.ReferenceDocumentId,
            ReservationDate = reservation.ReservationDate,
            ExpirationDate = reservation.ExpirationDate,
            Notes = reservation.Notes,
            CreatedByUserId = reservation.CreatedByUserId,
            CreatedAt = reservation.CreatedDate
        };

        return Result<StockReservationDto>.Success(dto);
    }
}
