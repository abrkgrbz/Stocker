using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Shift entity
/// </summary>
public class ShiftDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ShiftType ShiftType { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public TimeSpan? BreakStartTime { get; set; }
    public TimeSpan? BreakEndTime { get; set; }
    public int BreakDurationMinutes { get; set; }
    public decimal WorkHoursPerDay { get; set; }
    public bool IsNightShift { get; set; }
    public decimal? NightShiftAllowancePercentage { get; set; }
    public int? GracePeriodMinutes { get; set; }
    public int? EarlyDepartureThresholdMinutes { get; set; }
    public int? OvertimeThresholdMinutes { get; set; }
    public bool IsFlexible { get; set; }
    public TimeSpan? FlexibleStartTime { get; set; }
    public TimeSpan? FlexibleEndTime { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int EmployeeCount { get; set; }
}

/// <summary>
/// DTO for creating a shift
/// </summary>
public class CreateShiftDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ShiftType ShiftType { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public TimeSpan? BreakStartTime { get; set; }
    public TimeSpan? BreakEndTime { get; set; }
    public int BreakDurationMinutes { get; set; }
    public decimal? NightShiftAllowancePercentage { get; set; }
    public int? GracePeriodMinutes { get; set; }
    public int? EarlyDepartureThresholdMinutes { get; set; }
    public int? OvertimeThresholdMinutes { get; set; }
    public bool IsFlexible { get; set; }
    public TimeSpan? FlexibleStartTime { get; set; }
    public TimeSpan? FlexibleEndTime { get; set; }
}

/// <summary>
/// DTO for updating a shift
/// </summary>
public class UpdateShiftDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ShiftType ShiftType { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public TimeSpan? BreakStartTime { get; set; }
    public TimeSpan? BreakEndTime { get; set; }
    public int BreakDurationMinutes { get; set; }
    public decimal? NightShiftAllowancePercentage { get; set; }
    public int? GracePeriodMinutes { get; set; }
    public int? EarlyDepartureThresholdMinutes { get; set; }
    public int? OvertimeThresholdMinutes { get; set; }
    public bool IsFlexible { get; set; }
    public TimeSpan? FlexibleStartTime { get; set; }
    public TimeSpan? FlexibleEndTime { get; set; }
}

/// <summary>
/// Data transfer object for WorkSchedule entity
/// </summary>
public class WorkScheduleDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int ShiftId { get; set; }
    public string ShiftName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool IsWorkDay { get; set; }
    public bool IsHoliday { get; set; }
    public string? HolidayName { get; set; }
    public TimeSpan? CustomStartTime { get; set; }
    public TimeSpan? CustomEndTime { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for assigning a work schedule
/// </summary>
public class AssignWorkScheduleDto
{
    public int EmployeeId { get; set; }
    public int ShiftId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool Monday { get; set; } = true;
    public bool Tuesday { get; set; } = true;
    public bool Wednesday { get; set; } = true;
    public bool Thursday { get; set; } = true;
    public bool Friday { get; set; } = true;
    public bool Saturday { get; set; }
    public bool Sunday { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for creating a work schedule
/// </summary>
public class CreateWorkScheduleDto
{
    public int EmployeeId { get; set; }
    public int ShiftId { get; set; }
    public DateTime Date { get; set; }
    public bool IsWorkDay { get; set; } = true;
    public TimeSpan? CustomStartTime { get; set; }
    public TimeSpan? CustomEndTime { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for updating a work schedule
/// </summary>
public class UpdateWorkScheduleDto
{
    public int ShiftId { get; set; }
    public bool IsWorkDay { get; set; } = true;
    public TimeSpan? CustomStartTime { get; set; }
    public TimeSpan? CustomEndTime { get; set; }
    public string? Notes { get; set; }
}
