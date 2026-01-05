using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkSchedules.Queries;

/// <summary>
/// Query to get work schedules with optional filtering
/// </summary>
public record GetWorkSchedulesQuery : IRequest<Result<List<WorkScheduleDto>>>
{
    public int? EmployeeId { get; init; }
    public int? ShiftId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public bool? IsWorkDay { get; init; }
}

/// <summary>
/// Handler for GetWorkSchedulesQuery
/// </summary>
public class GetWorkSchedulesQueryHandler : IRequestHandler<GetWorkSchedulesQuery, Result<List<WorkScheduleDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetWorkSchedulesQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<WorkScheduleDto>>> Handle(GetWorkSchedulesQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Domain.Entities.WorkSchedule> schedules;

        if (request.FromDate.HasValue && request.ToDate.HasValue)
        {
            schedules = await _unitOfWork.WorkSchedules.GetByDateRangeAsync(
                request.FromDate.Value, request.ToDate.Value, cancellationToken);
        }
        else if (request.EmployeeId.HasValue)
        {
            schedules = await _unitOfWork.WorkSchedules.GetByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else
        {
            schedules = await _unitOfWork.WorkSchedules.GetAllAsync(cancellationToken);
        }

        var filtered = schedules.AsEnumerable();

        // Apply additional filtering
        if (request.EmployeeId.HasValue && !(request.FromDate.HasValue && request.ToDate.HasValue))
        {
            filtered = filtered.Where(s => s.EmployeeId == request.EmployeeId.Value);
        }

        if (request.ShiftId.HasValue)
        {
            filtered = filtered.Where(s => s.ShiftId == request.ShiftId.Value);
        }

        if (request.IsWorkDay.HasValue)
        {
            filtered = filtered.Where(s => s.IsWorkDay == request.IsWorkDay.Value);
        }

        if (request.FromDate.HasValue && !request.ToDate.HasValue)
        {
            filtered = filtered.Where(s => s.Date >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue && !request.FromDate.HasValue)
        {
            filtered = filtered.Where(s => s.Date <= request.ToDate.Value);
        }

        // Get employees and shifts for mapping
        var employees = await _unitOfWork.Employees.GetAllAsync(cancellationToken);
        var employeeDict = employees.ToDictionary(e => e.Id);

        var shifts = await _unitOfWork.Shifts.GetAllAsync(cancellationToken);
        var shiftDict = shifts.ToDictionary(s => s.Id);

        var dtos = filtered.Select(s =>
        {
            employeeDict.TryGetValue(s.EmployeeId, out var employee);
            shiftDict.TryGetValue(s.ShiftId, out var shift);

            return new WorkScheduleDto
            {
                Id = s.Id,
                EmployeeId = s.EmployeeId,
                EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
                ShiftId = s.ShiftId,
                ShiftName = shift?.Name ?? string.Empty,
                Date = s.Date,
                IsWorkDay = s.IsWorkDay,
                IsHoliday = s.IsHoliday,
                HolidayName = s.HolidayName,
                CustomStartTime = s.CustomStartTime,
                CustomEndTime = s.CustomEndTime,
                Notes = s.Notes,
                CreatedAt = s.CreatedDate
            };
        }).OrderBy(s => s.Date)
          .ThenBy(s => s.EmployeeName)
          .ToList();

        return Result<List<WorkScheduleDto>>.Success(dtos);
    }
}
