using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for LeaveType entity
/// </summary>
public class LeaveTypeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal DefaultDays { get; set; }
    public bool IsPaid { get; set; }
    public bool RequiresApproval { get; set; }
    public bool RequiresDocument { get; set; }
    public int? MaxConsecutiveDays { get; set; }
    public int? MinNoticeDays { get; set; }
    public bool AllowHalfDay { get; set; }
    public bool AllowNegativeBalance { get; set; }
    public bool CarryForward { get; set; }
    public decimal? MaxCarryForwardDays { get; set; }
    public bool IsActive { get; set; }
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a leave type
/// </summary>
public class CreateLeaveTypeDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal DefaultDays { get; set; }
    public bool IsPaid { get; set; } = true;
    public bool RequiresApproval { get; set; } = true;
    public bool RequiresDocument { get; set; }
    public int? MaxConsecutiveDays { get; set; }
    public int? MinNoticeDays { get; set; }
    public bool AllowHalfDay { get; set; } = true;
    public bool AllowNegativeBalance { get; set; }
    public bool CarryForward { get; set; }
    public decimal? MaxCarryForwardDays { get; set; }
    public string? Color { get; set; }
}

/// <summary>
/// DTO for updating a leave type
/// </summary>
public class UpdateLeaveTypeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal DefaultDays { get; set; }
    public bool IsPaid { get; set; }
    public bool RequiresApproval { get; set; }
    public bool RequiresDocument { get; set; }
    public int? MaxConsecutiveDays { get; set; }
    public int? MinNoticeDays { get; set; }
    public bool AllowHalfDay { get; set; }
    public bool AllowNegativeBalance { get; set; }
    public bool CarryForward { get; set; }
    public decimal? MaxCarryForwardDays { get; set; }
    public string? Color { get; set; }
}

/// <summary>
/// Data transfer object for Leave entity
/// </summary>
public class LeaveDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public int LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public string? LeaveTypeColor { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalDays { get; set; }
    public bool IsHalfDay { get; set; }
    public bool IsHalfDayMorning { get; set; }
    public string? Reason { get; set; }
    public LeaveStatus Status { get; set; }
    public int? ApprovedById { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovalNotes { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime RequestDate { get; set; }
    public string? AttachmentUrl { get; set; }
    public string? ContactDuringLeave { get; set; }
    public string? HandoverNotes { get; set; }
    public int? SubstituteEmployeeId { get; set; }
    public string? SubstituteEmployeeName { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a leave request
/// </summary>
public class CreateLeaveDto
{
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsHalfDay { get; set; }
    public bool IsHalfDayMorning { get; set; }
    public string? Reason { get; set; }
    public string? ContactDuringLeave { get; set; }
    public string? HandoverNotes { get; set; }
    public int? SubstituteEmployeeId { get; set; }
}

/// <summary>
/// DTO for updating a leave request
/// </summary>
public class UpdateLeaveDto
{
    public int LeaveTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsHalfDay { get; set; }
    public bool IsHalfDayMorning { get; set; }
    public string? Reason { get; set; }
    public string? ContactDuringLeave { get; set; }
    public string? HandoverNotes { get; set; }
    public int? SubstituteEmployeeId { get; set; }
}

/// <summary>
/// DTO for approving a leave request
/// </summary>
public class ApproveLeaveDto
{
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for rejecting a leave request
/// </summary>
public class RejectLeaveDto
{
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Data transfer object for LeaveBalance entity
/// </summary>
public class LeaveBalanceDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public int Year { get; set; }
    public decimal Entitled { get; set; }
    public decimal Used { get; set; }
    public decimal Pending { get; set; }
    public decimal CarriedForward { get; set; }
    public decimal Adjustment { get; set; }
    public string? AdjustmentReason { get; set; }
    public decimal Available { get; set; }
}

/// <summary>
/// DTO for adjusting leave balance
/// </summary>
public class AdjustLeaveBalanceDto
{
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public int Year { get; set; }
    public decimal Days { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// DTO for employee leave summary
/// </summary>
public class EmployeeLeaveSummaryDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int Year { get; set; }
    public List<LeaveBalanceDto> Balances { get; set; } = new();
    public decimal TotalEntitled { get; set; }
    public decimal TotalUsed { get; set; }
    public decimal TotalPending { get; set; }
    public decimal TotalAvailable { get; set; }
}
