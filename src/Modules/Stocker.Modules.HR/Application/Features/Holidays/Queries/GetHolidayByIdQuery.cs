using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Holidays.Queries;

/// <summary>
/// Query to get a single holiday by ID
/// </summary>
public class GetHolidayByIdQuery : IRequest<Result<HolidayDto>>
{
    public Guid TenantId { get; set; }
    public int HolidayId { get; set; }
}

/// <summary>
/// Validator for GetHolidayByIdQuery
/// </summary>
public class GetHolidayByIdQueryValidator : AbstractValidator<GetHolidayByIdQuery>
{
    public GetHolidayByIdQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.HolidayId)
            .GreaterThan(0).WithMessage("Holiday ID must be greater than 0");
    }
}

/// <summary>
/// Handler for GetHolidayByIdQuery
/// </summary>
public class GetHolidayByIdQueryHandler : IRequestHandler<GetHolidayByIdQuery, Result<HolidayDto>>
{
    private readonly IHolidayRepository _holidayRepository;

    public GetHolidayByIdQueryHandler(IHolidayRepository holidayRepository)
    {
        _holidayRepository = holidayRepository;
    }

    public async Task<Result<HolidayDto>> Handle(GetHolidayByIdQuery request, CancellationToken cancellationToken)
    {
        var holiday = await _holidayRepository.GetByIdAsync(request.HolidayId, cancellationToken);

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
