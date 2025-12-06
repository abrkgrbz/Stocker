using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Shifts.Queries;

/// <summary>
/// Query to get shifts with optional filtering
/// </summary>
public class GetShiftsQuery : IRequest<Result<List<ShiftDto>>>
{
    public Guid TenantId { get; set; }
    public bool ActiveOnly { get; set; } = true;
    public bool? NightShiftsOnly { get; set; }
    public bool? FlexibleOnly { get; set; }
}

/// <summary>
/// Handler for GetShiftsQuery
/// </summary>
public class GetShiftsQueryHandler : IRequestHandler<GetShiftsQuery, Result<List<ShiftDto>>>
{
    private readonly IShiftRepository _shiftRepository;

    public GetShiftsQueryHandler(IShiftRepository shiftRepository)
    {
        _shiftRepository = shiftRepository;
    }

    public async Task<Result<List<ShiftDto>>> Handle(GetShiftsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Shift> shifts;

        if (request.NightShiftsOnly == true)
        {
            shifts = await _shiftRepository.GetNightShiftsAsync(cancellationToken);
        }
        else if (request.FlexibleOnly == true)
        {
            shifts = await _shiftRepository.GetFlexibleShiftsAsync(cancellationToken);
        }
        else if (request.ActiveOnly)
        {
            shifts = await _shiftRepository.GetActiveShiftsAsync(cancellationToken);
        }
        else
        {
            shifts = await _shiftRepository.GetAllAsync(cancellationToken);
        }

        var shiftDtos = new List<ShiftDto>();
        foreach (var shift in shifts)
        {
            var employeeCount = await _shiftRepository.GetEmployeeCountAsync(shift.Id, cancellationToken);

            shiftDtos.Add(new ShiftDto
            {
                Id = shift.Id,
                Code = shift.Code,
                Name = shift.Name,
                Description = shift.Description,
                ShiftType = shift.ShiftType,
                StartTime = shift.StartTime,
                EndTime = shift.EndTime,
                BreakStartTime = shift.BreakStartTime,
                BreakEndTime = shift.BreakEndTime,
                BreakDurationMinutes = shift.BreakDurationMinutes,
                WorkHoursPerDay = shift.WorkHours,
                IsNightShift = shift.IsNightShift,
                NightShiftAllowancePercentage = shift.NightShiftAllowance,
                GracePeriodMinutes = shift.GracePeriodMinutes,
                IsFlexible = shift.IsFlexible,
                FlexibleStartTime = shift.FlexibleStartMin,
                FlexibleEndTime = shift.FlexibleStartMax,
                IsActive = shift.IsActive,
                CreatedAt = shift.CreatedDate,
                UpdatedAt = shift.UpdatedDate,
                EmployeeCount = employeeCount
            });
        }

        return Result<List<ShiftDto>>.Success(shiftDtos.OrderBy(s => s.Name).ToList());
    }
}
