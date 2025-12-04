using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
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
    private readonly IStockReservationRepository _stockReservationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelStockReservationCommandHandler(IStockReservationRepository stockReservationRepository, IUnitOfWork unitOfWork)
    {
        _stockReservationRepository = stockReservationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CancelStockReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _stockReservationRepository.GetByIdAsync(request.ReservationId, cancellationToken);
        if (reservation == null)
        {
            return Result<bool>.Failure(new Error("StockReservation.NotFound", $"Reservation with ID {request.ReservationId} not found", ErrorType.NotFound));
        }

        try
        {
            reservation.Cancel(request.Reason);
            await _stockReservationRepository.UpdateAsync(reservation, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockReservation.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
