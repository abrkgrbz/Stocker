using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Makine duruş kaydı - Planlı ve plansız duruşlar
/// </summary>
public class MachineDowntime : Entity<Guid>
{
    public Guid TenantId { get; private set; }
    public int MachineId { get; private set; }
    public int? WorkCenterId { get; private set; }
    public string DowntimeNumber { get; private set; } = string.Empty;

    // Duruş Türü
    public string DowntimeType { get; private set; } = string.Empty; // Planlı, Plansız
    public string DowntimeCategory { get; private set; } = string.Empty; // Arıza, Bakım, Setup, Malzeme Bekleme, Operatör, Kalite, Diğer
    public string DowntimeReason { get; private set; } = string.Empty;
    public string? DowntimeCode { get; private set; }

    // Zaman Bilgileri
    public DateTime StartTime { get; private set; }
    public DateTime? EndTime { get; private set; }
    public decimal DurationMinutes { get; private set; }
    public decimal? EstimatedDurationMinutes { get; private set; }

    // Etki Analizi
    public Guid? AffectedProductionOrderId { get; private set; }
    public Guid? AffectedOperationId { get; private set; }
    public decimal LostProductionQuantity { get; private set; }
    public decimal LostProductionValue { get; private set; }

    // Arıza Detayları (Plansız duruşlar için)
    public string? FailureMode { get; private set; }
    public string? FailureCause { get; private set; }
    public string? FailureEffect { get; private set; }
    public int? SeverityLevel { get; private set; } // 1-10

    // Onarım/Çözüm
    public string? RepairAction { get; private set; }
    public string? PreventiveAction { get; private set; }
    public decimal RepairCost { get; private set; }
    public string? SpareParts { get; private set; } // JSON array

    // Sorumlu Bilgileri
    public Guid? ReportedBy { get; private set; }
    public DateTime? ReportedAt { get; private set; }
    public Guid? AssignedTo { get; private set; }
    public Guid? ResolvedBy { get; private set; }
    public DateTime? ResolvedAt { get; private set; }

    // Bakım İş Emri (varsa)
    public string? MaintenanceWorkOrderId { get; private set; }

    // OEE Etkisi
    public bool AffectsOEE { get; private set; } = true;
    public string OEECategory { get; private set; } = string.Empty; // Kullanılabilirlik, Performans, Kalite

    public string Status { get; private set; } = "Açık"; // Açık, Devam Ediyor, Çözüldü, Kapatıldı
    public string? Notes { get; private set; }
    public string? Attachments { get; private set; }

    public Guid CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Guid? ModifiedBy { get; private set; }
    public DateTime? ModifiedAt { get; private set; }

    // Navigation
    public virtual Machine? Machine { get; private set; }
    public virtual WorkCenter? WorkCenter { get; private set; }
    public virtual ProductionOrder? AffectedProductionOrder { get; private set; }

    private MachineDowntime() { }

    public MachineDowntime(
        Guid id,
        Guid tenantId,
        int machineId,
        string downtimeNumber,
        string downtimeType,
        string downtimeCategory,
        string downtimeReason,
        DateTime startTime,
        Guid createdBy)
    {
        Id = id;
        TenantId = tenantId;
        MachineId = machineId;
        DowntimeNumber = downtimeNumber;
        DowntimeType = downtimeType;
        DowntimeCategory = downtimeCategory;
        DowntimeReason = downtimeReason;
        StartTime = startTime;
        ReportedAt = DateTime.UtcNow;
        ReportedBy = createdBy;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;

        SetOEECategory();
    }

    private void SetOEECategory()
    {
        OEECategory = DowntimeCategory switch
        {
            "Arıza" or "Bakım" or "Malzeme Bekleme" => "Kullanılabilirlik",
            "Setup" or "Operatör" => "Performans",
            "Kalite" => "Kalite",
            _ => "Kullanılabilirlik"
        };
    }

    public void SetWorkCenter(int workCenterId)
    {
        WorkCenterId = workCenterId;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetAffectedProduction(Guid productionOrderId, Guid? operationId = null)
    {
        AffectedProductionOrderId = productionOrderId;
        AffectedOperationId = operationId;
        ModifiedAt = DateTime.UtcNow;
    }

    public void RecordFailureDetails(string mode, string cause, string effect, int severity)
    {
        FailureMode = mode;
        FailureCause = cause;
        FailureEffect = effect;
        SeverityLevel = severity;
        ModifiedAt = DateTime.UtcNow;
    }

    public void AssignTechnician(Guid technicianId)
    {
        AssignedTo = technicianId;
        Status = "Devam Ediyor";
        ModifiedAt = DateTime.UtcNow;
    }

    public void RecordRepair(string action, decimal cost, string? spareParts = null, string? preventiveAction = null)
    {
        RepairAction = action;
        RepairCost = cost;
        SpareParts = spareParts;
        PreventiveAction = preventiveAction;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Resolve(Guid resolvedBy)
    {
        EndTime = DateTime.UtcNow;
        DurationMinutes = (decimal)(EndTime.Value - StartTime).TotalMinutes;
        ResolvedBy = resolvedBy;
        ResolvedAt = DateTime.UtcNow;
        Status = "Çözüldü";
        ModifiedAt = DateTime.UtcNow;
    }

    public void CalculateLoss(decimal quantity, decimal unitValue)
    {
        LostProductionQuantity = quantity;
        LostProductionValue = quantity * unitValue;
        ModifiedAt = DateTime.UtcNow;
    }

    public void LinkMaintenanceOrder(string workOrderId)
    {
        MaintenanceWorkOrderId = workOrderId;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Close(Guid modifiedBy)
    {
        if (Status != "Çözüldü")
            throw new InvalidOperationException("Duruş çözülmeden kapatılamaz.");

        Status = "Kapatıldı";
        ModifiedBy = modifiedBy;
        ModifiedAt = DateTime.UtcNow;
    }

    public void ExcludeFromOEE()
    {
        AffectsOEE = false;
        ModifiedAt = DateTime.UtcNow;
    }
}
