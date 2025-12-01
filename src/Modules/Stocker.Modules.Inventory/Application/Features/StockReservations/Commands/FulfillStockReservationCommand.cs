using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockReservations.Commands;

public class FulfillStockReservationCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int ReservationId { get; set; }
    public decimal? Quantity { get; set; } // If null, fulfills entire remaining quantity
}

public class FulfillStockReservationCommandValidator : AbstractValidator<FulfillStockReservationCommand>
{
    public FulfillStockReservationCommandValidator()
    {
        RuleFor(x => x.ReservationId).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0).When(x => x.Quantity.HasValue);
    }
}

public class FulfillStockReservationCommandHandler : IRequestHandler<FulfillStockReservationCommand, Result<bool>>
{
    private readonly IStockReservationRepository _stockReservationRepository;

    public FulfillStockReservationCommandHandler(IStockReservationRepository stockReservationRepository)
    {
        _stockReservationRepository = stockReservationRepository;
    }

    public async Task<Result<bool>> Handle(FulfillStockReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _stockReservationRepository.GetByIdAsync(request.ReservationId, cancellationToken);
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

            await _stockReservationRepository.UpdateAsync(reservation, cancellationToken);
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
