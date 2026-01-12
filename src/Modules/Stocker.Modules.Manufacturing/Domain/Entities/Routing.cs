using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Events;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Üretim Rotası - Bir ürünün üretimi için gereken operasyonların sıralı listesi
/// </summary>
public class Routing : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public int ProductId { get; private set; }
    public RoutingType Type { get; private set; }
    public RoutingStatus Status { get; private set; }
    
    // Versiyon kontrolü
    public string Version { get; private set; } = null!;
    public int RevisionNumber { get; private set; }
    public bool IsDefault { get; private set; }
    public DateTime? EffectiveStartDate { get; private set; }
    public DateTime? EffectiveEndDate { get; private set; }
    
    // Üretim bilgileri
    public decimal BaseQuantity { get; private set; }
    public string BaseUnit { get; private set; } = null!;
    
    // Süre özeti
    public decimal TotalSetupTime { get; private set; }
    public decimal TotalRunTime { get; private set; }
    public decimal TotalQueueTime { get; private set; }
    public decimal TotalMoveTime { get; private set; }
    public decimal TotalLeadTime { get; private set; }
    
    // Maliyet özeti
    public decimal? EstimatedLaborCost { get; private set; }
    public decimal? EstimatedMachineCost { get; private set; }
    public decimal? EstimatedOverheadCost { get; private set; }
    public decimal? TotalEstimatedCost { get; private set; }
    
    // Onay bilgileri
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public string? ApprovalNotes { get; private set; }
    
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }

    // Navigation properties
    public virtual ICollection<Operation> Operations { get; private set; } = new List<Operation>();

    protected Routing() { }

    public Routing(string code, string name, int productId, RoutingType type, string baseUnit)
    {
        Code = code;
        Name = name;
        ProductId = productId;
        Type = type;
        Status = RoutingStatus.Taslak;
        Version = "1.0";
        RevisionNumber = 1;
        BaseQuantity = 1;
        BaseUnit = baseUnit;
        IsDefault = false;
        IsActive = true;
        DisplayOrder = 0;
    }

    public void Update(string name, string? description, RoutingType type)
    {
        Name = name;
        Description = description;
        Type = type;

        RaiseDomainEvent(new RoutingUpdatedDomainEvent(Id, TenantId, Code, Name, ProductId));
    }

    public void SetVersion(string version, int revisionNumber)
    {
        Version = version;
        RevisionNumber = revisionNumber;
    }

    public void SetEffectiveDates(DateTime? startDate, DateTime? endDate)
    {
        EffectiveStartDate = startDate;
        EffectiveEndDate = endDate;
    }

    public void SetBaseQuantity(decimal baseQuantity, string baseUnit)
    {
        BaseQuantity = baseQuantity;
        BaseUnit = baseUnit;
    }

    public void MarkAsDefault()
    {
        IsDefault = true;
    }

    public void UnmarkAsDefault()
    {
        IsDefault = false;
    }

    public void ChangeStatus(RoutingStatus newStatus)
    {
        var oldStatus = Status;
        Status = newStatus;

        RaiseDomainEvent(new RoutingStatusChangedDomainEvent(Id, TenantId, Code, Name, ProductId, oldStatus, newStatus));
    }

    public void Approve(string approvedBy, string? notes = null)
    {
        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = notes;
        Status = RoutingStatus.Onaylandı;

        RaiseDomainEvent(new RoutingApprovedDomainEvent(Id, TenantId, Code, Name, ProductId, approvedBy));
    }

    public Operation AddOperation(string code, string name, int workCenterId, int sequence)
    {
        var operation = new Operation(code, name, Id, workCenterId, sequence);
        Operations.Add(operation);
        RecalculateTotals();
        return operation;
    }

    public void RemoveOperation(int operationId)
    {
        var operation = Operations.FirstOrDefault(o => o.Id == operationId);
        if (operation != null)
        {
            Operations.Remove(operation);
            RecalculateTotals();
        }
    }

    public void RecalculateTotals()
    {
        TotalSetupTime = Operations.Sum(o => o.SetupTime);
        TotalRunTime = Operations.Sum(o => o.RunTime);
        TotalQueueTime = Operations.Sum(o => o.QueueTime);
        TotalMoveTime = Operations.Sum(o => o.MoveTime);
        TotalLeadTime = TotalSetupTime + TotalRunTime + TotalQueueTime + TotalMoveTime;
    }

    public void UpdateCosts(decimal laborCost, decimal machineCost, decimal overheadCost)
    {
        EstimatedLaborCost = laborCost;
        EstimatedMachineCost = machineCost;
        EstimatedOverheadCost = overheadCost;
        TotalEstimatedCost = laborCost + machineCost + overheadCost;
    }

    public void SetDisplayOrder(int order) => DisplayOrder = order;

    public void Activate()
    {
        IsActive = true;
        RaiseDomainEvent(new RoutingActivatedDomainEvent(Id, TenantId, Code, Name, ProductId));
    }

    public void Deactivate()
    {
        IsActive = false;
        RaiseDomainEvent(new RoutingDeactivatedDomainEvent(Id, TenantId, Code, Name, ProductId));
    }

    /// <summary>
    /// Rotanın belirli bir tarihte geçerli olup olmadığını kontrol eder
    /// </summary>
    public bool IsEffectiveOn(DateTime date)
    {
        if (!EffectiveStartDate.HasValue && !EffectiveEndDate.HasValue)
            return true;

        if (EffectiveStartDate.HasValue && date < EffectiveStartDate.Value)
            return false;

        if (EffectiveEndDate.HasValue && date > EffectiveEndDate.Value)
            return false;

        return true;
    }

    /// <summary>
    /// Belirli bir miktar için toplam üretim süresini hesaplar
    /// </summary>
    public decimal CalculateTotalTime(decimal quantity)
    {
        decimal totalTime = 0;
        foreach (var operation in Operations)
        {
            totalTime += operation.CalculateOperationTime(quantity, BaseQuantity);
        }
        return totalTime;
    }
}
