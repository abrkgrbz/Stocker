using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Çalışma takvimi entity'si
/// </summary>
public class WorkSchedule : BaseEntity
{
    public int EmployeeId { get; private set; }
    public int ShiftId { get; private set; }
    public DateTime Date { get; private set; }
    public bool IsWorkDay { get; private set; }
    public bool IsHoliday { get; private set; }
    public string? HolidayName { get; private set; }
    public TimeSpan? CustomStartTime { get; private set; }
    public TimeSpan? CustomEndTime { get; private set; }
    public string? Notes { get; private set; }

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Shift Shift { get; private set; } = null!;

    protected WorkSchedule() { }

    public WorkSchedule(
        int employeeId,
        int shiftId,
        DateTime date,
        bool isWorkDay = true)
    {
        EmployeeId = employeeId;
        ShiftId = shiftId;
        Date = date.Date;
        IsWorkDay = isWorkDay;
        IsHoliday = false;
    }

    public void SetAsHoliday(string holidayName)
    {
        IsHoliday = true;
        HolidayName = holidayName;
        IsWorkDay = false;
    }

    public void SetCustomHours(TimeSpan startTime, TimeSpan endTime)
    {
        CustomStartTime = startTime;
        CustomEndTime = endTime;
    }

    public void ClearCustomHours()
    {
        CustomStartTime = null;
        CustomEndTime = null;
    }

    public void SetAsNonWorkDay()
    {
        IsWorkDay = false;
    }

    public void SetAsWorkDay()
    {
        IsWorkDay = true;
        IsHoliday = false;
        HolidayName = null;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void ChangeShift(int shiftId)
    {
        ShiftId = shiftId;
    }
}
