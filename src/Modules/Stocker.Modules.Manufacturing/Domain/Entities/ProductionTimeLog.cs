using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Üretim zaman kaydı - İşçilik ve makine süreleri
/// </summary>
public class ProductionTimeLog : Entity<Guid>
{
    public Guid TenantId { get; private set; }
    public Guid ProductionOrderId { get; private set; }
    public Guid ProductionOperationId { get; private set; }
    public Guid? WorkCenterId { get; private set; }
    public Guid? MachineId { get; private set; }

    // Zaman Türü
    public string TimeType { get; private set; } = string.Empty; // Setup, Run, Wait, Move, Queue, Inspection
    public string? TimeCode { get; private set; }

    // Personel Bilgisi
    public Guid? EmployeeId { get; private set; }
    public string? EmployeeName { get; private set; }
    public string? EmployeeCode { get; private set; }

    // Zaman Bilgileri
    public DateTime StartTime { get; private set; }
    public DateTime? EndTime { get; private set; }
    public decimal DurationMinutes { get; private set; }
    public decimal? PlannedDurationMinutes { get; private set; }
    public decimal VarianceMinutes { get; private set; }

    // Üretim Miktarı
    public decimal ProducedQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }
    public decimal ReworkQuantity { get; private set; }
    public string UnitOfMeasure { get; private set; } = string.Empty;

    // Performans Metrikleri
    public decimal? CycleTime { get; private set; } // Dakika/Adet
    public decimal? StandardCycleTime { get; private set; }
    public decimal? EfficiencyRate { get; private set; } // %

    // Maliyet Bilgileri
    public decimal LaborCost { get; private set; }
    public decimal MachineCost { get; private set; }
    public decimal OverheadCost { get; private set; }
    public decimal TotalCost { get; private set; }
    public decimal HourlyRate { get; private set; }

    // Vardiya Bilgisi
    public Guid? ShiftId { get; private set; }
    public string? ShiftCode { get; private set; }

    // Kesinti/Duraksamalar
    public decimal InterruptionMinutes { get; private set; }
    public string? InterruptionReason { get; private set; }

    // Onay Durumu
    public string Status { get; private set; } = "Açık"; // Açık, Onaylandı, Reddedildi
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedAt { get; private set; }

    public string? Notes { get; private set; }

    public Guid CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Guid? ModifiedBy { get; private set; }
    public DateTime? ModifiedAt { get; private set; }

    // Navigation
    public virtual ProductionOrder? ProductionOrder { get; private set; }
    public virtual ProductionOperation? ProductionOperation { get; private set; }
    public virtual WorkCenter? WorkCenter { get; private set; }
    public virtual Machine? Machine { get; private set; }

    private ProductionTimeLog() { }

    public ProductionTimeLog(
        Guid id,
        Guid tenantId,
        Guid productionOrderId,
        Guid productionOperationId,
        string timeType,
        DateTime startTime,
        Guid createdBy)
    {
        Id = id;
        TenantId = tenantId;
        ProductionOrderId = productionOrderId;
        ProductionOperationId = productionOperationId;
        TimeType = timeType;
        StartTime = startTime;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetWorkCenter(Guid workCenterId, Guid? machineId = null)
    {
        WorkCenterId = workCenterId;
        MachineId = machineId;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetEmployee(Guid employeeId, string employeeName, string employeeCode, decimal hourlyRate)
    {
        EmployeeId = employeeId;
        EmployeeName = employeeName;
        EmployeeCode = employeeCode;
        HourlyRate = hourlyRate;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetShift(Guid shiftId, string shiftCode)
    {
        ShiftId = shiftId;
        ShiftCode = shiftCode;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetPlannedDuration(decimal plannedMinutes)
    {
        PlannedDurationMinutes = plannedMinutes;
        CalculateVariance();
        ModifiedAt = DateTime.UtcNow;
    }

    public void End(DateTime endTime, decimal producedQty, decimal scrapQty = 0, decimal reworkQty = 0)
    {
        EndTime = endTime;
        DurationMinutes = (decimal)(endTime - StartTime).TotalMinutes;
        ProducedQuantity = producedQty;
        ScrapQuantity = scrapQty;
        ReworkQuantity = reworkQty;

        CalculateVariance();
        CalculatePerformance();
        CalculateCosts();

        ModifiedAt = DateTime.UtcNow;
    }

    private void CalculateVariance()
    {
        if (PlannedDurationMinutes.HasValue && DurationMinutes > 0)
            VarianceMinutes = DurationMinutes - PlannedDurationMinutes.Value;
    }

    private void CalculatePerformance()
    {
        if (ProducedQuantity > 0 && DurationMinutes > 0)
        {
            CycleTime = DurationMinutes / ProducedQuantity;

            if (StandardCycleTime.HasValue && StandardCycleTime.Value > 0)
                EfficiencyRate = (StandardCycleTime.Value / CycleTime.Value) * 100;
        }
    }

    private void CalculateCosts()
    {
        var hours = DurationMinutes / 60;
        LaborCost = hours * HourlyRate;
        TotalCost = LaborCost + MachineCost + OverheadCost;
    }

    public void SetStandardCycleTime(decimal standardTime)
    {
        StandardCycleTime = standardTime;
        CalculatePerformance();
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetMachineCost(decimal cost)
    {
        MachineCost = cost;
        TotalCost = LaborCost + MachineCost + OverheadCost;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetOverheadCost(decimal cost)
    {
        OverheadCost = cost;
        TotalCost = LaborCost + MachineCost + OverheadCost;
        ModifiedAt = DateTime.UtcNow;
    }

    public void RecordInterruption(decimal minutes, string reason)
    {
        InterruptionMinutes = minutes;
        InterruptionReason = reason;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedBy)
    {
        if (!EndTime.HasValue)
            throw new InvalidOperationException("Tamamlanmamış kayıt onaylanamaz.");

        Status = "Onaylandı";
        ApprovedBy = approvedBy;
        ApprovedAt = DateTime.UtcNow;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Reject(Guid modifiedBy, string reason)
    {
        Status = "Reddedildi";
        Notes = reason;
        ModifiedBy = modifiedBy;
        ModifiedAt = DateTime.UtcNow;
    }
}
