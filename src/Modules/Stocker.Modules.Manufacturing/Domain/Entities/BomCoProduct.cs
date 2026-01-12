using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Yan Ürün / Ortak Ürün (Co-Product / By-Product)
/// Üretim sürecinde ana ürünle birlikte elde edilen ürünler
/// </summary>
public class BomCoProduct : BaseEntity
{
    public int BomId { get; private set; }
    public int ProductId { get; private set; }
    public CoProductType Type { get; private set; }
    
    // Miktar bilgileri
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = null!;
    public decimal YieldPercent { get; private set; }
    
    // Maliyet dağılımı
    public decimal CostAllocationPercent { get; private set; }
    public CostAllocationMethod CostAllocationMethod { get; private set; }
    
    // Değer
    public decimal? UnitValue { get; private set; }
    public decimal? TotalValue { get; private set; }
    
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }

    // Navigation properties
    public virtual BillOfMaterial Bom { get; private set; } = null!;

    protected BomCoProduct() { }

    public BomCoProduct(int bomId, int productId, decimal quantity, string unit, decimal costAllocationPercent)
    {
        BomId = bomId;
        ProductId = productId;
        Quantity = quantity;
        Unit = unit;
        CostAllocationPercent = costAllocationPercent;
        Type = CoProductType.Yan_Ürün;
        YieldPercent = 100;
        CostAllocationMethod = CostAllocationMethod.Sabit_Yüzde;
        IsActive = true;
        DisplayOrder = 0;
    }

    public void Update(decimal quantity, string unit, decimal costAllocationPercent)
    {
        Quantity = quantity;
        Unit = unit;
        CostAllocationPercent = costAllocationPercent;
        CalculateTotalValue();
    }

    public void SetType(CoProductType type)
    {
        Type = type;
    }

    public void SetYield(decimal yieldPercent)
    {
        YieldPercent = yieldPercent;
    }

    public void SetCostAllocation(decimal percent, CostAllocationMethod method)
    {
        CostAllocationPercent = percent;
        CostAllocationMethod = method;
    }

    public void SetValue(decimal unitValue)
    {
        UnitValue = unitValue;
        CalculateTotalValue();
    }

    public void SetNotes(string? notes) => Notes = notes;
    public void SetDisplayOrder(int order) => DisplayOrder = order;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    private void CalculateTotalValue()
    {
        if (UnitValue.HasValue)
        {
            TotalValue = UnitValue.Value * Quantity;
        }
    }

    /// <summary>
    /// Belirli bir üretim miktarı için beklenen yan ürün miktarını hesaplar
    /// </summary>
    public decimal CalculateExpectedQuantity(decimal productionQuantity, decimal bomBaseQuantity)
    {
        return (Quantity / bomBaseQuantity) * productionQuantity * (YieldPercent / 100);
    }
}
