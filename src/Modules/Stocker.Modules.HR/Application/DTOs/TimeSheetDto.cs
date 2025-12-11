namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for TimeSheet entity
/// </summary>
public record TimeSheetDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public string? EmployeeName { get; init; }
    public DateOnly PeriodStart { get; init; }
    public DateOnly PeriodEnd { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal TotalWorkHours { get; init; }
    public decimal RegularHours { get; init; }
    public decimal OvertimeHours { get; init; }
    public decimal LeaveHours { get; init; }
    public decimal HolidayHours { get; init; }
    public decimal BillableHours { get; init; }
    public decimal NonBillableHours { get; init; }
    public DateTime? SubmittedDate { get; init; }
    public int? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public string? ApprovalNotes { get; init; }
    public string? RejectionReason { get; init; }
    public string? Notes { get; init; }
    public bool IsLocked { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

