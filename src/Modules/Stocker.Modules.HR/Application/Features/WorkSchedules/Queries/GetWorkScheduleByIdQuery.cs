using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkSchedules.Queries;

/// <summary>
/// Query to get a work schedule by ID
/// </summary>
public class GetWorkScheduleByIdQuery : IRequest<Result<WorkScheduleDto>>
{
    public Guid TenantId { get; set; }
    public int ScheduleId { get; set; }
}

/// <summary>
/// Handler for GetWorkScheduleByIdQuery
/// </summary>
public class GetWorkScheduleByIdQueryHandler : IRequestHandler<GetWorkScheduleByIdQuery, Result<WorkScheduleDto>>
{
    private readonly IWorkScheduleRepository _scheduleRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IShiftRepository _shiftRepository;

    public GetWorkScheduleByIdQueryHandler(
        IWorkScheduleRepository scheduleRepository,
        IEmployeeRepository employeeRepository,
        IShiftRepository shiftRepository)
    {
        _scheduleRepository = scheduleRepository;
        _employeeRepository = employeeRepository;
        _shiftRepository = shiftRepository;
    }

    public async Task<Result<WorkScheduleDto>> Handle(GetWorkScheduleByIdQuery request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null)
        {
            return Result<WorkScheduleDto>.Failure(
                Error.NotFound("WorkSchedule.NotFound", $"Work schedule with ID {request.ScheduleId} not found"));
        }

        var employee = await _employeeRepository.GetByIdAsync(schedule.EmployeeId, cancellationToken);
        var shift = await _shiftRepository.GetByIdAsync(schedule.ShiftId, cancellationToken);

        var dto = new WorkScheduleDto
        {
            Id = schedule.Id,
            EmployeeId = schedule.EmployeeId,
            EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
            ShiftId = schedule.ShiftId,
            ShiftName = shift?.Name ?? string.Empty,
            Date = schedule.Date,
            IsWorkDay = schedule.IsWorkDay,
            IsHoliday = schedule.IsHoliday,
            HolidayName = schedule.HolidayName,
            CustomStartTime = schedule.CustomStartTime,
            CustomEndTime = schedule.CustomEndTime,
            Notes = schedule.Notes,
            CreatedAt = schedule.CreatedDate
        };

        return Result<WorkScheduleDto>.Success(dto);
    }
}
