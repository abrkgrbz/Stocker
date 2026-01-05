using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Holidays.Commands;

/// <summary>
/// Command to create a new holiday
/// </summary>
public record CreateHolidayCommand : IRequest<Result<HolidayDto>>
{
    public CreateHolidayDto HolidayData { get; init; } = null!;
}

/// <summary>
/// Validator for CreateHolidayCommand
/// </summary>
public class CreateHolidayCommandValidator : AbstractValidator<CreateHolidayCommand>
{
    public CreateHolidayCommandValidator()
    {
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
/// Handler for CreateHolidayCommand
/// </summary>
public class CreateHolidayCommandHandler : IRequestHandler<CreateHolidayCommand, Result<HolidayDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateHolidayCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<HolidayDto>> Handle(CreateHolidayCommand request, CancellationToken cancellationToken)
    {
        // Check if a holiday already exists on the same date
        var existingHoliday = await _unitOfWork.Holidays.GetByDateAsync(request.HolidayData.Date, cancellationToken);
        if (existingHoliday != null)
        {
            return Result<HolidayDto>.Failure(
                Error.Conflict("Holiday.Date", $"A holiday already exists on {request.HolidayData.Date:yyyy-MM-dd}"));
        }

        // Create the holiday
        var holiday = new Holiday(
            request.HolidayData.Name,
            request.HolidayData.Date,
            endDate: null,
            request.HolidayData.IsRecurring,
            request.HolidayData.IsHalfDay,
            request.HolidayData.Description);

        // Set tenant ID
        holiday.SetTenantId(_unitOfWork.TenantId);

        // Save to repository
        await _unitOfWork.Holidays.AddAsync(holiday, cancellationToken);
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
