using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Holidays.Commands;

/// <summary>
/// Command to delete a holiday
/// </summary>
public record DeleteHolidayCommand : IRequest<Result<bool>>
{
    public int HolidayId { get; init; }
}

/// <summary>
/// Validator for DeleteHolidayCommand
/// </summary>
public class DeleteHolidayCommandValidator : AbstractValidator<DeleteHolidayCommand>
{
    public DeleteHolidayCommandValidator()
    {
        RuleFor(x => x.HolidayId)
            .GreaterThan(0).WithMessage("Holiday ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteHolidayCommand
/// </summary>
public class DeleteHolidayCommandHandler : IRequestHandler<DeleteHolidayCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteHolidayCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteHolidayCommand request, CancellationToken cancellationToken)
    {
        // Get the existing holiday
        var holiday = await _unitOfWork.Holidays.GetByIdAsync(request.HolidayId, cancellationToken);
        if (holiday == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Holiday", $"Holiday with ID {request.HolidayId} not found"));
        }

        // Soft delete the holiday
        holiday.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
