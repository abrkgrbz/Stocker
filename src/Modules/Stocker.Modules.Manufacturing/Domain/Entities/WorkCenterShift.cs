using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// İş merkezi vardiya tanımı
/// </summary>
public class WorkCenterShift : Entity<Guid>
{
    public Guid TenantId { get; private set; }
    public Guid WorkCenterId { get; private set; }
    public string ShiftCode { get; private set; } = string.Empty;
    public string ShiftName { get; private set; } = string.Empty;

    // Zaman Bilgileri
    public TimeSpan StartTime { get; private set; }
    public TimeSpan EndTime { get; private set; }
    public decimal PlannedHours { get; private set; }
    public decimal BreakMinutes { get; private set; }
    public decimal EffectiveHours { get; private set; }

    // Günler (Pazartesi=1, Pazar=7)
    public bool Monday { get; private set; }
    public bool Tuesday { get; private set; }
    public bool Wednesday { get; private set; }
    public bool Thursday { get; private set; }
    public bool Friday { get; private set; }
    public bool Saturday { get; private set; }
    public bool Sunday { get; private set; }

    // Kapasite Bilgileri
    public int PlannedHeadcount { get; private set; }
    public decimal CapacityUtilization { get; private set; } = 100; // %
    public decimal PlannedEfficiency { get; private set; } = 100; // %

    // Maliyet Bilgileri
    public decimal HourlyLaborCost { get; private set; }
    public decimal ShiftPremiumRate { get; private set; } // Vardiya zammı %

    public bool IsActive { get; private set; } = true;
    public DateTime? ValidFrom { get; private set; }
    public DateTime? ValidTo { get; private set; }

    public Guid CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Guid? ModifiedBy { get; private set; }
    public DateTime? ModifiedAt { get; private set; }

    // Navigation
    public virtual WorkCenter? WorkCenter { get; private set; }

    private WorkCenterShift() { }

    public WorkCenterShift(
        Guid id,
        Guid tenantId,
        Guid workCenterId,
        string shiftCode,
        string shiftName,
        TimeSpan startTime,
        TimeSpan endTime,
        Guid createdBy)
    {
        Id = id;
        TenantId = tenantId;
        WorkCenterId = workCenterId;
        ShiftCode = shiftCode;
        ShiftName = shiftName;
        StartTime = startTime;
        EndTime = endTime;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;

        CalculateHours();
    }

    private void CalculateHours()
    {
        var duration = EndTime > StartTime
            ? EndTime - StartTime
            : TimeSpan.FromHours(24) - StartTime + EndTime; // Gece vardiyası

        PlannedHours = (decimal)duration.TotalHours;
        EffectiveHours = PlannedHours - (BreakMinutes / 60);
    }

    public void SetBreakTime(decimal breakMinutes)
    {
        BreakMinutes = breakMinutes;
        CalculateHours();
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetWorkDays(bool mon, bool tue, bool wed, bool thu, bool fri, bool sat, bool sun)
    {
        Monday = mon;
        Tuesday = tue;
        Wednesday = wed;
        Thursday = thu;
        Friday = fri;
        Saturday = sat;
        Sunday = sun;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetCapacity(int headcount, decimal utilization, decimal efficiency)
    {
        PlannedHeadcount = headcount;
        CapacityUtilization = utilization;
        PlannedEfficiency = efficiency;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetCosts(decimal hourlyLaborCost, decimal shiftPremiumRate)
    {
        HourlyLaborCost = hourlyLaborCost;
        ShiftPremiumRate = shiftPremiumRate;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetValidityPeriod(DateTime? from, DateTime? to)
    {
        ValidFrom = from;
        ValidTo = to;
        ModifiedAt = DateTime.UtcNow;
    }

    public bool IsValidOnDate(DateTime date)
    {
        if (!IsActive) return false;
        if (ValidFrom.HasValue && date < ValidFrom.Value) return false;
        if (ValidTo.HasValue && date > ValidTo.Value) return false;

        return date.DayOfWeek switch
        {
            DayOfWeek.Monday => Monday,
            DayOfWeek.Tuesday => Tuesday,
            DayOfWeek.Wednesday => Wednesday,
            DayOfWeek.Thursday => Thursday,
            DayOfWeek.Friday => Friday,
            DayOfWeek.Saturday => Saturday,
            DayOfWeek.Sunday => Sunday,
            _ => false
        };
    }

    public decimal GetAvailableHours(DateTime date)
    {
        if (!IsValidOnDate(date)) return 0;
        return EffectiveHours * (CapacityUtilization / 100) * (PlannedEfficiency / 100);
    }

    public void Activate() { IsActive = true; ModifiedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; ModifiedAt = DateTime.UtcNow; }
}
