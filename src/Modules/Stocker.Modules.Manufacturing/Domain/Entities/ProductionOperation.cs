using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Events;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Üretim Operasyonu - Üretim emri için gerçekleştirilen operasyon kaydı
/// </summary>
public class ProductionOperation : BaseEntity
{
    public int ProductionOrderId { get; private set; }
    public int OperationId { get; private set; }
    public int WorkCenterId { get; private set; }
    public int? MachineId { get; private set; }
    public int Sequence { get; private set; }
    public ProductionOperationStatus Status { get; private set; }
    
    // Planlanan süreler (dakika)
    public decimal PlannedSetupTime { get; private set; }
    public decimal PlannedRunTime { get; private set; }
    public decimal PlannedQueueTime { get; private set; }
    public decimal PlannedMoveTime { get; private set; }
    public decimal TotalPlannedTime { get; private set; }
    
    // Gerçekleşen süreler (dakika)
    public decimal ActualSetupTime { get; private set; }
    public decimal ActualRunTime { get; private set; }
    public decimal ActualQueueTime { get; private set; }
    public decimal ActualMoveTime { get; private set; }
    public decimal TotalActualTime { get; private set; }
    
    // Tarihler
    public DateTime? PlannedStartDate { get; private set; }
    public DateTime? PlannedEndDate { get; private set; }
    public DateTime? ActualStartDate { get; private set; }
    public DateTime? ActualEndDate { get; private set; }
    
    // Miktar
    public decimal PlannedQuantity { get; private set; }
    public decimal CompletedQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }
    public decimal ReworkQuantity { get; private set; }
    
    // Maliyet
    public decimal? PlannedLaborCost { get; private set; }
    public decimal? PlannedMachineCost { get; private set; }
    public decimal? PlannedOverheadCost { get; private set; }
    public decimal? ActualLaborCost { get; private set; }
    public decimal? ActualMachineCost { get; private set; }
    public decimal? ActualOverheadCost { get; private set; }
    
    // Operatör bilgileri
    public string? OperatorId { get; private set; }
    public string? OperatorName { get; private set; }
    
    // Fason
    public bool IsSubcontracted { get; private set; }
    public int? SubcontractorId { get; private set; }
    public string? SubcontractPurchaseOrderNumber { get; private set; }
    
    // Kalite
    public bool RequiresInspection { get; private set; }
    public bool InspectionCompleted { get; private set; }
    public bool InspectionPassed { get; private set; }
    
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual ProductionOrder ProductionOrder { get; private set; } = null!;
    public virtual Operation Operation { get; private set; } = null!;
    public virtual WorkCenter WorkCenter { get; private set; } = null!;
    public virtual Machine? Machine { get; private set; }
    public virtual ICollection<ProductionTimeLog> TimeLogs { get; private set; } = new List<ProductionTimeLog>();

    protected ProductionOperation() { }

    public ProductionOperation(int productionOrderId, int operationId, int workCenterId, int sequence, decimal plannedQuantity)
    {
        ProductionOrderId = productionOrderId;
        OperationId = operationId;
        WorkCenterId = workCenterId;
        Sequence = sequence;
        PlannedQuantity = plannedQuantity;
        Status = ProductionOperationStatus.Beklemede;
        CompletedQuantity = 0;
        ScrapQuantity = 0;
        ReworkQuantity = 0;
        ActualSetupTime = 0;
        ActualRunTime = 0;
        ActualQueueTime = 0;
        ActualMoveTime = 0;
        TotalActualTime = 0;
        IsActive = true;
    }

    public void SetPlannedTimes(decimal setupTime, decimal runTime, decimal queueTime, decimal moveTime)
    {
        PlannedSetupTime = setupTime;
        PlannedRunTime = runTime;
        PlannedQueueTime = queueTime;
        PlannedMoveTime = moveTime;
        TotalPlannedTime = setupTime + runTime + queueTime + moveTime;
    }

    public void SetPlannedDates(DateTime startDate, DateTime endDate)
    {
        PlannedStartDate = startDate;
        PlannedEndDate = endDate;
    }

    public void SetPlannedCosts(decimal laborCost, decimal machineCost, decimal overheadCost)
    {
        PlannedLaborCost = laborCost;
        PlannedMachineCost = machineCost;
        PlannedOverheadCost = overheadCost;
    }

    public void SetMachine(int? machineId)
    {
        MachineId = machineId;
    }

    public void SetOperator(string? operatorId, string? operatorName)
    {
        OperatorId = operatorId;
        OperatorName = operatorName;
    }

    public void SetSubcontracting(bool isSubcontracted, int? subcontractorId, string? purchaseOrderNumber)
    {
        IsSubcontracted = isSubcontracted;
        SubcontractorId = subcontractorId;
        SubcontractPurchaseOrderNumber = purchaseOrderNumber;
    }

    public void SetInspectionRequirement(bool requiresInspection)
    {
        RequiresInspection = requiresInspection;
    }

    public void SetNotes(string? notes) => Notes = notes;

    #region Status Transitions

    public void Start()
    {
        if (Status != ProductionOperationStatus.Beklemede && Status != ProductionOperationStatus.Hazır)
        {
            throw new InvalidOperationException("Sadece bekleyen veya hazır durumundaki operasyonlar başlatılabilir");
        }

        Status = ProductionOperationStatus.Devam_Ediyor;
        ActualStartDate = DateTime.UtcNow;

        RaiseDomainEvent(new ProductionOperationStartedDomainEvent(
            Id, TenantId, ProductionOrderId, OperationId, WorkCenterId, Sequence));
    }

    public void Pause(string reason)
    {
        if (Status != ProductionOperationStatus.Devam_Ediyor)
        {
            throw new InvalidOperationException("Sadece devam eden operasyonlar duraklatılabilir");
        }

        Status = ProductionOperationStatus.Duraklatıldı;
        Notes = $"Duraklatma nedeni: {reason}. {Notes}";

        RaiseDomainEvent(new ProductionOperationPausedDomainEvent(
            Id, TenantId, ProductionOrderId, OperationId, reason));
    }

    public void Resume()
    {
        if (Status != ProductionOperationStatus.Duraklatıldı)
        {
            throw new InvalidOperationException("Sadece duraklatılmış operasyonlar devam ettirilebilir");
        }

        Status = ProductionOperationStatus.Devam_Ediyor;
    }

    public void Complete()
    {
        if (Status != ProductionOperationStatus.Devam_Ediyor)
        {
            throw new InvalidOperationException("Sadece devam eden operasyonlar tamamlanabilir");
        }

        Status = ProductionOperationStatus.Tamamlandı;
        ActualEndDate = DateTime.UtcNow;
        CalculateTotalActualTime();

        RaiseDomainEvent(new ProductionOperationCompletedDomainEvent(
            Id, TenantId, ProductionOrderId, OperationId, CompletedQuantity, ScrapQuantity, TotalActualTime));
    }

    public void Cancel(string reason)
    {
        if (Status == ProductionOperationStatus.Tamamlandı || Status == ProductionOperationStatus.İptal)
        {
            throw new InvalidOperationException("Tamamlanmış veya iptal edilmiş operasyonlar iptal edilemez");
        }

        Status = ProductionOperationStatus.İptal;
        Notes = $"İptal nedeni: {reason}. {Notes}";
    }

    #endregion

    #region Time Recording

    public void RecordSetupTime(decimal minutes)
    {
        ActualSetupTime += minutes;
        CalculateTotalActualTime();
    }

    public void RecordRunTime(decimal minutes)
    {
        ActualRunTime += minutes;
        CalculateTotalActualTime();
    }

    public void RecordQueueTime(decimal minutes)
    {
        ActualQueueTime += minutes;
        CalculateTotalActualTime();
    }

    public void RecordMoveTime(decimal minutes)
    {
        ActualMoveTime += minutes;
        CalculateTotalActualTime();
    }

    private void CalculateTotalActualTime()
    {
        TotalActualTime = ActualSetupTime + ActualRunTime + ActualQueueTime + ActualMoveTime;
    }

    #endregion

    #region Quantity Recording

    public void RecordCompletion(decimal quantity)
    {
        CompletedQuantity += quantity;
    }

    public void RecordScrap(decimal quantity)
    {
        ScrapQuantity += quantity;
    }

    public void RecordRework(decimal quantity)
    {
        ReworkQuantity += quantity;
    }

    #endregion

    #region Cost Recording

    public void UpdateActualCosts(decimal laborCost, decimal machineCost, decimal overheadCost)
    {
        ActualLaborCost = laborCost;
        ActualMachineCost = machineCost;
        ActualOverheadCost = overheadCost;
    }

    #endregion

    #region Quality

    public void RecordInspectionResult(bool passed)
    {
        InspectionCompleted = true;
        InspectionPassed = passed;
    }

    #endregion

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    /// <summary>
    /// Verimlilik oranını hesaplar
    /// </summary>
    public decimal CalculateEfficiency()
    {
        if (TotalActualTime <= 0 || TotalPlannedTime <= 0)
            return 0;

        return (TotalPlannedTime / TotalActualTime) * 100;
    }

    /// <summary>
    /// Kalite oranını hesaplar
    /// </summary>
    public decimal CalculateQualityRate()
    {
        var totalOutput = CompletedQuantity + ScrapQuantity;
        if (totalOutput <= 0)
            return 100;

        return (CompletedQuantity / totalOutput) * 100;
    }
}
