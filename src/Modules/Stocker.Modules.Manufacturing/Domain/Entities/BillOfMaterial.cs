using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Events;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Ürün Ağacı (BOM - Bill of Materials)
/// Ana ürün için gerekli malzeme ve alt bileşenlerin tanımı
/// </summary>
public class BillOfMaterial : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public int ProductId { get; private set; }
    public BomType Type { get; private set; }
    public BomStatus Status { get; private set; }
    
    // Versiyon kontrolü
    public string Version { get; private set; } = null!;
    public int RevisionNumber { get; private set; }
    public bool IsDefault { get; private set; }
    public DateTime? EffectiveStartDate { get; private set; }
    public DateTime? EffectiveEndDate { get; private set; }
    
    // Üretim bilgileri
    public decimal BaseQuantity { get; private set; }
    public string BaseUnit { get; private set; } = null!;
    public decimal StandardYield { get; private set; }
    public decimal ScrapRate { get; private set; }
    
    // Maliyet bilgileri
    public decimal? EstimatedMaterialCost { get; private set; }
    public decimal? EstimatedLaborCost { get; private set; }
    public decimal? EstimatedOverheadCost { get; private set; }
    public decimal? TotalEstimatedCost { get; private set; }
    public DateTime? LastCostCalculationDate { get; private set; }
    
    // Onay bilgileri
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public string? ApprovalNotes { get; private set; }
    
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }

    // Navigation properties
    public virtual ICollection<BomLine> Lines { get; private set; } = new List<BomLine>();
    public virtual ICollection<BomCoProduct> CoProducts { get; private set; } = new List<BomCoProduct>();
    public virtual Routing? DefaultRouting { get; private set; }
    public virtual int? DefaultRoutingId { get; private set; }

    protected BillOfMaterial() { }

    public BillOfMaterial(string code, string name, int productId, BomType type, string baseUnit)
    {
        Code = code;
        Name = name;
        ProductId = productId;
        Type = type;
        Status = BomStatus.Taslak;
        Version = "1.0";
        RevisionNumber = 1;
        BaseQuantity = 1;
        BaseUnit = baseUnit;
        StandardYield = 100;
        ScrapRate = 0;
        IsDefault = false;
        IsActive = true;
        DisplayOrder = 0;
    }

    public void Update(string name, string? description, BomType type)
    {
        Name = name;
        Description = description;
        Type = type;

        RaiseDomainEvent(new BomUpdatedDomainEvent(Id, TenantId, Code, Name, ProductId));
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

    public void SetProductionInfo(decimal baseQuantity, string baseUnit, decimal standardYield, decimal scrapRate)
    {
        BaseQuantity = baseQuantity;
        BaseUnit = baseUnit;
        StandardYield = standardYield;
        ScrapRate = scrapRate;
    }

    public void SetDefaultRouting(int? routingId)
    {
        DefaultRoutingId = routingId;
    }

    public void MarkAsDefault()
    {
        IsDefault = true;
    }

    public void UnmarkAsDefault()
    {
        IsDefault = false;
    }

    public void ChangeStatus(BomStatus newStatus)
    {
        var oldStatus = Status;
        Status = newStatus;

        RaiseDomainEvent(new BomStatusChangedDomainEvent(Id, TenantId, Code, Name, ProductId, oldStatus, newStatus));
    }

    public void Approve(string approvedBy, string? notes = null)
    {
        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = notes;
        Status = BomStatus.Onaylandı;

        RaiseDomainEvent(new BomApprovedDomainEvent(Id, TenantId, Code, Name, ProductId, approvedBy));
    }

    public void UpdateCosts(decimal materialCost, decimal laborCost, decimal overheadCost)
    {
        EstimatedMaterialCost = materialCost;
        EstimatedLaborCost = laborCost;
        EstimatedOverheadCost = overheadCost;
        TotalEstimatedCost = materialCost + laborCost + overheadCost;
        LastCostCalculationDate = DateTime.UtcNow;
    }

    public BomLine AddLine(int componentProductId, decimal quantity, string unit, int sequence)
    {
        var line = new BomLine(Id, componentProductId, quantity, unit, sequence);
        Lines.Add(line);
        return line;
    }

    public void RemoveLine(int lineId)
    {
        var line = Lines.FirstOrDefault(l => l.Id == lineId);
        if (line != null)
        {
            Lines.Remove(line);
        }
    }

    public BomCoProduct AddCoProduct(int productId, decimal quantity, string unit, decimal costAllocationPercent)
    {
        var coProduct = new BomCoProduct(Id, productId, quantity, unit, costAllocationPercent);
        CoProducts.Add(coProduct);
        return coProduct;
    }

    public void SetDisplayOrder(int order) => DisplayOrder = order;

    public void Activate()
    {
        IsActive = true;
        RaiseDomainEvent(new BomActivatedDomainEvent(Id, TenantId, Code, Name, ProductId));
    }

    public void Deactivate()
    {
        IsActive = false;
        RaiseDomainEvent(new BomDeactivatedDomainEvent(Id, TenantId, Code, Name, ProductId));
    }

    /// <summary>
    /// BOM'un belirli bir tarihte geçerli olup olmadığını kontrol eder
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
    /// Toplam malzeme maliyetini hesaplar
    /// </summary>
    public decimal CalculateTotalMaterialCost()
    {
        return Lines.Sum(l => l.CalculateLineCost());
    }
}
