using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// İş merkezi takvimi - Günlük kapasite ve çalışma planı
/// </summary>
public class WorkCenterCalendar : Entity<Guid>
{
    public Guid TenantId { get; private set; }
    public Guid WorkCenterId { get; private set; }
    public DateTime CalendarDate { get; private set; }

    // Çalışma Durumu
    public string DayType { get; private set; } = "Normal"; // Normal, Tatil, Bakım, Kapalı
    public bool IsWorkingDay { get; private set; } = true;
    public string? HolidayName { get; private set; }

    // Planlanan Kapasite
    public decimal PlannedCapacityHours { get; private set; }
    public decimal PlannedCapacityUnits { get; private set; }
    public int PlannedShiftCount { get; private set; }
    public int PlannedHeadcount { get; private set; }

    // Fiili Kapasite
    public decimal ActualCapacityHours { get; private set; }
    public decimal ActualCapacityUnits { get; private set; }
    public int ActualShiftCount { get; private set; }
    public int ActualHeadcount { get; private set; }

    // Kullanılan Kapasite
    public decimal AllocatedHours { get; private set; }
    public decimal AllocatedUnits { get; private set; }
    public decimal AvailableHours { get; private set; }
    public decimal AvailableUnits { get; private set; }
    public decimal UtilizationRate { get; private set; }

    // Verimlilik
    public decimal PlannedEfficiency { get; private set; } = 100;
    public decimal ActualEfficiency { get; private set; }

    // Kayıp Zamanlar
    public decimal DowntimeHours { get; private set; }
    public decimal SetupHours { get; private set; }
    public decimal MaintenanceHours { get; private set; }
    public decimal BreakHours { get; private set; }

    // Üretim Özeti
    public int ProductionOrderCount { get; private set; }
    public decimal ProducedQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }

    // Vardiya Detayları (JSON)
    public string? ShiftDetails { get; private set; }

    public string? Notes { get; private set; }
    public bool IsLocked { get; private set; }

    public Guid CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Guid? ModifiedBy { get; private set; }
    public DateTime? ModifiedAt { get; private set; }

    // Navigation
    public virtual WorkCenter? WorkCenter { get; private set; }

    private WorkCenterCalendar() { }

    public WorkCenterCalendar(
        Guid id,
        Guid tenantId,
        Guid workCenterId,
        DateTime calendarDate,
        Guid createdBy)
    {
        Id = id;
        TenantId = tenantId;
        WorkCenterId = workCenterId;
        CalendarDate = calendarDate.Date;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetDayType(string dayType, string? holidayName = null)
    {
        DayType = dayType;
        HolidayName = holidayName;
        IsWorkingDay = dayType == "Normal";

        if (!IsWorkingDay)
        {
            PlannedCapacityHours = 0;
            PlannedCapacityUnits = 0;
        }

        ModifiedAt = DateTime.UtcNow;
    }

    public void SetPlannedCapacity(decimal hours, decimal units, int shiftCount, int headcount)
    {
        PlannedCapacityHours = hours;
        PlannedCapacityUnits = units;
        PlannedShiftCount = shiftCount;
        PlannedHeadcount = headcount;
        CalculateAvailability();
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetActualCapacity(decimal hours, decimal units, int shiftCount, int headcount)
    {
        ActualCapacityHours = hours;
        ActualCapacityUnits = units;
        ActualShiftCount = shiftCount;
        ActualHeadcount = headcount;
        CalculateAvailability();
        ModifiedAt = DateTime.UtcNow;
    }

    public void AllocateCapacity(decimal hours, decimal units)
    {
        AllocatedHours += hours;
        AllocatedUnits += units;
        CalculateAvailability();
        ModifiedAt = DateTime.UtcNow;
    }

    public void ReleaseCapacity(decimal hours, decimal units)
    {
        AllocatedHours = Math.Max(0, AllocatedHours - hours);
        AllocatedUnits = Math.Max(0, AllocatedUnits - units);
        CalculateAvailability();
        ModifiedAt = DateTime.UtcNow;
    }

    private void CalculateAvailability()
    {
        var effectiveHours = ActualCapacityHours > 0 ? ActualCapacityHours : PlannedCapacityHours;
        var effectiveUnits = ActualCapacityUnits > 0 ? ActualCapacityUnits : PlannedCapacityUnits;

        AvailableHours = Math.Max(0, effectiveHours - AllocatedHours - DowntimeHours - SetupHours - MaintenanceHours);
        AvailableUnits = Math.Max(0, effectiveUnits - AllocatedUnits);

        if (effectiveHours > 0)
            UtilizationRate = (AllocatedHours / effectiveHours) * 100;
    }

    public void RecordLostTime(decimal downtime, decimal setup, decimal maintenance, decimal breaks)
    {
        DowntimeHours = downtime;
        SetupHours = setup;
        MaintenanceHours = maintenance;
        BreakHours = breaks;
        CalculateAvailability();
        ModifiedAt = DateTime.UtcNow;
    }

    public void RecordProduction(int orderCount, decimal produced, decimal scrap)
    {
        ProductionOrderCount = orderCount;
        ProducedQuantity = produced;
        ScrapQuantity = scrap;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetEfficiency(decimal planned, decimal actual)
    {
        PlannedEfficiency = planned;
        ActualEfficiency = actual;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Lock()
    {
        IsLocked = true;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Unlock()
    {
        IsLocked = false;
        ModifiedAt = DateTime.UtcNow;
    }

    public bool HasAvailableCapacity(decimal requiredHours)
    {
        return AvailableHours >= requiredHours;
    }
}
