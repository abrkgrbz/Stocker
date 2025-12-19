using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockReservations.Commands;

public class FulfillStockReservationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int ReservationId { get; set; }
    public decimal? Quantity { get; set; } // If null, fulfills entire remaining quantity
}

public class FulfillStockReservationCommandValidator : AbstractValidator<FulfillStockReservationCommand>
{
    public FulfillStockReservationCommandValidator()
    {
        RuleFor(x => x.ReservationId).NotEmpty();
        RuleFor(x => x.Quantity).NotEmpty().When(x => x.Quantity.HasValue);
    }
}

public class FulfillStockReservationCommandHandler : IRequestHandler<FulfillStockReservationCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public FulfillStockReservationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(FulfillStockReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.StockReservations.GetByIdAsync(request.ReservationId, cancellationToken);
        if (reservation == null)
        {
            return Result<bool>.Failure(new Error("StockReservation.NotFound", $"Reservation with ID {request.ReservationId} not found", ErrorType.NotFound));
        }

        try
        {
            if (request.Quantity.HasValue)
            {
                reservation.PartialFulfill(request.Quantity.Value);
            }
            else
            {
                reservation.Fulfill();
            }

            await _unitOfWork.StockReservations.UpdateAsync(reservation, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockReservation.InvalidOperation", ex.Message, ErrorType.Validation));
        }
        catch (ArgumentException ex)
        {
            return Result<bool>.Failure(new Error("StockReservation.InvalidArgument", ex.Message, ErrorType.Validation));
        }
    }
}
