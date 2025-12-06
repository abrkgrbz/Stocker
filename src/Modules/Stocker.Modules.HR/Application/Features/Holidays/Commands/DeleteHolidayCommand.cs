using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Holidays.Commands;

/// <summary>
/// Command to delete a holiday
/// </summary>
public class DeleteHolidayCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int HolidayId { get; set; }
}

/// <summary>
/// Validator for DeleteHolidayCommand
/// </summary>
public class DeleteHolidayCommandValidator : AbstractValidator<DeleteHolidayCommand>
{
    public DeleteHolidayCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.HolidayId)
            .GreaterThan(0).WithMessage("Holiday ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteHolidayCommand
/// </summary>
public class DeleteHolidayCommandHandler : IRequestHandler<DeleteHolidayCommand, Result<bool>>
{
    private readonly IHolidayRepository _holidayRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteHolidayCommandHandler(
        IHolidayRepository holidayRepository,
        IUnitOfWork unitOfWork)
    {
        _holidayRepository = holidayRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteHolidayCommand request, CancellationToken cancellationToken)
    {
        // Get the existing holiday
        var holiday = await _holidayRepository.GetByIdAsync(request.HolidayId, cancellationToken);
        if (holiday == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Holiday", $"Holiday with ID {request.HolidayId} not found"));
        }

        // Soft delete the holiday
        holiday.Deactivate();
        _holidayRepository.Update(holiday);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
