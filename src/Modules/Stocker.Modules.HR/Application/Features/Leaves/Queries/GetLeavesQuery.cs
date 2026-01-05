using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Queries;

/// <summary>
/// Query to get leaves with filters
/// </summary>
public record GetLeavesQuery : IRequest<Result<List<LeaveDto>>>
{
    public int? EmployeeId { get; init; }
    public int? LeaveTypeId { get; init; }
    public LeaveStatus? Status { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public int? Year { get; init; }
    public int? DepartmentId { get; init; }
    public bool IncludePendingForApproval { get; init; } = false;
    public int? ApproverId { get; init; }
}

/// <summary>
/// Handler for GetLeavesQuery
/// </summary>
public class GetLeavesQueryHandler : IRequestHandler<GetLeavesQuery, Result<List<LeaveDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetLeavesQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<LeaveDto>>> Handle(GetLeavesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Leave> leaves;

        // Apply filters in priority order
        if (request.IncludePendingForApproval)
        {
            leaves = await _unitOfWork.Leaves.GetPendingForApprovalAsync(request.ApproverId, cancellationToken);
        }
        else if (request.EmployeeId.HasValue && request.Year.HasValue)
        {
            leaves = await _unitOfWork.Leaves.GetByEmployeeAndYearAsync(request.EmployeeId.Value, request.Year.Value, cancellationToken);
        }
        else if (request.EmployeeId.HasValue)
        {
            leaves = await _unitOfWork.Leaves.GetByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            leaves = await _unitOfWork.Leaves.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (request.StartDate.HasValue && request.EndDate.HasValue && request.DepartmentId.HasValue)
        {
            leaves = await _unitOfWork.Leaves.GetByDepartmentAndDateRangeAsync(
                request.DepartmentId.Value,
                request.StartDate.Value,
                request.EndDate.Value,
                cancellationToken);
        }
        else if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            leaves = await _unitOfWork.Leaves.GetByDateRangeAsync(
                request.StartDate.Value,
                request.EndDate.Value,
                cancellationToken);
        }
        else
        {
            leaves = await _unitOfWork.Leaves.GetAllAsync(cancellationToken);
        }

        // Additional filtering
        var filteredLeaves = leaves.AsEnumerable();

        if (request.LeaveTypeId.HasValue)
        {
            filteredLeaves = filteredLeaves.Where(l => l.LeaveTypeId == request.LeaveTypeId.Value);
        }

        if (request.Status.HasValue && !request.IncludePendingForApproval)
        {
            filteredLeaves = filteredLeaves.Where(l => l.Status == request.Status.Value);
        }

        if (request.Year.HasValue && !request.EmployeeId.HasValue)
        {
            filteredLeaves = filteredLeaves.Where(l => l.StartDate.Year == request.Year.Value);
        }

        // Map to DTOs
        var leaveDtos = new List<LeaveDto>();
        foreach (var leave in filteredLeaves)
        {
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

            leaveDtos.Add(new LeaveDto
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
            });
        }

        return Result<List<LeaveDto>>.Success(leaveDtos.OrderByDescending(l => l.RequestDate).ToList());
    }
}
