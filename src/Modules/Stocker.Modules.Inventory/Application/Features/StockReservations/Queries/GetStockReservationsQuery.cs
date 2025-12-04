using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockReservations.Queries;

/// <summary>
/// Query to get stock reservations
/// </summary>
public class GetStockReservationsQuery : IRequest<Result<List<StockReservationListDto>>>
{
    public Guid TenantId { get; set; }
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public ReservationStatus? Status { get; set; }
    public bool ExpiredOnly { get; set; }
}

/// <summary>
/// Handler for GetStockReservationsQuery
/// </summary>
public class GetStockReservationsQueryHandler : IRequestHandler<GetStockReservationsQuery, Result<List<StockReservationListDto>>>
{
    private readonly IStockReservationRepository _stockReservationRepository;

    public GetStockReservationsQueryHandler(IStockReservationRepository stockReservationRepository)
    {
        _stockReservationRepository = stockReservationRepository;
    }

    public async Task<Result<List<StockReservationListDto>>> Handle(GetStockReservationsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.StockReservation> reservations;

        if (request.ExpiredOnly)
        {
            reservations = await _stockReservationRepository.GetExpiredReservationsAsync(cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            reservations = await _stockReservationRepository.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (request.ProductId.HasValue)
        {
            reservations = await _stockReservationRepository.GetByProductAsync(request.ProductId.Value, cancellationToken);
        }
        else if (request.WarehouseId.HasValue)
        {
            reservations = await _stockReservationRepository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else
        {
            reservations = await _stockReservationRepository.GetAllAsync(cancellationToken);
        }

        var dtos = reservations.Select(r => new StockReservationListDto
        {
            Id = r.Id,
            ReservationNumber = r.ReservationNumber,
            ProductCode = r.Product?.Code ?? string.Empty,
            ProductName = r.Product?.Name ?? string.Empty,
            WarehouseName = r.Warehouse?.Name ?? string.Empty,
            Quantity = r.Quantity,
            FulfilledQuantity = r.FulfilledQuantity,
            Status = r.Status,
            ReservationDate = r.ReservationDate,
            ExpirationDate = r.ExpirationDate
        }).ToList();

        return Result<List<StockReservationListDto>>.Success(dtos);
    }
}
