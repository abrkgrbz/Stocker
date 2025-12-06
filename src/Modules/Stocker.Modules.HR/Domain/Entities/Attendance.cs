using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Devam/Yoklama entity'si
/// </summary>
public class Attendance : BaseEntity
{
    public int EmployeeId { get; private set; }
    public DateTime Date { get; private set; }
    public int? ShiftId { get; private set; }
    public TimeSpan? CheckInTime { get; private set; }
    public TimeSpan? CheckOutTime { get; private set; }
    public string? CheckInLocation { get; private set; }
    public string? CheckOutLocation { get; private set; }
    public decimal? CheckInLatitude { get; private set; }
    public decimal? CheckInLongitude { get; private set; }
    public decimal? CheckOutLatitude { get; private set; }
    public decimal? CheckOutLongitude { get; private set; }
    public TimeSpan? WorkHours { get; private set; }
    public TimeSpan? OvertimeHours { get; private set; }
    public TimeSpan? LateMinutes { get; private set; }
    public TimeSpan? EarlyDepartureMinutes { get; private set; }
    public AttendanceStatus Status { get; private set; }
    public string? Notes { get; private set; }
    public bool IsManualEntry { get; private set; }
    public int? ApprovedById { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public string? IpAddress { get; private set; }
    public string? DeviceInfo { get; private set; }

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Shift? Shift { get; private set; }
    public virtual Employee? ApprovedBy { get; private set; }

    protected Attendance() { }

    public Attendance(int employeeId, DateTime date, int? shiftId = null)
    {
        EmployeeId = employeeId;
        Date = date.Date;
        ShiftId = shiftId;
        Status = AttendanceStatus.Absent;
        IsManualEntry = false;
    }

    public void CheckIn(
        TimeSpan time,
        TimeSpan? expectedCheckIn = null,
        string? location = null,
        decimal? latitude = null,
        decimal? longitude = null,
        string? ipAddress = null,
        string? deviceInfo = null)
    {
        CheckInTime = time;
        CheckInLocation = location;
        CheckInLatitude = latitude;
        CheckInLongitude = longitude;
        IpAddress = ipAddress;
        DeviceInfo = deviceInfo;
        Status = AttendanceStatus.Present;

        if (expectedCheckIn.HasValue)
        {
            var gracePeriod = TimeSpan.FromMinutes(15);
            if (time > expectedCheckIn.Value.Add(gracePeriod))
            {
                LateMinutes = time - expectedCheckIn.Value;
                Status = AttendanceStatus.Late;
            }
        }
    }

    public void CheckOut(
        TimeSpan time,
        TimeSpan? expectedCheckOut = null,
        string? location = null,
        decimal? latitude = null,
        decimal? longitude = null)
    {
        CheckOutTime = time;
        CheckOutLocation = location;
        CheckOutLatitude = latitude;
        CheckOutLongitude = longitude;

        if (expectedCheckOut.HasValue)
        {
            var gracePeriod = TimeSpan.FromMinutes(15);
            if (time < expectedCheckOut.Value.Subtract(gracePeriod))
            {
                EarlyDepartureMinutes = expectedCheckOut.Value - time;
                if (Status == AttendanceStatus.Present)
                    Status = AttendanceStatus.EarlyDeparture;
            }
        }

        CalculateWorkHours();
    }

    private void CalculateWorkHours()
    {
        if (CheckInTime.HasValue && CheckOutTime.HasValue)
        {
            var totalTime = CheckOutTime.Value - CheckInTime.Value;
            if (totalTime.TotalMinutes < 0)
                totalTime = totalTime.Add(TimeSpan.FromHours(24)); // Gece vardiyası

            WorkHours = totalTime;

            var standardWorkHours = TimeSpan.FromHours(8);
            if (WorkHours > standardWorkHours)
            {
                OvertimeHours = WorkHours.Value - standardWorkHours;
            }
        }
    }

    public void MarkAsLeave(int? leaveId = null)
    {
        Status = AttendanceStatus.OnLeave;
        Notes = leaveId.HasValue ? $"Leave ID: {leaveId}" : "On Leave";
    }

    public void MarkAsHoliday(string? holidayName = null)
    {
        Status = AttendanceStatus.Holiday;
        Notes = holidayName ?? "Holiday";
    }

    public void MarkAsWeekend()
    {
        Status = AttendanceStatus.Weekend;
    }

    public void MarkAsRemoteWork()
    {
        Status = AttendanceStatus.RemoteWork;
    }

    public void MarkAsTraining(string? trainingName = null)
    {
        Status = AttendanceStatus.Training;
        Notes = trainingName;
    }

    public void MarkAsFieldWork(string? location = null)
    {
        Status = AttendanceStatus.FieldWork;
        Notes = location;
    }

    public void SetManualEntry(bool isManual)
    {
        IsManualEntry = isManual;
    }

    public void Approve(int approvedById)
    {
        ApprovedById = approvedById;
        ApprovedDate = DateTime.UtcNow;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void SetShift(int shiftId)
    {
        ShiftId = shiftId;
    }

    public void CorrectCheckIn(TimeSpan time, string reason)
    {
        CheckInTime = time;
        IsManualEntry = true;
        Notes = string.IsNullOrEmpty(Notes)
            ? $"Check-in corrected: {reason}"
            : $"{Notes}; Check-in corrected: {reason}";
        CalculateWorkHours();
    }

    public void CorrectCheckOut(TimeSpan time, string reason)
    {
        CheckOutTime = time;
        IsManualEntry = true;
        Notes = string.IsNullOrEmpty(Notes)
            ? $"Check-out corrected: {reason}"
            : $"{Notes}; Check-out corrected: {reason}";
        CalculateWorkHours();
    }
}
