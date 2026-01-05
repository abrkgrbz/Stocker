using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Holidays.Queries;

/// <summary>
/// Query to get holidays with optional filters
/// </summary>
public record GetHolidaysQuery : IRequest<Result<List<HolidayDto>>>
{
    public int? Year { get; init; }
    public bool? IsRecurring { get; init; }
    public bool IncludeInactive { get; init; } = false;
}

/// <summary>
/// Handler for GetHolidaysQuery
/// </summary>
public class GetHolidaysQueryHandler : IRequestHandler<GetHolidaysQuery, Result<List<HolidayDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetHolidaysQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<HolidayDto>>> Handle(GetHolidaysQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Holiday> holidays;

        // Get holidays by year if specified, otherwise get all
        if (request.Year.HasValue)
        {
            holidays = await _unitOfWork.Holidays.GetByYearAsync(request.Year.Value, cancellationToken);
        }
        else
        {
            holidays = await _unitOfWork.Holidays.GetAllAsync(cancellationToken);
        }

        // Filter by recurring status if specified
        if (request.IsRecurring.HasValue)
        {
            holidays = holidays.Where(h => h.IsRecurring == request.IsRecurring.Value).ToList();
        }

        // Filter out inactive holidays unless requested
        if (!request.IncludeInactive)
        {
            holidays = holidays.Where(h => h.IsActive).ToList();
        }

        // Map to DTOs
        var holidayDtos = holidays.Select(h => new HolidayDto
        {
            Id = h.Id,
            Name = h.Name,
            Description = h.Description,
            Date = h.Date,
            Year = h.Year,
            IsRecurring = h.IsRecurring,
            RecurringMonth = h.IsRecurring ? h.Date.Month : null,
            RecurringDay = h.IsRecurring ? h.Date.Day : null,
            HolidayType = null, // This would need to come from additional entity properties or mapping
            IsHalfDay = h.IsHalfDay,
            IsNational = true, // This would need to come from additional entity properties
            AffectedRegions = null, // This would need to come from additional entity properties
            IsActive = h.IsActive,
            CreatedAt = h.CreatedDate
        }).OrderBy(h => h.Date).ToList();

        return Result<List<HolidayDto>>.Success(holidayDtos);
    }
}
