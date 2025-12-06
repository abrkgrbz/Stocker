using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Attendance entity
/// </summary>
public class AttendanceDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public DateTime Date { get; set; }
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public decimal? WorkedHours { get; set; }
    public decimal? OvertimeHours { get; set; }
    public decimal? LateMinutes { get; set; }
    public decimal? EarlyDepartureMinutes { get; set; }
    public AttendanceStatus Status { get; set; }
    public int? ShiftId { get; set; }
    public string? ShiftName { get; set; }
    public string? CheckInSource { get; set; }
    public string? CheckOutSource { get; set; }
    public decimal? CheckInLatitude { get; set; }
    public decimal? CheckInLongitude { get; set; }
    public decimal? CheckOutLatitude { get; set; }
    public decimal? CheckOutLongitude { get; set; }
    public bool IsManualEntry { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for employee attendance summary
/// </summary>
public class AttendanceSummaryDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public int TotalWorkDays { get; set; }
    public int PresentDays { get; set; }
    public int AbsentDays { get; set; }
    public int LateDays { get; set; }
    public int EarlyDepartureDays { get; set; }
    public int LeaveDays { get; set; }
    public int HolidayDays { get; set; }
    public decimal TotalWorkedHours { get; set; }
    public decimal TotalOvertimeHours { get; set; }
    public decimal TotalLateMinutes { get; set; }
    public decimal AttendancePercentage => TotalWorkDays > 0 ? (decimal)PresentDays / TotalWorkDays * 100 : 0;
}

/// <summary>
/// DTO for manual check-in
/// </summary>
public class ManualCheckInDto
{
    public int EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public DateTime CheckInTime { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for manual check-out
/// </summary>
public class ManualCheckOutDto
{
    public int EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public DateTime CheckOutTime { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for check-in with location
/// </summary>
public class CheckInDto
{
    public int EmployeeId { get; set; }
    public DateTime? CheckInTime { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? IpAddress { get; set; }
    public string? DeviceInfo { get; set; }
}

/// <summary>
/// DTO for check-out with location
/// </summary>
public class CheckOutDto
{
    public int EmployeeId { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? IpAddress { get; set; }
    public string? DeviceInfo { get; set; }
}

/// <summary>
/// DTO for daily attendance report
/// </summary>
public class DailyAttendanceReportDto
{
    public DateTime Date { get; set; }
    public int TotalEmployees { get; set; }
    public int Present { get; set; }
    public int Absent { get; set; }
    public int Late { get; set; }
    public int OnLeave { get; set; }
    public int Holiday { get; set; }
    public List<AttendanceDto> Attendances { get; set; } = new();
}

/// <summary>
/// DTO for daily attendance summary
/// </summary>
public class DailyAttendanceSummaryDto
{
    public DateTime Date { get; set; }
    public int TotalEmployees { get; set; }
    public int PresentCount { get; set; }
    public int AbsentCount { get; set; }
    public int LateCount { get; set; }
    public int OnLeaveCount { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public decimal AttendanceRate => TotalEmployees > 0 ? (decimal)PresentCount / TotalEmployees * 100 : 0;
    public List<AttendanceDto> Records { get; set; } = new();
}

/// <summary>
/// DTO for attendance report (monthly/period)
/// </summary>
public class AttendanceReportDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int TotalWorkDays { get; set; }
    public int PresentDays { get; set; }
    public int AbsentDays { get; set; }
    public int LateDays { get; set; }
    public int LeaveDays { get; set; }
    public int HolidayDays { get; set; }
    public decimal TotalWorkedHours { get; set; }
    public decimal TotalOvertimeHours { get; set; }
    public decimal TotalLateMinutes { get; set; }
    public decimal AttendancePercentage => TotalWorkDays > 0 ? (decimal)PresentDays / TotalWorkDays * 100 : 0;
    public List<AttendanceSummaryDto> EmployeeSummaries { get; set; } = new();
}

/// <summary>
/// DTO for updating attendance record
/// </summary>
public class UpdateAttendanceDto
{
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public AttendanceStatus? Status { get; set; }
    public string? Notes { get; set; }
    public bool IsManualEntry { get; set; } = true;
}
