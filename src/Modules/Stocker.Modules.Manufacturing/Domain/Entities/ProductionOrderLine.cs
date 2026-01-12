using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Üretim Emri Satırı - Üretim emri için gerekli malzeme satırı
/// </summary>
public class ProductionOrderLine : BaseEntity
{
    public int ProductionOrderId { get; private set; }
    public int ComponentProductId { get; private set; }
    public int Sequence { get; private set; }
    public ProductionOrderLineType LineType { get; private set; }
    
    // Miktar bilgileri
    public decimal RequiredQuantity { get; private set; }
    public decimal ReservedQuantity { get; private set; }
    public decimal IssuedQuantity { get; private set; }
    public decimal ReturnedQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }
    public string Unit { get; private set; } = null!;
    
    // İlişkiler
    public int? BomLineId { get; private set; }
    public int? OperationId { get; private set; }
    
    // Depo bilgileri
    public int? WarehouseId { get; private set; }
    public int? LocationId { get; private set; }
    
    // Lot/Seri
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    
    // Maliyet
    public decimal? UnitCost { get; private set; }
    public decimal? TotalCost { get; private set; }
    
    // Durum
    public ProductionOrderLineStatus Status { get; private set; }
    public bool IsBackflushed { get; private set; }
    
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual ProductionOrder ProductionOrder { get; private set; } = null!;
    public virtual BomLine? BomLine { get; private set; }
    public virtual ProductionOperation? Operation { get; private set; }

    protected ProductionOrderLine() { }

    public ProductionOrderLine(int productionOrderId, int componentProductId, decimal requiredQuantity, string unit, int sequence)
    {
        ProductionOrderId = productionOrderId;
        ComponentProductId = componentProductId;
        RequiredQuantity = requiredQuantity;
        Unit = unit;
        Sequence = sequence;
        LineType = ProductionOrderLineType.Material;
        ReservedQuantity = 0;
        IssuedQuantity = 0;
        ReturnedQuantity = 0;
        ScrapQuantity = 0;
        Status = ProductionOrderLineStatus.Pending;
        IsBackflushed = false;
        IsActive = true;
    }

    public void Update(decimal requiredQuantity, string unit, int sequence)
    {
        RequiredQuantity = requiredQuantity;
        Unit = unit;
        Sequence = sequence;
    }

    public void SetLineType(ProductionOrderLineType lineType)
    {
        LineType = lineType;
    }

    public void SetBomLine(int? bomLineId)
    {
        BomLineId = bomLineId;
    }

    public void SetOperation(int? operationId)
    {
        OperationId = operationId;
    }

    public void SetWarehouse(int? warehouseId, int? locationId)
    {
        WarehouseId = warehouseId;
        LocationId = locationId;
    }

    public void SetLot(string? lotNumber, string? serialNumber)
    {
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
    }

    public void SetCost(decimal unitCost)
    {
        UnitCost = unitCost;
        TotalCost = unitCost * IssuedQuantity;
    }

    public void SetBackflushed(bool isBackflushed)
    {
        IsBackflushed = isBackflushed;
    }

    public void SetNotes(string? notes) => Notes = notes;

    #region Quantity Operations

    public void Reserve(decimal quantity)
    {
        ReservedQuantity += quantity;
        UpdateStatus();
    }

    public void Unreserve(decimal quantity)
    {
        ReservedQuantity = Math.Max(0, ReservedQuantity - quantity);
        UpdateStatus();
    }

    public void Issue(decimal quantity)
    {
        IssuedQuantity += quantity;
        ReservedQuantity = Math.Max(0, ReservedQuantity - quantity);
        CalculateTotalCost();
        UpdateStatus();
    }

    public void Return(decimal quantity)
    {
        ReturnedQuantity += quantity;
        CalculateTotalCost();
        UpdateStatus();
    }

    public void RecordScrap(decimal quantity)
    {
        ScrapQuantity += quantity;
    }

    private void CalculateTotalCost()
    {
        if (UnitCost.HasValue)
        {
            TotalCost = UnitCost.Value * (IssuedQuantity - ReturnedQuantity);
        }
    }

    private void UpdateStatus()
    {
        var netIssued = IssuedQuantity - ReturnedQuantity;
        
        if (netIssued >= RequiredQuantity)
        {
            Status = ProductionOrderLineStatus.Completed;
        }
        else if (netIssued > 0)
        {
            Status = ProductionOrderLineStatus.PartiallyIssued;
        }
        else if (ReservedQuantity >= RequiredQuantity)
        {
            Status = ProductionOrderLineStatus.FullyReserved;
        }
        else if (ReservedQuantity > 0)
        {
            Status = ProductionOrderLineStatus.PartiallyReserved;
        }
        else
        {
            Status = ProductionOrderLineStatus.Pending;
        }
    }

    #endregion

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    /// <summary>
    /// Kalan gerekli miktarı hesaplar
    /// </summary>
    public decimal GetRemainingQuantity()
    {
        return RequiredQuantity - (IssuedQuantity - ReturnedQuantity);
    }

    /// <summary>
    /// Eksik rezervasyon miktarını hesaplar
    /// </summary>
    public decimal GetShortageQuantity()
    {
        return Math.Max(0, RequiredQuantity - ReservedQuantity - IssuedQuantity + ReturnedQuantity);
    }
}
