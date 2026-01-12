using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Operasyon Kaynağı - Operasyon için gerekli kaynak tanımı (işçilik, makine vb.)
/// </summary>
public class OperationResource : BaseEntity
{
    public int OperationId { get; private set; }
    public string ResourceType { get; private set; } = null!; // Labor, Machine, Tool, Material
    public string ResourceCode { get; private set; } = null!;
    public string ResourceName { get; private set; } = null!;

    // Miktar bilgileri
    public decimal RequiredQuantity { get; private set; }
    public string Unit { get; private set; } = null!;

    // Süre bilgileri (dakika)
    public decimal SetupTime { get; private set; }
    public decimal RunTimePerUnit { get; private set; }
    public decimal UsageTime { get; private set; }

    // Maliyet
    public decimal? HourlyCost { get; private set; }
    public decimal? SetupCost { get; private set; }
    public decimal? TotalEstimatedCost { get; private set; }

    // İlişkiler
    public int? WorkCenterId { get; private set; }
    public int? MachineId { get; private set; }
    public int? SkillLevelRequired { get; private set; }

    // Zamanlama
    public bool IsParallel { get; private set; }
    public int Sequence { get; private set; }

    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual Operation Operation { get; private set; } = null!;
    public virtual WorkCenter? WorkCenter { get; private set; }
    public virtual Machine? Machine { get; private set; }

    protected OperationResource() { }

    public OperationResource(
        int operationId,
        string resourceType,
        string resourceCode,
        string resourceName,
        decimal requiredQuantity,
        string unit,
        int sequence)
    {
        OperationId = operationId;
        ResourceType = resourceType;
        ResourceCode = resourceCode;
        ResourceName = resourceName;
        RequiredQuantity = requiredQuantity;
        Unit = unit;
        Sequence = sequence;
        SetupTime = 0;
        RunTimePerUnit = 0;
        UsageTime = 0;
        IsParallel = false;
        IsActive = true;
    }

    public void Update(string resourceName, decimal requiredQuantity, string unit)
    {
        ResourceName = resourceName;
        RequiredQuantity = requiredQuantity;
        Unit = unit;
    }

    public void SetTimes(decimal setupTime, decimal runTimePerUnit, decimal usageTime)
    {
        SetupTime = setupTime;
        RunTimePerUnit = runTimePerUnit;
        UsageTime = usageTime;
    }

    public void SetCosts(decimal? hourlyCost, decimal? setupCost)
    {
        HourlyCost = hourlyCost;
        SetupCost = setupCost;
        CalculateEstimatedCost();
    }

    public void SetWorkCenter(int? workCenterId)
    {
        WorkCenterId = workCenterId;
    }

    public void SetMachine(int? machineId)
    {
        MachineId = machineId;
    }

    public void SetSkillLevel(int? skillLevel)
    {
        SkillLevelRequired = skillLevel;
    }

    public void SetParallel(bool isParallel)
    {
        IsParallel = isParallel;
    }

    public void SetSequence(int sequence)
    {
        Sequence = sequence;
    }

    public void SetNotes(string? notes) => Notes = notes;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    private void CalculateEstimatedCost()
    {
        var totalTime = SetupTime + (RunTimePerUnit * RequiredQuantity);
        var timeCost = (HourlyCost ?? 0) * (totalTime / 60);
        TotalEstimatedCost = timeCost + (SetupCost ?? 0);
    }

    /// <summary>
    /// Belirli bir miktar için kaynak süresini hesaplar
    /// </summary>
    public decimal CalculateResourceTime(decimal quantity)
    {
        return SetupTime + (RunTimePerUnit * quantity);
    }

    /// <summary>
    /// Belirli bir miktar için kaynak maliyetini hesaplar
    /// </summary>
    public decimal CalculateResourceCost(decimal quantity)
    {
        var totalTime = CalculateResourceTime(quantity);
        var timeCost = (HourlyCost ?? 0) * (totalTime / 60);
        return timeCost + (SetupCost ?? 0);
    }
}
