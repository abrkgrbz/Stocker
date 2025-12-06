using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Commands;

/// <summary>
/// Command to update a leave request
/// </summary>
public class UpdateLeaveCommand : IRequest<Result<LeaveDto>>
{
    public Guid TenantId { get; set; }
    public int LeaveId { get; set; }
    public UpdateLeaveDto LeaveData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateLeaveCommand
/// </summary>
public class UpdateLeaveCommandValidator : AbstractValidator<UpdateLeaveCommand>
{
    public UpdateLeaveCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.LeaveId)
            .GreaterThan(0).WithMessage("Leave ID is required");

        RuleFor(x => x.LeaveData)
            .NotNull().WithMessage("Leave data is required");

        When(x => x.LeaveData != null, () =>
        {
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
/// Handler for UpdateLeaveCommand
/// </summary>
public class UpdateLeaveCommandHandler : IRequestHandler<UpdateLeaveCommand, Result<LeaveDto>>
{
    private readonly ILeaveRepository _leaveRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;
    private readonly ILeaveBalanceRepository _leaveBalanceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateLeaveCommandHandler(
        ILeaveRepository leaveRepository,
        IEmployeeRepository employeeRepository,
        ILeaveTypeRepository leaveTypeRepository,
        ILeaveBalanceRepository leaveBalanceRepository,
        IUnitOfWork unitOfWork)
    {
        _leaveRepository = leaveRepository;
        _employeeRepository = employeeRepository;
        _leaveTypeRepository = leaveTypeRepository;
        _leaveBalanceRepository = leaveBalanceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeaveDto>> Handle(UpdateLeaveCommand request, CancellationToken cancellationToken)
    {
        var data = request.LeaveData;

        // Get existing leave
        var leave = await _leaveRepository.GetWithDetailsAsync(request.LeaveId, cancellationToken);
        if (leave == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("Leave", $"Leave with ID {request.LeaveId} not found"));
        }

        // Only pending leaves can be updated
        if (leave.Status != LeaveStatus.Pending)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("Leave.Status", "Only pending leave requests can be updated"));
        }

        // Store old values for balance adjustment
        var oldTotalDays = leave.TotalDays;
        var oldLeaveTypeId = leave.LeaveTypeId;
        var oldYear = leave.StartDate.Year;

        // Validate leave type
        var leaveType = await _leaveTypeRepository.GetByIdAsync(data.LeaveTypeId, cancellationToken);
        if (leaveType == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("LeaveType", $"Leave type with ID {data.LeaveTypeId} not found"));
        }

        if (!leaveType.IsActive)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("LeaveType.IsActive", "Leave type is not active"));
        }

        // Check if half-day is allowed
        if (data.IsHalfDay && !leaveType.AllowHalfDay)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("Leave.IsHalfDay", "Half-day leave is not allowed for this leave type"));
        }

        // Check for overlapping leaves
        if (await _leaveRepository.HasOverlappingLeaveAsync(
            leave.EmployeeId,
            data.StartDate.Date,
            data.EndDate.Date,
            request.LeaveId,
            cancellationToken))
        {
            return Result<LeaveDto>.Failure(
                Error.Conflict("Leave.DateRange", "Employee already has a leave request for this date range"));
        }

        // Update the leave
        leave.Update(
            data.StartDate.Date,
            data.EndDate.Date,
            data.Reason,
            data.IsHalfDay,
            data.IsHalfDayMorning);

        // Update optional fields
        if (!string.IsNullOrEmpty(data.ContactDuringLeave))
        {
            leave.SetContactDuringLeave(data.ContactDuringLeave);
        }

        if (data.SubstituteEmployeeId.HasValue)
        {
            // Validate substitute employee
            var substituteEmployee = await _employeeRepository.GetByIdAsync(data.SubstituteEmployeeId.Value, cancellationToken);
            if (substituteEmployee == null)
            {
                return Result<LeaveDto>.Failure(
                    Error.NotFound("SubstituteEmployee", $"Substitute employee with ID {data.SubstituteEmployeeId} not found"));
            }

            leave.SetSubstitute(data.SubstituteEmployeeId.Value, data.HandoverNotes);
        }
        else
        {
            leave.SetSubstitute(null, null);
        }

        // Update leave balance if needed
        var newYear = data.StartDate.Year;

        // Remove old pending days
        var oldBalance = await _leaveBalanceRepository.GetByEmployeeLeaveTypeAndYearAsync(
            leave.EmployeeId,
            oldLeaveTypeId,
            oldYear,
            cancellationToken);

        if (oldBalance != null)
        {
            oldBalance.RemovePending(oldTotalDays);
        }

        // Add new pending days
        var newBalance = await _leaveBalanceRepository.GetByEmployeeLeaveTypeAndYearAsync(
            leave.EmployeeId,
            data.LeaveTypeId,
            newYear,
            cancellationToken);

        if (newBalance != null)
        {
            if (!leaveType.AllowNegativeBalance && !newBalance.HasSufficientBalance(leave.TotalDays))
            {
                // Revert old balance change
                if (oldBalance != null)
                {
                    oldBalance.AddPending(oldTotalDays);
                }

                return Result<LeaveDto>.Failure(
                    Error.Validation("Leave.Balance",
                        $"Insufficient leave balance. Available: {newBalance.Available}, Requested: {leave.TotalDays}"));
            }

            newBalance.AddPending(leave.TotalDays);
        }

        // Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get employee and map to DTO
        var employee = await _employeeRepository.GetByIdAsync(leave.EmployeeId, cancellationToken);

        var leaveDto = new LeaveDto
        {
            Id = leave.Id,
            EmployeeId = leave.EmployeeId,
            EmployeeName = $"{employee!.FirstName} {employee.LastName}",
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
