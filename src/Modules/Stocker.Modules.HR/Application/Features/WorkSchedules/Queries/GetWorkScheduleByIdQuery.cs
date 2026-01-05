using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkSchedules.Queries;

/// <summary>
/// Query to get a work schedule by ID
/// </summary>
public record GetWorkScheduleByIdQuery(int ScheduleId) : IRequest<Result<WorkScheduleDto>>;

/// <summary>
/// Validator for GetWorkScheduleByIdQuery
/// </summary>
public class GetWorkScheduleByIdQueryValidator : AbstractValidator<GetWorkScheduleByIdQuery>
{
    public GetWorkScheduleByIdQueryValidator()
    {
        RuleFor(x => x.ScheduleId)
            .GreaterThan(0).WithMessage("Schedule ID must be greater than 0");
    }
}

/// <summary>
/// Handler for GetWorkScheduleByIdQuery
/// </summary>
public class GetWorkScheduleByIdQueryHandler : IRequestHandler<GetWorkScheduleByIdQuery, Result<WorkScheduleDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetWorkScheduleByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WorkScheduleDto>> Handle(GetWorkScheduleByIdQuery request, CancellationToken cancellationToken)
    {
        var schedule = await _unitOfWork.WorkSchedules.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null)
        {
            return Result<WorkScheduleDto>.Failure(
                Error.NotFound("WorkSchedule.NotFound", $"Work schedule with ID {request.ScheduleId} not found"));
        }

        var employee = await _unitOfWork.Employees.GetByIdAsync(schedule.EmployeeId, cancellationToken);
        var shift = await _unitOfWork.Shifts.GetByIdAsync(schedule.ShiftId, cancellationToken);

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
