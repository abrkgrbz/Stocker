using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockReservations.Commands;

public class CancelStockReservationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int ReservationId { get; set; }
    public string? Reason { get; set; }
}

public class CancelStockReservationCommandHandler : IRequestHandler<CancelStockReservationCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CancelStockReservationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CancelStockReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.StockReservations.GetByIdAsync(request.ReservationId, cancellationToken);
        if (reservation == null)
        {
            return Result<bool>.Failure(new Error("StockReservation.NotFound", $"Reservation with ID {request.ReservationId} not found", ErrorType.NotFound));
        }

        try
        {
            reservation.Cancel(request.Reason);
            await _unitOfWork.StockReservations.UpdateAsync(reservation, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockReservation.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
