using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Events;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Malzeme Tüketimi - Üretim sürecinde tüketilen malzeme kaydı
/// </summary>
public class MaterialConsumption : BaseEntity
{
    public int ProductionOrderId { get; private set; }
    public int? ProductionOrderLineId { get; private set; }
    public int? ProductionOperationId { get; private set; }
    public int ProductId { get; private set; }
    public ConsumptionType Type { get; private set; }
    
    // Miktar bilgileri
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = null!;
    public bool IsBackflushed { get; private set; }
    
    // Stok bilgileri
    public int WarehouseId { get; private set; }
    public int? LocationId { get; private set; }
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    
    // Maliyet
    public decimal UnitCost { get; private set; }
    public decimal TotalCost { get; private set; }
    public CostingMethod CostingMethod { get; private set; }
    
    // İşlem bilgileri
    public DateTime ConsumptionDate { get; private set; }
    public string? ConsumedBy { get; private set; }
    public int? StockMovementId { get; private set; }
    
    // İade bilgileri
    public bool IsReturned { get; private set; }
    public decimal ReturnedQuantity { get; private set; }
    public DateTime? ReturnDate { get; private set; }
    public string? ReturnReason { get; private set; }
    
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual ProductionOrder ProductionOrder { get; private set; } = null!;
    public virtual ProductionOrderLine? ProductionOrderLine { get; private set; }
    public virtual ProductionOperation? ProductionOperation { get; private set; }

    protected MaterialConsumption() { }

    public MaterialConsumption(
        int productionOrderId, 
        int productId, 
        decimal quantity, 
        string unit, 
        int warehouseId,
        decimal unitCost,
        ConsumptionType type = ConsumptionType.Normal)
    {
        ProductionOrderId = productionOrderId;
        ProductId = productId;
        Quantity = quantity;
        Unit = unit;
        WarehouseId = warehouseId;
        UnitCost = unitCost;
        TotalCost = quantity * unitCost;
        Type = type;
        ConsumptionDate = DateTime.UtcNow;
        CostingMethod = CostingMethod.Standart;
        IsBackflushed = false;
        IsReturned = false;
        ReturnedQuantity = 0;
        IsActive = true;
    }

    public void SetProductionOrderLine(int? productionOrderLineId)
    {
        ProductionOrderLineId = productionOrderLineId;
    }

    public void SetProductionOperation(int? productionOperationId)
    {
        ProductionOperationId = productionOperationId;
    }

    public void SetLocation(int? locationId)
    {
        LocationId = locationId;
    }

    public void SetLotSerial(string? lotNumber, string? serialNumber)
    {
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
    }

    public void SetCostingMethod(CostingMethod method)
    {
        CostingMethod = method;
    }

    public void SetBackflushed(bool isBackflushed)
    {
        IsBackflushed = isBackflushed;
    }

    public void SetConsumedBy(string consumedBy)
    {
        ConsumedBy = consumedBy;
    }

    public void SetStockMovementId(int stockMovementId)
    {
        StockMovementId = stockMovementId;
    }

    public void SetNotes(string? notes) => Notes = notes;

    /// <summary>
    /// Malzeme iadesi kaydeder
    /// </summary>
    public void RecordReturn(decimal quantity, string reason, string returnedBy)
    {
        if (quantity > Quantity - ReturnedQuantity)
        {
            throw new InvalidOperationException("İade miktarı tüketilen miktarı aşamaz");
        }

        ReturnedQuantity += quantity;
        ReturnDate = DateTime.UtcNow;
        ReturnReason = reason;
        IsReturned = ReturnedQuantity > 0;
        
        // Maliyeti güncelle
        TotalCost = (Quantity - ReturnedQuantity) * UnitCost;

        RaiseDomainEvent(new MaterialReturnedDomainEvent(
            Id, TenantId, ProductionOrderId, ProductId, quantity, reason, returnedBy));
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    /// <summary>
    /// Net tüketim miktarını hesaplar
    /// </summary>
    public decimal GetNetQuantity()
    {
        return Quantity - ReturnedQuantity;
    }

    /// <summary>
    /// Net maliyeti hesaplar
    /// </summary>
    public decimal GetNetCost()
    {
        return GetNetQuantity() * UnitCost;
    }
}
