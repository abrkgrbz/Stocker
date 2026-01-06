using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.Common;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Commands;

/// <summary>
/// Command to approve or reject a leave request
/// </summary>
public record ApproveLeaveCommand : IRequest<Result<LeaveDto>>
{
    public int LeaveId { get; init; }
    public int ApprovedById { get; init; }
    public bool IsApproved { get; init; }
    public string? Notes { get; init; }
    public string? RejectionReason { get; init; }
}

/// <summary>
/// Validator for ApproveLeaveCommand
/// </summary>
public class ApproveLeaveCommandValidator : AbstractValidator<ApproveLeaveCommand>
{
    public ApproveLeaveCommandValidator()
    {
        RuleFor(x => x.LeaveId)
            .GreaterThan(0).WithMessage("İzin ID'si gereklidir");

        RuleFor(x => x.ApprovedById)
            .GreaterThan(0).WithMessage("Onaylayan ID'si gereklidir");

        RuleFor(x => x.RejectionReason)
            .NotEmpty().When(x => !x.IsApproved)
            .WithMessage("Red sebebi belirtilmelidir");
    }
}

/// <summary>
/// Handler for ApproveLeaveCommand
/// </summary>
public class ApproveLeaveCommandHandler : IRequestHandler<ApproveLeaveCommand, Result<LeaveDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public ApproveLeaveCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeaveDto>> Handle(ApproveLeaveCommand request, CancellationToken cancellationToken)
    {
        // Get existing leave
        var leave = await _unitOfWork.Leaves.GetWithDetailsAsync(request.LeaveId, cancellationToken);
        if (leave == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("Leave", HRErrorMessages.Leave.NotFound));
        }

        // Only pending leaves can be approved/rejected
        if (leave.Status != LeaveStatus.Pending)
        {
            return Result<LeaveDto>.Failure(
                Error.Validation("Leave.Status", HRErrorMessages.Leave.OnlyPendingCanBeApproved));
        }

        // Validate approver
        var approver = await _unitOfWork.Employees.GetByIdAsync(request.ApprovedById, cancellationToken);
        if (approver == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("Approver", HRErrorMessages.Employee.ApproverNotFound));
        }

        // Get leave balance
        var year = leave.StartDate.Year;
        var balance = await _unitOfWork.LeaveBalances.GetByEmployeeLeaveTypeAndYearAsync(
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
        var employee = await _unitOfWork.Employees.GetByIdAsync(leave.EmployeeId, cancellationToken);
        var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(leave.LeaveTypeId, cancellationToken);

        string? substituteEmployeeName = null;
        if (leave.SubstituteEmployeeId.HasValue)
        {
            var substituteEmployee = await _unitOfWork.Employees.GetByIdAsync(leave.SubstituteEmployeeId.Value, cancellationToken);
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
