using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Commands;

/// <summary>
/// Command to cancel a leave request
/// </summary>
public class CancelLeaveCommand : IRequest<Result<LeaveDto>>
{
    public Guid TenantId { get; set; }
    public int LeaveId { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Validator for CancelLeaveCommand
/// </summary>
public class CancelLeaveCommandValidator : AbstractValidator<CancelLeaveCommand>
{
    public CancelLeaveCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.LeaveId)
            .GreaterThan(0).WithMessage("Leave ID is required");
    }
}

/// <summary>
/// Handler for CancelLeaveCommand
/// </summary>
public class CancelLeaveCommandHandler : IRequestHandler<CancelLeaveCommand, Result<LeaveDto>>
{
    private readonly ILeaveRepository _leaveRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;
    private readonly ILeaveBalanceRepository _leaveBalanceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelLeaveCommandHandler(
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

    public async Task<Result<LeaveDto>> Handle(CancelLeaveCommand request, CancellationToken cancellationToken)
    {
        // Get existing leave
        var leave = await _leaveRepository.GetWithDetailsAsync(request.LeaveId, cancellationToken);
        if (leave == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("Leave", $"Leave with ID {request.LeaveId} not found"));
        }

        // Check if leave can be cancelled
        if (leave.Status == LeaveStatus.Cancelled)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("Leave.Status", "Leave request is already cancelled"));
        }

        if (leave.Status == LeaveStatus.Taken)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("Leave.Status", "Cannot cancel leave that has already been taken"));
        }

        if (leave.StartDate <= DateTime.UtcNow.Date && leave.Status == LeaveStatus.Approved)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("Leave.StartDate", "Cannot cancel leave that has already started"));
        }

        // Store status before cancellation
        var previousStatus = leave.Status;

        // Cancel the leave
        leave.Cancel(request.Reason);

        // Update balance based on previous status
        var year = leave.StartDate.Year;
        var balance = await _leaveBalanceRepository.GetByEmployeeLeaveTypeAndYearAsync(
            leave.EmployeeId,
            leave.LeaveTypeId,
            year,
            cancellationToken);

        if (balance != null)
        {
            if (previousStatus == LeaveStatus.Pending)
            {
                // Remove from pending
                balance.RemovePending(leave.TotalDays);
            }
            else if (previousStatus == LeaveStatus.Approved)
            {
                // Return used days
                balance.RemoveUsed(leave.TotalDays);
            }
        }

        // Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get related entities for DTO
        var employee = await _employeeRepository.GetByIdAsync(leave.EmployeeId, cancellationToken);
        var leaveType = await _leaveTypeRepository.GetByIdAsync(leave.LeaveTypeId, cancellationToken);

        string? approvedByName = null;
        if (leave.ApprovedById.HasValue)
        {
            var approver = await _employeeRepository.GetByIdAsync(leave.ApprovedById.Value, cancellationToken);
            approvedByName = approver != null
                ? $"{approver.FirstName} {approver.LastName}"
                : null;
        }

        string? substituteEmployeeName = null;
        if (leave.SubstituteEmployeeId.HasValue)
        {
            var substituteEmployee = await _employeeRepository.GetByIdAsync(leave.SubstituteEmployeeId.Value, cancellationToken);
            substituteEmployeeName = substituteEmployee != null
                ? $"{substituteEmployee.FirstName} {substituteEmployee.LastName}"
                : null;
        }

        var leaveDto = new LeaveDto
        {
            Id = leave.Id,
            EmployeeId = leave.EmployeeId,
            EmployeeName = $"{employee!.FirstName} {employee.LastName}",
            EmployeeCode = employee.EmployeeCode,
            LeaveTypeId = leave.LeaveTypeId,
            LeaveTypeName = leaveType!.Name,
            LeaveTypeColor = leaveType.Color,
            StartDate = leave.StartDate,
            EndDate = leave.EndDate,
            TotalDays = leave.TotalDays,
            IsHalfDay = leave.IsHalfDay,
            IsHalfDayMorning = leave.IsHalfDayMorning,
            Reason = leave.Reason,
            Status = leave.Status,
            ApprovedById = leave.ApprovedById,
            ApprovedByName = approvedByName,
            ApprovedDate = leave.ApprovedDate,
            ApprovalNotes = leave.ApprovalNotes,
            RejectionReason = leave.RejectionReason,
            RequestDate = leave.RequestDate,
            ContactDuringLeave = leave.ContactDuringLeave,
            HandoverNotes = leave.HandoverNotes,
            SubstituteEmployeeId = leave.SubstituteEmployeeId,
            SubstituteEmployeeName = substituteEmployeeName,
            CreatedAt = leave.CreatedDate
        };

        return Result<LeaveDto>.Success(leaveDto);
    }
}
