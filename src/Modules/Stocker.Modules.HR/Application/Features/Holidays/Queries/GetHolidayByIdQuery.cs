using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Holidays.Queries;

/// <summary>
/// Query to get a single holiday by ID
/// </summary>
public record GetHolidayByIdQuery(int HolidayId) : IRequest<Result<HolidayDto>>;

/// <summary>
/// Validator for GetHolidayByIdQuery
/// </summary>
public class GetHolidayByIdQueryValidator : AbstractValidator<GetHolidayByIdQuery>
{
    public GetHolidayByIdQueryValidator()
    {
        RuleFor(x => x.HolidayId)
            .GreaterThan(0).WithMessage("Holiday ID must be greater than 0");
    }
}

/// <summary>
/// Handler for GetHolidayByIdQuery
/// </summary>
public class GetHolidayByIdQueryHandler : IRequestHandler<GetHolidayByIdQuery, Result<HolidayDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetHolidayByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<HolidayDto>> Handle(GetHolidayByIdQuery request, CancellationToken cancellationToken)
    {
        var holiday = await _unitOfWork.Holidays.GetByIdAsync(request.HolidayId, cancellationToken);

        if (holiday == null)
        {
            return Result<HolidayDto>.Failure(
                Error.NotFound("Holiday", $"Holiday with ID {request.HolidayId} not found"));
        }

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
            HolidayType = null, // This would need to come from additional entity properties or mapping
            IsHalfDay = holiday.IsHalfDay,
            IsNational = true, // This would need to come from additional entity properties
            AffectedRegions = null, // This would need to come from additional entity properties
            IsActive = holiday.IsActive,
            CreatedAt = holiday.CreatedDate
        };

        return Result<HolidayDto>.Success(holidayDto);
    }
}
