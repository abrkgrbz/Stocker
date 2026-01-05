using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Shifts.Queries;

/// <summary>
/// Query to get a shift by ID
/// </summary>
public record GetShiftByIdQuery(int ShiftId) : IRequest<Result<ShiftDto>>;

/// <summary>
/// Handler for GetShiftByIdQuery
/// </summary>
public class GetShiftByIdQueryHandler : IRequestHandler<GetShiftByIdQuery, Result<ShiftDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetShiftByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShiftDto>> Handle(GetShiftByIdQuery request, CancellationToken cancellationToken)
    {
        var shift = await _unitOfWork.Shifts.GetByIdAsync(request.ShiftId, cancellationToken);
        if (shift == null)
        {
            return Result<ShiftDto>.Failure(
                Error.NotFound("Shift", $"Shift with ID {request.ShiftId} not found"));
        }

        var employeeCount = await _unitOfWork.Shifts.GetEmployeeCountAsync(shift.Id, cancellationToken);

        var shiftDto = new ShiftDto
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
        };

        return Result<ShiftDto>.Success(shiftDto);
    }
}
