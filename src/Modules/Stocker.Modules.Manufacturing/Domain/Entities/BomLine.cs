using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Ürün Ağacı Satırı - BOM bileşeni
/// </summary>
public class BomLine : BaseEntity
{
    public int BomId { get; private set; }
    public int ComponentProductId { get; private set; }
    public int Sequence { get; private set; }
    
    // Miktar bilgileri
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = null!;
    public decimal ScrapRate { get; private set; }
    public decimal NetQuantity { get; private set; }
    
    // Bileşen tipi
    public BomLineType Type { get; private set; }
    public bool IsPhantom { get; private set; }
    public bool IsCritical { get; private set; }
    
    // Tüketim ayarları
    public ConsumptionMethod ConsumptionMethod { get; private set; }
    public ConsumptionTiming ConsumptionTiming { get; private set; }
    
    // Geçerlilik
    public DateTime? EffectiveStartDate { get; private set; }
    public DateTime? EffectiveEndDate { get; private set; }
    
    // Operasyon ilişkisi
    public int? OperationId { get; private set; }
    public int? OperationSequence { get; private set; }
    
    // Alternatif bileşen
    public int? AlternativeGroupId { get; private set; }
    public int AlternativePriority { get; private set; }
    
    // Maliyet
    public decimal? UnitCost { get; private set; }
    public decimal? TotalCost { get; private set; }
    
    // Depo bilgisi
    public int? WarehouseId { get; private set; }
    public int? LocationId { get; private set; }
    
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual BillOfMaterial Bom { get; private set; } = null!;
    public virtual Operation? Operation { get; private set; }

    protected BomLine() { }

    public BomLine(int bomId, int componentProductId, decimal quantity, string unit, int sequence)
    {
        BomId = bomId;
        ComponentProductId = componentProductId;
        Quantity = quantity;
        Unit = unit;
        Sequence = sequence;
        ScrapRate = 0;
        NetQuantity = quantity;
        Type = BomLineType.Standard;
        IsPhantom = false;
        IsCritical = false;
        ConsumptionMethod = ConsumptionMethod.Backflush;
        ConsumptionTiming = ConsumptionTiming.Operasyon_Bitişi;
        AlternativePriority = 1;
        IsActive = true;
    }

    public void Update(decimal quantity, string unit, int sequence)
    {
        Quantity = quantity;
        Unit = unit;
        Sequence = sequence;
        CalculateNetQuantity();
    }

    public void SetScrapRate(decimal scrapRate)
    {
        ScrapRate = scrapRate;
        CalculateNetQuantity();
    }

    public void SetType(BomLineType type)
    {
        Type = type;
    }

    public void MarkAsPhantom()
    {
        IsPhantom = true;
    }

    public void UnmarkAsPhantom()
    {
        IsPhantom = false;
    }

    public void MarkAsCritical()
    {
        IsCritical = true;
    }

    public void SetConsumption(ConsumptionMethod method, ConsumptionTiming timing)
    {
        ConsumptionMethod = method;
        ConsumptionTiming = timing;
    }

    public void SetEffectiveDates(DateTime? startDate, DateTime? endDate)
    {
        EffectiveStartDate = startDate;
        EffectiveEndDate = endDate;
    }

    public void SetOperation(int? operationId, int? operationSequence)
    {
        OperationId = operationId;
        OperationSequence = operationSequence;
    }

    public void SetOperationSequence(int sequence)
    {
        OperationSequence = sequence;
    }

    public void SetAlternative(int? alternativeGroupId, int priority)
    {
        AlternativeGroupId = alternativeGroupId;
        AlternativePriority = priority;
    }

    public void SetCost(decimal unitCost)
    {
        UnitCost = unitCost;
        TotalCost = unitCost * NetQuantity;
    }

    public void SetWarehouse(int? warehouseId, int? locationId)
    {
        WarehouseId = warehouseId;
        LocationId = locationId;
    }

    public void SetNotes(string? notes) => Notes = notes;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    private void CalculateNetQuantity()
    {
        NetQuantity = Quantity * (1 + ScrapRate / 100);
        if (UnitCost.HasValue)
        {
            TotalCost = UnitCost.Value * NetQuantity;
        }
    }

    /// <summary>
    /// Belirli bir tarihte geçerli olup olmadığını kontrol eder
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
    /// Satır maliyetini hesaplar
    /// </summary>
    public decimal CalculateLineCost()
    {
        return UnitCost.GetValueOrDefault() * NetQuantity;
    }

    /// <summary>
    /// Belirli bir üretim miktarı için gerekli malzeme miktarını hesaplar
    /// </summary>
    public decimal CalculateRequiredQuantity(decimal productionQuantity, decimal bomBaseQuantity)
    {
        return (NetQuantity / bomBaseQuantity) * productionQuantity;
    }
}
