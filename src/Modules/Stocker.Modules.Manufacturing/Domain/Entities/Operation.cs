using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Events;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Operasyon - Üretim rotasındaki bir iş adımı
/// </summary>
public class Operation : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public int RoutingId { get; private set; }
    public int WorkCenterId { get; private set; }
    public int? MachineId { get; private set; }
    public int Sequence { get; private set; }
    public OperationType Type { get; private set; }
    
    // Süre tanımları (dakika cinsinden)
    public decimal SetupTime { get; private set; }
    public decimal RunTime { get; private set; }
    public decimal RunTimePerUnit { get; private set; }
    public decimal QueueTime { get; private set; }
    public decimal MoveTime { get; private set; }
    public decimal WaitTime { get; private set; }
    
    // Kapasite
    public decimal UnitsPerHour { get; private set; }
    public int SimultaneousUnits { get; private set; }
    public int? MinimumWorkers { get; private set; }
    public int? MaximumWorkers { get; private set; }
    public int NumberOfMachines { get; private set; }
    
    // Maliyet
    public decimal? LaborCostPerHour { get; private set; }
    public decimal? MachineCostPerHour { get; private set; }
    public decimal? OverheadCostPerHour { get; private set; }
    public decimal? SetupCost { get; private set; }
    public decimal? RunCost { get; private set; }
    public decimal? MachineCost { get; private set; }
    public decimal? OverheadCost { get; private set; }
    public decimal? TotalCost { get; private set; }
    
    // Fason (Subcontracting)
    public bool IsSubcontracted { get; private set; }
    public int? SubcontractorId { get; private set; }
    public decimal? SubcontractCost { get; private set; }
    public int SubcontractLeadTimeDays { get; private set; }
    
    // Kalite
    public bool RequiresQualityCheck { get; private set; }
    public bool IsMilestone { get; private set; }
    public int? QualityPlanId { get; private set; }
    public decimal ScrapRate { get; private set; }
    public decimal ReworkRate { get; private set; }
    
    // Alternatif operasyon
    public int? AlternativeOperationId { get; private set; }
    public int AlternativePriority { get; private set; }
    
    // Bağımlılıklar
    public bool CanOverlap { get; private set; }
    public decimal OverlapPercent { get; private set; }
    public string? PredecessorOperations { get; private set; }
    
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual Routing Routing { get; private set; } = null!;
    public virtual WorkCenter WorkCenter { get; private set; } = null!;
    public virtual Machine? Machine { get; private set; }
    public virtual Operation? AlternativeOperation { get; private set; }
    public virtual ICollection<OperationResource> Resources { get; private set; } = new List<OperationResource>();

    protected Operation() { }

    public Operation(string code, string name, int routingId, int workCenterId, int sequence)
    {
        Code = code;
        Name = name;
        RoutingId = routingId;
        WorkCenterId = workCenterId;
        Sequence = sequence;
        Type = OperationType.Üretim;
        SetupTime = 0;
        RunTime = 0;
        RunTimePerUnit = 0;
        QueueTime = 0;
        MoveTime = 0;
        WaitTime = 0;
        UnitsPerHour = 1;
        SimultaneousUnits = 1;
        MinimumWorkers = 1;
        MaximumWorkers = 1;
        NumberOfMachines = 1;
        ScrapRate = 0;
        ReworkRate = 0;
        AlternativePriority = 1;
        CanOverlap = false;
        OverlapPercent = 0;
        IsActive = true;
    }

    public void Update(string name, string? description, int workCenterId, int sequence)
    {
        Name = name;
        Description = description;
        WorkCenterId = workCenterId;
        Sequence = sequence;

        RaiseDomainEvent(new OperationUpdatedDomainEvent(Id, TenantId, Code, Name, RoutingId, WorkCenterId));
    }

    public void SetType(OperationType type)
    {
        Type = type;
    }

    public void SetMachine(int? machineId)
    {
        MachineId = machineId;
    }

    public void SetTimes(decimal setupTime, decimal runTime, decimal runTimePerUnit, decimal queueTime, decimal moveTime, decimal waitTime)
    {
        SetupTime = setupTime;
        RunTime = runTime;
        RunTimePerUnit = runTimePerUnit;
        QueueTime = queueTime;
        MoveTime = moveTime;
        WaitTime = waitTime;
    }

    public void SetCapacity(decimal unitsPerHour, int simultaneousUnits, int? minWorkers, int? maxWorkers, int numberOfMachines)
    {
        UnitsPerHour = unitsPerHour;
        SimultaneousUnits = simultaneousUnits;
        MinimumWorkers = minWorkers;
        MaximumWorkers = maxWorkers;
        NumberOfMachines = numberOfMachines;
    }

    public void SetCosts(decimal? laborCostPerHour, decimal? machineCostPerHour, decimal? overheadCostPerHour, decimal? setupCost)
    {
        LaborCostPerHour = laborCostPerHour;
        MachineCostPerHour = machineCostPerHour;
        OverheadCostPerHour = overheadCostPerHour;
        SetupCost = setupCost;
    }

    public void SetSubcontracting(bool isSubcontracted, int? subcontractorId, decimal? subcontractCost, int leadTimeDays)
    {
        IsSubcontracted = isSubcontracted;
        SubcontractorId = subcontractorId;
        SubcontractCost = subcontractCost;
        SubcontractLeadTimeDays = leadTimeDays;
    }

    public void SetQualityRequirements(bool requiresQualityCheck, bool isMilestone, int? qualityPlanId, decimal scrapRate, decimal reworkRate)
    {
        RequiresQualityCheck = requiresQualityCheck;
        IsMilestone = isMilestone;
        QualityPlanId = qualityPlanId;
        ScrapRate = scrapRate;
        ReworkRate = reworkRate;
    }

    public void SetAlternative(int? alternativeOperationId, int priority)
    {
        AlternativeOperationId = alternativeOperationId;
        AlternativePriority = priority;
    }

    public void SetOverlap(bool canOverlap, decimal overlapPercent, string? predecessorOperations)
    {
        CanOverlap = canOverlap;
        OverlapPercent = overlapPercent;
        PredecessorOperations = predecessorOperations;
    }

    public void SetNotes(string? notes) => Notes = notes;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    /// <summary>
    /// Belirli bir miktar için toplam operasyon süresini hesaplar (dakika)
    /// </summary>
    public decimal CalculateOperationTime(decimal quantity, decimal baseQuantity)
    {
        var adjustedQuantity = quantity / baseQuantity;
        return SetupTime + (RunTimePerUnit * adjustedQuantity) + QueueTime + MoveTime + WaitTime;
    }

    /// <summary>
    /// Operasyon maliyetini hesaplar ve kaydeder
    /// </summary>
    public decimal CalculateOperationCost(decimal quantity, decimal baseQuantity)
    {
        if (IsSubcontracted && SubcontractCost.HasValue)
        {
            TotalCost = SubcontractCost.Value * (quantity / baseQuantity);
            return TotalCost.Value;
        }

        var hours = CalculateOperationTime(quantity, baseQuantity) / 60;
        var workerCount = MaximumWorkers ?? MinimumWorkers ?? 1;
        
        RunCost = (LaborCostPerHour ?? 0) * hours * workerCount;
        MachineCost = (MachineCostPerHour ?? 0) * hours * NumberOfMachines;
        OverheadCost = (OverheadCostPerHour ?? 0) * hours;
        TotalCost = (SetupCost ?? 0) + RunCost + MachineCost + OverheadCost;

        return TotalCost.Value;
    }
}
