using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Commands;

/// <summary>
/// Command to approve or reject a leave request
/// </summary>
public class ApproveLeaveCommand : IRequest<Result<LeaveDto>>
{
    public Guid TenantId { get; set; }
    public int LeaveId { get; set; }
    public int ApprovedById { get; set; }
    public bool IsApproved { get; set; }
    public string? Notes { get; set; }
    public string? RejectionReason { get; set; }
}

/// <summary>
/// Validator for ApproveLeaveCommand
/// </summary>
public class ApproveLeaveCommandValidator : AbstractValidator<ApproveLeaveCommand>
{
    public ApproveLeaveCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.LeaveId)
            .GreaterThan(0).WithMessage("Leave ID is required");

        RuleFor(x => x.ApprovedById)
            .GreaterThan(0).WithMessage("Approver ID is required");

        RuleFor(x => x.RejectionReason)
            .NotEmpty().When(x => !x.IsApproved)
            .WithMessage("Rejection reason is required when rejecting a leave request");
    }
}

/// <summary>
/// Handler for ApproveLeaveCommand
/// </summary>
public class ApproveLeaveCommandHandler : IRequestHandler<ApproveLeaveCommand, Result<LeaveDto>>
{
    private readonly ILeaveRepository _leaveRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;
    private readonly ILeaveBalanceRepository _leaveBalanceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveLeaveCommandHandler(
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

    public async Task<Result<LeaveDto>> Handle(ApproveLeaveCommand request, CancellationToken cancellationToken)
    {
        // Get existing leave
        var leave = await _leaveRepository.GetWithDetailsAsync(request.LeaveId, cancellationToken);
        if (leave == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("Leave", $"Leave with ID {request.LeaveId} not found"));
        }

        // Only pending leaves can be approved/rejected
        if (leave.Status != LeaveStatus.Pending)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("Leave.Status", "Only pending leave requests can be approved or rejected"));
        }

        // Validate approver
        var approver = await _employeeRepository.GetByIdAsync(request.ApprovedById, cancellationToken);
        if (approver == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("Approver", $"Approver with ID {request.ApprovedById} not found"));
        }

        // Get leave balance
        var year = leave.StartDate.Year;
        var balance = await _leaveBalanceRepository.GetByEmployeeLeaveTypeAndYearAsync(
            leave.EmployeeId,
            leave.LeaveTypeId,
            year,
            cancellationToken);

        if (request.IsApproved)
        {
            // Approve the leave
            leave.Approve(request.ApprovedById, request.Notes);

            // Update balance: convert pending to used
            if (balance != null)
            {
                balance.ConvertPendingToUsed(leave.TotalDays);
            }
        }
        else
        {
            // Reject the leave
            leave.Reject(request.ApprovedById, request.RejectionReason!);

            // Update balance: remove pending
            if (balance != null)
            {
                balance.RemovePending(leave.TotalDays);
            }
        }

        // Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get related entities for DTO
        var employee = await _employeeRepository.GetByIdAsync(leave.EmployeeId, cancellationToken);
        var leaveType = await _leaveTypeRepository.GetByIdAsync(leave.LeaveTypeId, cancellationToken);

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
            ApprovedByName = $"{approver.FirstName} {approver.LastName}",
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
