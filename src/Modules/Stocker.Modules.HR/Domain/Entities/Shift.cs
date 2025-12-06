using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Vardiya entity'si
/// </summary>
public class Shift : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public ShiftType ShiftType { get; private set; }
    public TimeSpan StartTime { get; private set; }
    public TimeSpan EndTime { get; private set; }
    public TimeSpan? BreakStartTime { get; private set; }
    public TimeSpan? BreakEndTime { get; private set; }
    public int BreakDurationMinutes { get; private set; }
    public decimal WorkHours { get; private set; }
    public bool IsNightShift { get; private set; }
    public decimal NightShiftAllowance { get; private set; }
    public int GracePeriodMinutes { get; private set; }
    public bool IsFlexible { get; private set; }
    public TimeSpan? FlexibleStartMin { get; private set; }
    public TimeSpan? FlexibleStartMax { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation Properties
    public virtual ICollection<Employee> Employees { get; private set; }
    public virtual ICollection<WorkSchedule> WorkSchedules { get; private set; }

    protected Shift()
    {
        Code = string.Empty;
        Name = string.Empty;
        Employees = new List<Employee>();
        WorkSchedules = new List<WorkSchedule>();
    }

    public Shift(
        string code,
        string name,
        ShiftType shiftType,
        TimeSpan startTime,
        TimeSpan endTime,
        int breakDurationMinutes = 60,
        int gracePeriodMinutes = 15,
        string? description = null)
    {
        Code = code;
        Name = name;
        ShiftType = shiftType;
        StartTime = startTime;
        EndTime = endTime;
        BreakDurationMinutes = breakDurationMinutes;
        GracePeriodMinutes = gracePeriodMinutes;
        Description = description;
        WorkHours = CalculateWorkHours();
        IsNightShift = CheckIfNightShift();
        IsActive = true;
        Employees = new List<Employee>();
        WorkSchedules = new List<WorkSchedule>();
    }

    public void Update(
        string name,
        string? description,
        ShiftType shiftType,
        TimeSpan startTime,
        TimeSpan endTime,
        int breakDurationMinutes,
        int gracePeriodMinutes)
    {
        Name = name;
        Description = description;
        ShiftType = shiftType;
        StartTime = startTime;
        EndTime = endTime;
        BreakDurationMinutes = breakDurationMinutes;
        GracePeriodMinutes = gracePeriodMinutes;
        WorkHours = CalculateWorkHours();
        IsNightShift = CheckIfNightShift();
    }

    public void SetBreakTime(TimeSpan? breakStart, TimeSpan? breakEnd)
    {
        BreakStartTime = breakStart;
        BreakEndTime = breakEnd;
    }

    public void SetFlexibleHours(bool isFlexible, TimeSpan? flexStartMin = null, TimeSpan? flexStartMax = null)
    {
        IsFlexible = isFlexible;
        FlexibleStartMin = flexStartMin;
        FlexibleStartMax = flexStartMax;
    }

    public void SetNightShiftAllowance(decimal allowance)
    {
        NightShiftAllowance = allowance;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    private decimal CalculateWorkHours()
    {
        var totalMinutes = (EndTime - StartTime).TotalMinutes;
        if (totalMinutes < 0)
            totalMinutes += 24 * 60; // Gece yarısını geçen vardiyalar için

        return (decimal)(totalMinutes - BreakDurationMinutes) / 60;
    }

    private bool CheckIfNightShift()
    {
        // Gece 22:00 ile sabah 06:00 arası çalışma varsa gece vardiyası
        var nightStart = new TimeSpan(22, 0, 0);
        var nightEnd = new TimeSpan(6, 0, 0);

        return StartTime >= nightStart || EndTime <= nightEnd;
    }

    public bool IsLateArrival(TimeSpan arrivalTime)
    {
        var latestAllowedTime = StartTime.Add(TimeSpan.FromMinutes(GracePeriodMinutes));
        return arrivalTime > latestAllowedTime;
    }

    public bool IsEarlyDeparture(TimeSpan departureTime)
    {
        var earliestAllowedTime = EndTime.Subtract(TimeSpan.FromMinutes(GracePeriodMinutes));
        return departureTime < earliestAllowedTime;
    }
}
