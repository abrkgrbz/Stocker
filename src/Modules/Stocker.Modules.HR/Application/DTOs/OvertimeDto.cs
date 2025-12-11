namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Overtime entity
/// </summary>
public record OvertimeDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public string? EmployeeName { get; init; }
    public string OvertimeType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public decimal PlannedHours { get; init; }
    public decimal? ActualHours { get; init; }
    public int BreakMinutes { get; init; }
    public decimal PayMultiplier { get; init; }
    public decimal? CalculatedAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public int? ProjectId { get; init; }
    public string? ProjectName { get; init; }
    public string? TaskId { get; init; }
    public string? CostCenter { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? WorkDetails { get; init; }
    public DateTime RequestDate { get; init; }
    public int? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public string? ApprovalNotes { get; init; }
    public string? RejectionReason { get; init; }
    public bool IsPaid { get; init; }
    public DateTime? PaidDate { get; init; }
    public int? PayrollId { get; init; }
    public bool IsCompensatoryTimeOff { get; init; }
    public decimal? CompensatoryHoursEarned { get; init; }
    public decimal? CompensatoryHoursUsed { get; init; }
    public bool IsPreApproved { get; init; }
    public bool IsEmergency { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

