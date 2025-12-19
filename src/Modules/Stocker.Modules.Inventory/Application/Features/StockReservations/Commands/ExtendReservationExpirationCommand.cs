using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockReservations.Commands;

public class ExtendReservationExpirationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int ReservationId { get; set; }
    public DateTime NewExpirationDate { get; set; }
}

public class ExtendReservationExpirationCommandValidator : AbstractValidator<ExtendReservationExpirationCommand>
{
    public ExtendReservationExpirationCommandValidator()
    {
        RuleFor(x => x.ReservationId).NotEmpty();
        RuleFor(x => x.NewExpirationDate).GreaterThan(DateTime.UtcNow).WithMessage("Expiration date must be in the future");
    }
}

public class ExtendReservationExpirationCommandHandler : IRequestHandler<ExtendReservationExpirationCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ExtendReservationExpirationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ExtendReservationExpirationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.StockReservations.GetByIdAsync(request.ReservationId, cancellationToken);
        if (reservation == null)
        {
            return Result<bool>.Failure(new Error("StockReservation.NotFound", $"Reservation with ID {request.ReservationId} not found", ErrorType.NotFound));
        }

        try
        {
            reservation.ExtendExpiration(request.NewExpirationDate);
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
