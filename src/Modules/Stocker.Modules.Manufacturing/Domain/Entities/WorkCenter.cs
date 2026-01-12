using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Events;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// İş Merkezi / İş İstasyonu - Üretim operasyonlarının gerçekleştirildiği fiziksel veya mantıksal birim
/// </summary>
public class WorkCenter : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public WorkCenterType Type { get; private set; }
    public WorkCenterStatus Status { get; private set; }
    public int? ParentWorkCenterId { get; private set; }
    public int? WarehouseId { get; private set; }
    public int? LocationId { get; private set; }

    // Kapasite bilgileri
    public int Capacity { get; private set; }
    public string CapacityUnit { get; private set; } = "saat";
    public decimal DailyCapacityHours { get; private set; }
    public decimal EfficiencyRate { get; private set; }
    public int NumberOfMachines { get; private set; }
    public int NumberOfOperators { get; private set; }

    // Maliyet bilgileri
    public decimal HourlyMachineCost { get; private set; }
    public decimal HourlyLaborCost { get; private set; }
    public decimal HourlyOverheadCost { get; private set; }
    public decimal SetupCostPerHour { get; private set; }
    public decimal OverheadRate { get; private set; }
    public decimal TotalHourlyCost { get; private set; }

    // OEE bilgileri
    public decimal OEETarget { get; private set; }
    public decimal? LastOEE { get; private set; }

    // Maliyet merkezi
    public string? CostCenterId { get; private set; }

    // Planlama parametreleri
    public int QueueTimeDays { get; private set; }
    public int MoveTimeDays { get; private set; }
    public bool IsBottleneck { get; private set; }
    public bool AllowOverlap { get; private set; }

    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }

    // Navigation properties
    public virtual WorkCenter? ParentWorkCenter { get; private set; }
    public virtual ICollection<WorkCenter> ChildWorkCenters { get; private set; } = new List<WorkCenter>();
    public virtual ICollection<WorkCenterShift> Shifts { get; private set; } = new List<WorkCenterShift>();
    public virtual ICollection<WorkCenterCalendar> Calendars { get; private set; } = new List<WorkCenterCalendar>();
    public virtual ICollection<Operation> Operations { get; private set; } = new List<Operation>();
    public virtual ICollection<Machine> Machines { get; private set; } = new List<Machine>();

    protected WorkCenter() { }

    public WorkCenter(string code, string name, WorkCenterType type)
    {
        Code = code;
        Name = name;
        Type = type;
        Status = WorkCenterStatus.Aktif;
        Capacity = 8;
        CapacityUnit = "saat";
        DailyCapacityHours = 8;
        EfficiencyRate = 100;
        NumberOfMachines = 1;
        NumberOfOperators = 1;
        HourlyMachineCost = 0;
        HourlyLaborCost = 0;
        HourlyOverheadCost = 0;
        SetupCostPerHour = 0;
        OverheadRate = 0;
        TotalHourlyCost = 0;
        OEETarget = 85;
        IsActive = true;
        DisplayOrder = 0;
    }

    public void UpdateBasicInfo(string name, string? description, WorkCenterType type)
    {
        Name = name;
        Description = description;
        Type = type;

        RaiseDomainEvent(new WorkCenterUpdatedDomainEvent(Id, TenantId, Code, Name));
    }

    public void Update(string name, string? description, WorkCenterType type)
    {
        UpdateBasicInfo(name, description, type);
    }

    public void SetStatus(WorkCenterStatus status)
    {
        Status = status;
    }

    public void SetCapacity(int capacity, string capacityUnit, decimal efficiencyRate)
    {
        Capacity = capacity;
        CapacityUnit = capacityUnit;
        EfficiencyRate = efficiencyRate;
        DailyCapacityHours = capacity;
    }

    public void SetCapacity(decimal dailyCapacityHours, decimal efficiencyRate, int numberOfMachines, int numberOfOperators)
    {
        DailyCapacityHours = dailyCapacityHours;
        Capacity = (int)dailyCapacityHours;
        EfficiencyRate = efficiencyRate;
        NumberOfMachines = numberOfMachines;
        NumberOfOperators = numberOfOperators;
    }

    public void SetCosts(decimal hourlyMachineCost, decimal hourlyLaborCost, decimal hourlyOverheadCost)
    {
        HourlyMachineCost = hourlyMachineCost;
        HourlyLaborCost = hourlyLaborCost;
        HourlyOverheadCost = hourlyOverheadCost;
        CalculateTotalHourlyCost();
    }

    public void SetCosts(decimal hourlyMachineCost, decimal hourlyLaborCost, decimal setupCostPerHour, decimal overheadRate)
    {
        HourlyMachineCost = hourlyMachineCost;
        HourlyLaborCost = hourlyLaborCost;
        SetupCostPerHour = setupCostPerHour;
        OverheadRate = overheadRate;
        CalculateTotalHourlyCost();
    }

    public void SetOEETarget(decimal oeeTarget)
    {
        OEETarget = oeeTarget;
    }

    public void UpdateLastOEE(decimal oee)
    {
        LastOEE = oee;
    }

    public void SetCostCenter(string? costCenterId)
    {
        CostCenterId = costCenterId;
    }

    public void SetPlanningParameters(int queueTimeDays, int moveTimeDays, bool isBottleneck, bool allowOverlap)
    {
        QueueTimeDays = queueTimeDays;
        MoveTimeDays = moveTimeDays;
        IsBottleneck = isBottleneck;
        AllowOverlap = allowOverlap;
    }

    public void SetLocation(int? warehouseId, int? locationId)
    {
        WarehouseId = warehouseId;
        LocationId = locationId;
    }

    public void SetParent(int? parentWorkCenterId)
    {
        ParentWorkCenterId = parentWorkCenterId;
    }

    public void SetDisplayOrder(int order) => DisplayOrder = order;

    public void Activate()
    {
        IsActive = true;
        Status = WorkCenterStatus.Aktif;
        RaiseDomainEvent(new WorkCenterActivatedDomainEvent(Id, TenantId, Code, Name));
    }

    public void Deactivate()
    {
        IsActive = false;
        Status = WorkCenterStatus.Pasif;
        RaiseDomainEvent(new WorkCenterDeactivatedDomainEvent(Id, TenantId, Code, Name));
    }

    private void CalculateTotalHourlyCost()
    {
        TotalHourlyCost = HourlyMachineCost + HourlyLaborCost + HourlyOverheadCost;
    }

    /// <summary>
    /// Belirli bir tarih için kullanılabilir kapasiteyi hesaplar
    /// </summary>
    public decimal CalculateAvailableCapacity(DateTime date)
    {
        return DailyCapacityHours * (EfficiencyRate / 100) * NumberOfMachines;
    }
}
