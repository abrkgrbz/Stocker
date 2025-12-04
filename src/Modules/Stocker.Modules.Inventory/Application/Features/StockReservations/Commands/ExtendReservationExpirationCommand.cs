using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockReservations.Commands;

public class ExtendReservationExpirationCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int ReservationId { get; set; }
    public DateTime NewExpirationDate { get; set; }
}

public class ExtendReservationExpirationCommandValidator : AbstractValidator<ExtendReservationExpirationCommand>
{
    public ExtendReservationExpirationCommandValidator()
    {
        RuleFor(x => x.ReservationId).GreaterThan(0);
        RuleFor(x => x.NewExpirationDate).GreaterThan(DateTime.UtcNow).WithMessage("Expiration date must be in the future");
    }
}

public class ExtendReservationExpirationCommandHandler : IRequestHandler<ExtendReservationExpirationCommand, Result<bool>>
{
    private readonly IStockReservationRepository _stockReservationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ExtendReservationExpirationCommandHandler(IStockReservationRepository stockReservationRepository, IUnitOfWork unitOfWork)
    {
        _stockReservationRepository = stockReservationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ExtendReservationExpirationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _stockReservationRepository.GetByIdAsync(request.ReservationId, cancellationToken);
        if (reservation == null)
        {
            return Result<bool>.Failure(new Error("StockReservation.NotFound", $"Reservation with ID {request.ReservationId} not found", ErrorType.NotFound));
        }

        try
        {
            reservation.ExtendExpiration(request.NewExpirationDate);
            await _stockReservationRepository.UpdateAsync(reservation, cancellationToken);
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
