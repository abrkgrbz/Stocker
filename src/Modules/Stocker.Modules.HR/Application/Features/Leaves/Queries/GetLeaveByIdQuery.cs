using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Queries;

/// <summary>
/// Query to get a single leave by ID
/// </summary>
public record GetLeaveByIdQuery(int LeaveId) : IRequest<Result<LeaveDto>>;

/// <summary>
/// Validator for GetLeaveByIdQuery
/// </summary>
public class GetLeaveByIdQueryValidator : AbstractValidator<GetLeaveByIdQuery>
{
    public GetLeaveByIdQueryValidator()
    {
        RuleFor(x => x.LeaveId)
            .GreaterThan(0).WithMessage("Leave ID is required");
    }
}

/// <summary>
/// Handler for GetLeaveByIdQuery
/// </summary>
public class GetLeaveByIdQueryHandler : IRequestHandler<GetLeaveByIdQuery, Result<LeaveDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetLeaveByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeaveDto>> Handle(GetLeaveByIdQuery request, CancellationToken cancellationToken)
    {
        // Get leave with details
        var leave = await _unitOfWork.Leaves.GetWithDetailsAsync(request.LeaveId, cancellationToken);
        if (leave == null)
        {
            return Result<LeaveDto>.Failure(
                Error.NotFound("Leave", $"Leave with ID {request.LeaveId} not found"));
        }

        // Get related entities
        var employee = await _unitOfWork.Employees.GetByIdAsync(leave.EmployeeId, cancellationToken);
        var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(leave.LeaveTypeId, cancellationToken);

        string? approvedByName = null;
        if (leave.ApprovedById.HasValue)
        {
            var approver = await _unitOfWork.Employees.GetByIdAsync(leave.ApprovedById.Value, cancellationToken);
            approvedByName = approver != null
                ? $"{approver.FirstName} {approver.LastName}"
                : null;
        }

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
            EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : "Unknown",
            EmployeeCode = employee?.EmployeeCode,
            LeaveTypeId = leave.LeaveTypeId,
            LeaveTypeName = leaveType?.Name ?? "Unknown",
            LeaveTypeColor = leaveType?.Color,
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
            AttachmentUrl = leave.AttachmentUrl,
            ContactDuringLeave = leave.ContactDuringLeave,
            HandoverNotes = leave.HandoverNotes,
            SubstituteEmployeeId = leave.SubstituteEmployeeId,
            SubstituteEmployeeName = substituteEmployeeName,
            CreatedAt = leave.CreatedDate
        };

        return Result<LeaveDto>.Success(leaveDto);
    }
}
