using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.Common;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Commands;

/// <summary>
/// Command to create a new leave request
/// </summary>
public record CreateLeaveCommand : IRequest<Result<LeaveDto>>
{
    public CreateLeaveDto LeaveData { get; init; } = null!;
}

/// <summary>
/// Validator for CreateLeaveCommand
/// </summary>
public class CreateLeaveCommandValidator : AbstractValidator<CreateLeaveCommand>
{
    public CreateLeaveCommandValidator()
    {
        RuleFor(x => x.LeaveData)
            .NotNull().WithMessage("Leave data is required");

        When(x => x.LeaveData != null, () =>
        {
            RuleFor(x => x.LeaveData.EmployeeId)
                .GreaterThan(0).WithMessage("Employee ID is required");

            RuleFor(x => x.LeaveData.LeaveTypeId)
                .GreaterThan(0).WithMessage("Leave type ID is required");

            RuleFor(x => x.LeaveData.StartDate)
                .NotEmpty().WithMessage("Start date is required")
                .Must(date => date.Date >= DateTime.UtcNow.Date)
                .WithMessage("Start date cannot be in the past");

            RuleFor(x => x.LeaveData.EndDate)
                .NotEmpty().WithMessage("End date is required")
                .GreaterThanOrEqualTo(x => x.LeaveData.StartDate)
                .WithMessage("End date must be greater than or equal to start date");

            RuleFor(x => x.LeaveData)
                .Must(x => !x.IsHalfDay || x.StartDate.Date == x.EndDate.Date)
                .WithMessage("Half day leave must have same start and end date");
        });
    }
}

/// <summary>
/// Handler for CreateLeaveCommand
/// </summary>
public class CreateLeaveCommandHandler : IRequestHandler<CreateLeaveCommand, Result<LeaveDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateLeaveCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeaveDto>> Handle(CreateLeaveCommand request, CancellationToken cancellationToken)
    {
        var data = request.LeaveData;

        // Validate employee
        var employee = await _unitOfWork.Employees.GetByIdAsync(data.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("Employee", HRErrorMessages.Employee.NotFound));
        }

        // Validate leave type
        var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(data.LeaveTypeId, cancellationToken);
        if (leaveType == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("LeaveType", HRErrorMessages.LeaveType.NotFound));
        }

        if (!leaveType.IsActive)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("LeaveType.IsActive", HRErrorMessages.LeaveType.NotActive));
        }

        // Check if half-day is allowed
        if (data.IsHalfDay && !leaveType.AllowHalfDay)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("Leave.IsHalfDay", HRErrorMessages.Leave.HalfDayNotAllowed));
        }

        // Check for overlapping leaves
        if (await _unitOfWork.Leaves.HasOverlappingLeaveAsync(
            data.EmployeeId,
            data.StartDate.Date,
            data.EndDate.Date,
            cancellationToken: cancellationToken))
        {
            return Result<LeaveDto>.Failure(
                Error.Conflict("Leave.DateRange", HRErrorMessages.Leave.DateRangeConflict));
        }

        // Create the leave
        var leave = new Leave(
            data.EmployeeId,
            data.LeaveTypeId,
            data.StartDate.Date,
            data.EndDate.Date,
            data.Reason,
            data.IsHalfDay,
            data.IsHalfDayMorning);

        // Set tenant ID
        leave.SetTenantId(_unitOfWork.TenantId);

        // Set optional fields
        if (!string.IsNullOrEmpty(data.ContactDuringLeave))
        {
            leave.SetContactDuringLeave(data.ContactDuringLeave);
        }

        if (data.SubstituteEmployeeId.HasValue)
        {
            // Validate substitute employee
            var substituteEmployee = await _unitOfWork.Employees.GetByIdAsync(data.SubstituteEmployeeId.Value, cancellationToken);
            if (substituteEmployee == null)
            {
                return Result<LeaveDto>.Failure(
                    Error.NotFound("SubstituteEmployee", HRErrorMessages.Employee.SubstituteNotFound));
            }

            leave.SetSubstitute(data.SubstituteEmployeeId.Value, data.HandoverNotes);
        }

        // Check leave balance
        var year = data.StartDate.Year;
        var balance = await _unitOfWork.LeaveBalances.GetByEmployeeLeaveTypeAndYearAsync(
            data.EmployeeId,
            data.LeaveTypeId,
            year,
            cancellationToken);

        if (balance != null)
        {
            if (!leaveType.AllowNegativeBalance && !balance.HasSufficientBalance(leave.TotalDays))
            {
                return Result<LeaveDto>.Failure(
                    Error.Validation("Leave.Balance",
                        string.Format(HRErrorMessages.Leave.InsufficientBalance, balance.Available, leave.TotalDays)));
            }

            // Add to pending balance
            balance.AddPending(leave.TotalDays);
        }

        // Save to repository
        await _unitOfWork.Leaves.AddAsync(leave, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var leaveDto = new LeaveDto
        {
            Id = leave.Id,
            EmployeeId = leave.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            EmployeeCode = employee.EmployeeCode,
            LeaveTypeId = leave.LeaveTypeId,
            LeaveTypeName = leaveType.Name,
            LeaveTypeColor = leaveType.Color,
            StartDate = leave.StartDate,
            EndDate = leave.EndDate,
            TotalDays = leave.TotalDays,
            IsHalfDay = leave.IsHalfDay,
            IsHalfDayMorning = leave.IsHalfDayMorning,
            Reason = leave.Reason,
            Status = leave.Status,
            RequestDate = leave.RequestDate,
            ContactDuringLeave = leave.ContactDuringLeave,
            HandoverNotes = leave.HandoverNotes,
            SubstituteEmployeeId = leave.SubstituteEmployeeId,
            CreatedAt = leave.CreatedDate
        };

        return Result<LeaveDto>.Success(leaveDto);
    }
}
