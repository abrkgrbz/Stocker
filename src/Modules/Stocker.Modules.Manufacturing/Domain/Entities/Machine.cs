using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Events;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Makine/Ekipman tanımı
/// </summary>
public class Machine : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public int WorkCenterId { get; private set; }
    public MachineStatus Status { get; private set; }
    
    // Teknik bilgiler
    public string? SerialNumber { get; private set; }
    public string? Model { get; private set; }
    public string? Manufacturer { get; private set; }
    public DateTime? PurchaseDate { get; private set; }
    public DateTime? InstallationDate { get; private set; }
    public DateTime? WarrantyExpiryDate { get; private set; }
    
    // Kapasite ve performans
    public decimal HourlyCapacity { get; private set; }
    public decimal EfficiencyRate { get; private set; }
    public decimal PowerConsumptionKw { get; private set; }
    
    // Maliyet
    public decimal HourlyCost { get; private set; }
    public decimal SetupCost { get; private set; }
    public decimal MaintenanceCostPerHour { get; private set; }
    
    // Bakım bilgileri
    public DateTime? LastMaintenanceDate { get; private set; }
    public DateTime? NextMaintenanceDate { get; private set; }
    public int MaintenanceIntervalDays { get; private set; }
    public decimal TotalOperatingHours { get; private set; }
    
    // OEE metrikleri
    public decimal AvailabilityRate { get; private set; }
    public decimal PerformanceRate { get; private set; }
    public decimal QualityRate { get; private set; }
    
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }

    // Navigation properties
    public virtual WorkCenter WorkCenter { get; private set; } = null!;
    public virtual ICollection<MachineDowntime> Downtimes { get; private set; } = new List<MachineDowntime>();
    public virtual ICollection<ProductionOperation> ProductionOperations { get; private set; } = new List<ProductionOperation>();

    protected Machine() { }

    public Machine(string code, string name, int workCenterId)
    {
        Code = code;
        Name = name;
        WorkCenterId = workCenterId;
        Status = MachineStatus.Boşta;
        HourlyCapacity = 1;
        EfficiencyRate = 100;
        AvailabilityRate = 100;
        PerformanceRate = 100;
        QualityRate = 100;
        IsActive = true;
        DisplayOrder = 0;
    }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;

        RaiseDomainEvent(new MachineUpdatedDomainEvent(Id, TenantId, Code, Name, WorkCenterId));
    }

    public void SetTechnicalInfo(string? serialNumber, string? model, string? manufacturer, 
        DateTime? purchaseDate, DateTime? installationDate, DateTime? warrantyExpiryDate)
    {
        SerialNumber = serialNumber;
        Model = model;
        Manufacturer = manufacturer;
        PurchaseDate = purchaseDate;
        InstallationDate = installationDate;
        WarrantyExpiryDate = warrantyExpiryDate;
    }

    public void SetCapacity(decimal hourlyCapacity, decimal efficiencyRate, decimal powerConsumptionKw)
    {
        HourlyCapacity = hourlyCapacity;
        EfficiencyRate = efficiencyRate;
        PowerConsumptionKw = powerConsumptionKw;
    }

    public void SetCosts(decimal hourlyCost, decimal setupCost, decimal maintenanceCostPerHour)
    {
        HourlyCost = hourlyCost;
        SetupCost = setupCost;
        MaintenanceCostPerHour = maintenanceCostPerHour;
    }

    public void SetMaintenanceSchedule(int intervalDays, DateTime? nextMaintenanceDate)
    {
        MaintenanceIntervalDays = intervalDays;
        NextMaintenanceDate = nextMaintenanceDate;
    }

    public void RecordMaintenance(DateTime maintenanceDate)
    {
        LastMaintenanceDate = maintenanceDate;
        NextMaintenanceDate = maintenanceDate.AddDays(MaintenanceIntervalDays);
    }

    public void UpdateOeeMetrics(decimal availabilityRate, decimal performanceRate, decimal qualityRate)
    {
        AvailabilityRate = availabilityRate;
        PerformanceRate = performanceRate;
        QualityRate = qualityRate;
    }

    public void AddOperatingHours(decimal hours)
    {
        TotalOperatingHours += hours;
    }

    public void ChangeStatus(MachineStatus newStatus)
    {
        var oldStatus = Status;
        Status = newStatus;

        RaiseDomainEvent(new MachineStatusChangedDomainEvent(Id, TenantId, Code, Name, oldStatus, newStatus));
    }

    public void SetDisplayOrder(int order) => DisplayOrder = order;

    public void Activate()
    {
        IsActive = true;
        RaiseDomainEvent(new MachineActivatedDomainEvent(Id, TenantId, Code, Name, WorkCenterId));
    }

    public void Deactivate()
    {
        IsActive = false;
        RaiseDomainEvent(new MachineDeactivatedDomainEvent(Id, TenantId, Code, Name, WorkCenterId));
    }

    /// <summary>
    /// OEE (Overall Equipment Effectiveness) hesaplar
    /// </summary>
    public decimal CalculateOee()
    {
        return (AvailabilityRate / 100) * (PerformanceRate / 100) * (QualityRate / 100) * 100;
    }
}
