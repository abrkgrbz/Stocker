using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Queries;

/// <summary>
/// Query to get leaves with filters
/// </summary>
public class GetLeavesQuery : IRequest<Result<List<LeaveDto>>>
{
    public Guid TenantId { get; set; }
    public int? EmployeeId { get; set; }
    public int? LeaveTypeId { get; set; }
    public LeaveStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? Year { get; set; }
    public int? DepartmentId { get; set; }
    public bool IncludePendingForApproval { get; set; } = false;
    public int? ApproverId { get; set; }
}

/// <summary>
/// Handler for GetLeavesQuery
/// </summary>
public class GetLeavesQueryHandler : IRequestHandler<GetLeavesQuery, Result<List<LeaveDto>>>
{
    private readonly ILeaveRepository _leaveRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public GetLeavesQueryHandler(
        ILeaveRepository leaveRepository,
        IEmployeeRepository employeeRepository,
        ILeaveTypeRepository leaveTypeRepository)
    {
        _leaveRepository = leaveRepository;
        _employeeRepository = employeeRepository;
        _leaveTypeRepository = leaveTypeRepository;
    }

    public async Task<Result<List<LeaveDto>>> Handle(GetLeavesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Leave> leaves;

        // Apply filters in priority order
        if (request.IncludePendingForApproval)
        {
            leaves = await _leaveRepository.GetPendingForApprovalAsync(request.ApproverId, cancellationToken);
        }
        else if (request.EmployeeId.HasValue && request.Year.HasValue)
        {
            leaves = await _leaveRepository.GetByEmployeeAndYearAsync(request.EmployeeId.Value, request.Year.Value, cancellationToken);
        }
        else if (request.EmployeeId.HasValue)
        {
            leaves = await _leaveRepository.GetByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            leaves = await _leaveRepository.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (request.StartDate.HasValue && request.EndDate.HasValue && request.DepartmentId.HasValue)
        {
            leaves = await _leaveRepository.GetByDepartmentAndDateRangeAsync(
                request.DepartmentId.Value,
                request.StartDate.Value,
                request.EndDate.Value,
                cancellationToken);
        }
        else if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            leaves = await _leaveRepository.GetByDateRangeAsync(
                request.StartDate.Value,
                request.EndDate.Value,
                cancellationToken);
        }
        else
        {
            leaves = await _leaveRepository.GetAllAsync(cancellationToken);
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
