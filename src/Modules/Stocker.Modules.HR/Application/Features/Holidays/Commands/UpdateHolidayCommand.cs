using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Holidays.Commands;

/// <summary>
/// Command to update an existing holiday
/// </summary>
public class UpdateHolidayCommand : IRequest<Result<HolidayDto>>
{
    public Guid TenantId { get; set; }
    public int HolidayId { get; set; }
    public UpdateHolidayDto HolidayData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateHolidayCommand
/// </summary>
public class UpdateHolidayCommandValidator : AbstractValidator<UpdateHolidayCommand>
{
    public UpdateHolidayCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.HolidayId)
            .GreaterThan(0).WithMessage("Holiday ID must be greater than 0");

        RuleFor(x => x.HolidayData)
            .NotNull().WithMessage("Holiday data is required");

        When(x => x.HolidayData != null, () =>
        {
            RuleFor(x => x.HolidayData.Name)
                .NotEmpty().WithMessage("Holiday name is required")
                .MaximumLength(200).WithMessage("Holiday name must not exceed 200 characters");

            RuleFor(x => x.HolidayData.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

            RuleFor(x => x.HolidayData.Date)
                .NotEmpty().WithMessage("Holiday date is required");

            RuleFor(x => x.HolidayData.HolidayType)
                .MaximumLength(50).WithMessage("Holiday type must not exceed 50 characters");

            RuleFor(x => x.HolidayData.AffectedRegions)
                .MaximumLength(200).WithMessage("Affected regions must not exceed 200 characters");
        });
    }
}

/// <summary>
/// Handler for UpdateHolidayCommand
/// </summary>
public class UpdateHolidayCommandHandler : IRequestHandler<UpdateHolidayCommand, Result<HolidayDto>>
{
    private readonly IHolidayRepository _holidayRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateHolidayCommandHandler(
        IHolidayRepository holidayRepository,
        IUnitOfWork unitOfWork)
    {
        _holidayRepository = holidayRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<HolidayDto>> Handle(UpdateHolidayCommand request, CancellationToken cancellationToken)
    {
        // Get the existing holiday
        var holiday = await _holidayRepository.GetByIdAsync(request.HolidayId, cancellationToken);
        if (holiday == null)
        {
            return Result<HolidayDto>.Failure(
                Error.NotFound("Holiday", $"Holiday with ID {request.HolidayId} not found"));
        }

        // Check if the date is being changed and if another holiday exists on the new date
        if (holiday.Date != request.HolidayData.Date)
        {
            var existingHoliday = await _holidayRepository.GetByDateAsync(request.HolidayData.Date, cancellationToken);
            if (existingHoliday != null && existingHoliday.Id != request.HolidayId)
            {
                return Result<HolidayDto>.Failure(
                    Error.Conflict("Holiday.Date", $"A holiday already exists on {request.HolidayData.Date:yyyy-MM-dd}"));
            }
        }

        // Update the holiday
        holiday.Update(
            request.HolidayData.Name,
            request.HolidayData.Date,
            endDate: null,
            request.HolidayData.IsRecurring,
            request.HolidayData.IsHalfDay,
            request.HolidayData.Description);

        // Save changes
        await _holidayRepository.UpdateAsync(holiday, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var holidayDto = new HolidayDto
        {
            Id = holiday.Id,
            Name = holiday.Name,
            Description = holiday.Description,
            Date = holiday.Date,
            Year = holiday.Year,
            IsRecurring = holiday.IsRecurring,
            RecurringMonth = holiday.IsRecurring ? holiday.Date.Month : null,
            RecurringDay = holiday.IsRecurring ? holiday.Date.Day : null,
            HolidayType = request.HolidayData.HolidayType,
            IsHalfDay = holiday.IsHalfDay,
            IsNational = request.HolidayData.IsNational,
            AffectedRegions = request.HolidayData.AffectedRegions,
            IsActive = holiday.IsActive,
            CreatedAt = holiday.CreatedDate
        };

        return Result<HolidayDto>.Success(holidayDto);
    }
}
