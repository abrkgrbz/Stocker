using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Events;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Üretim Emri - Belirli bir ürünün üretimi için verilen emir
/// </summary>
public class ProductionOrder : BaseEntity
{
    public string OrderNumber { get; private set; } = null!;
    public ProductionOrderType Type { get; private set; }
    public ProductionOrderStatus Status { get; private set; }
    public ProductionOrderPriority Priority { get; private set; }
    
    // Ürün bilgileri
    public int ProductId { get; private set; }
    public int? BomId { get; private set; }
    public int? RoutingId { get; private set; }
    
    // Miktar bilgileri
    public decimal PlannedQuantity { get; private set; }
    public decimal CompletedQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }
    public decimal ReworkQuantity { get; private set; }
    public string Unit { get; private set; } = null!;
    
    // Tarih bilgileri
    public DateTime OrderDate { get; private set; }
    public DateTime PlannedStartDate { get; private set; }
    public DateTime PlannedEndDate { get; private set; }
    public DateTime? ActualStartDate { get; private set; }
    public DateTime? ActualEndDate { get; private set; }
    public DateTime? DueDate { get; private set; }
    
    // Depo bilgileri
    public int? SourceWarehouseId { get; private set; }
    public int? TargetWarehouseId { get; private set; }
    public int? TargetLocationId { get; private set; }
    
    // İlişkili belgeler
    public int? SalesOrderId { get; private set; }
    public int? SalesOrderLineId { get; private set; }
    public int? ParentProductionOrderId { get; private set; }
    public int? ProjectId { get; private set; }
    
    // Lot/Seri bilgileri
    public string? LotNumber { get; private set; }
    public bool GenerateLotOnReceipt { get; private set; }
    public bool GenerateSerialOnReceipt { get; private set; }
    
    // Maliyet bilgileri
    public decimal? EstimatedMaterialCost { get; private set; }
    public decimal? EstimatedLaborCost { get; private set; }
    public decimal? EstimatedMachineCost { get; private set; }
    public decimal? EstimatedOverheadCost { get; private set; }
    public decimal? TotalEstimatedCost { get; private set; }
    public decimal? ActualMaterialCost { get; private set; }
    public decimal? ActualLaborCost { get; private set; }
    public decimal? ActualMachineCost { get; private set; }
    public decimal? ActualOverheadCost { get; private set; }
    public decimal? TotalActualCost { get; private set; }
    
    // İlerleme
    public decimal CompletionPercent { get; private set; }
    public int CurrentOperationSequence { get; private set; }
    
    // Sorumlular
    public string? PlannedBy { get; private set; }
    public string? ReleasedBy { get; private set; }
    public DateTime? ReleasedDate { get; private set; }
    public string? ClosedBy { get; private set; }
    public DateTime? ClosedDate { get; private set; }
    
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual BillOfMaterial? Bom { get; private set; }
    public virtual Routing? Routing { get; private set; }
    public virtual ProductionOrder? ParentProductionOrder { get; private set; }
    public virtual ICollection<ProductionOrder> ChildProductionOrders { get; private set; } = new List<ProductionOrder>();
    public virtual ICollection<ProductionOrderLine> Lines { get; private set; } = new List<ProductionOrderLine>();
    public virtual ICollection<ProductionOperation> Operations { get; private set; } = new List<ProductionOperation>();
    public virtual ICollection<MaterialConsumption> MaterialConsumptions { get; private set; } = new List<MaterialConsumption>();
    public virtual ICollection<ProductionReceipt> Receipts { get; private set; } = new List<ProductionReceipt>();
    public virtual ICollection<QualityInspection> QualityInspections { get; private set; } = new List<QualityInspection>();

    protected ProductionOrder() { }

    public ProductionOrder(string orderNumber, int productId, decimal plannedQuantity, string unit, ProductionOrderType type)
    {
        OrderNumber = orderNumber;
        ProductId = productId;
        PlannedQuantity = plannedQuantity;
        Unit = unit;
        Type = type;
        Status = ProductionOrderStatus.Taslak;
        Priority = ProductionOrderPriority.Normal;
        OrderDate = DateTime.UtcNow;
        PlannedStartDate = DateTime.UtcNow;
        PlannedEndDate = DateTime.UtcNow.AddDays(1);
        CompletedQuantity = 0;
        ScrapQuantity = 0;
        ReworkQuantity = 0;
        CompletionPercent = 0;
        CurrentOperationSequence = 0;
        IsActive = true;
    }

    public void Update(decimal plannedQuantity, string unit, ProductionOrderPriority priority)
    {
        if (Status != ProductionOrderStatus.Taslak && Status != ProductionOrderStatus.Planlandı)
        {
            throw new InvalidOperationException("Sadece taslak veya planlanmış durumundaki üretim emirleri güncellenebilir");
        }

        PlannedQuantity = plannedQuantity;
        Unit = unit;
        Priority = priority;

        RaiseDomainEvent(new ProductionOrderUpdatedDomainEvent(Id, TenantId, OrderNumber, ProductId, PlannedQuantity));
    }

    public void SetBom(int bomId)
    {
        BomId = bomId;
    }

    public void SetRouting(int routingId)
    {
        RoutingId = routingId;
    }

    public void SetDates(DateTime plannedStartDate, DateTime plannedEndDate, DateTime? dueDate)
    {
        PlannedStartDate = plannedStartDate;
        PlannedEndDate = plannedEndDate;
        DueDate = dueDate;
    }

    public void SetWarehouses(int? sourceWarehouseId, int? targetWarehouseId, int? targetLocationId)
    {
        SourceWarehouseId = sourceWarehouseId;
        TargetWarehouseId = targetWarehouseId;
        TargetLocationId = targetLocationId;
    }

    public void SetSalesOrderReference(int? salesOrderId, int? salesOrderLineId)
    {
        SalesOrderId = salesOrderId;
        SalesOrderLineId = salesOrderLineId;
    }

    public void SetParentOrder(int? parentProductionOrderId)
    {
        ParentProductionOrderId = parentProductionOrderId;
    }

    public void SetProject(int? projectId)
    {
        ProjectId = projectId;
    }

    public void SetLotTracking(string? lotNumber, bool generateLotOnReceipt, bool generateSerialOnReceipt)
    {
        LotNumber = lotNumber;
        GenerateLotOnReceipt = generateLotOnReceipt;
        GenerateSerialOnReceipt = generateSerialOnReceipt;
    }

    public void SetEstimatedCosts(decimal materialCost, decimal laborCost, decimal machineCost, decimal overheadCost)
    {
        EstimatedMaterialCost = materialCost;
        EstimatedLaborCost = laborCost;
        EstimatedMachineCost = machineCost;
        EstimatedOverheadCost = overheadCost;
        TotalEstimatedCost = materialCost + laborCost + machineCost + overheadCost;
    }

    public void UpdateActualCosts(decimal materialCost, decimal laborCost, decimal machineCost, decimal overheadCost)
    {
        ActualMaterialCost = materialCost;
        ActualLaborCost = laborCost;
        ActualMachineCost = machineCost;
        ActualOverheadCost = overheadCost;
        TotalActualCost = materialCost + laborCost + machineCost + overheadCost;
    }

    public void SetPlannedBy(string plannedBy)
    {
        PlannedBy = plannedBy;
    }

    public void SetNotes(string? notes) => Notes = notes;

    #region Status Transitions

    public void Plan()
    {
        if (Status != ProductionOrderStatus.Taslak)
        {
            throw new InvalidOperationException("Sadece taslak durumundaki üretim emirleri planlanabilir");
        }

        Status = ProductionOrderStatus.Planlandı;
        RaiseDomainEvent(new ProductionOrderPlannedDomainEvent(Id, TenantId, OrderNumber, ProductId, PlannedQuantity));
    }

    public void Release(string releasedBy)
    {
        if (Status != ProductionOrderStatus.Planlandı)
        {
            throw new InvalidOperationException("Sadece planlanmış durumundaki üretim emirleri serbest bırakılabilir");
        }

        Status = ProductionOrderStatus.Serbest;
        ReleasedBy = releasedBy;
        ReleasedDate = DateTime.UtcNow;

        RaiseDomainEvent(new ProductionOrderReleasedDomainEvent(Id, TenantId, OrderNumber, ProductId, PlannedQuantity, releasedBy));
    }

    public void Start()
    {
        if (Status != ProductionOrderStatus.Serbest)
        {
            throw new InvalidOperationException("Sadece serbest bırakılmış durumundaki üretim emirleri başlatılabilir");
        }

        Status = ProductionOrderStatus.Başladı;
        ActualStartDate = DateTime.UtcNow;

        RaiseDomainEvent(new ProductionOrderStartedDomainEvent(Id, TenantId, OrderNumber, ProductId, PlannedQuantity));
    }

    public void Complete()
    {
        if (Status != ProductionOrderStatus.Başladı)
        {
            throw new InvalidOperationException("Sadece devam eden üretim emirleri tamamlanabilir");
        }

        Status = ProductionOrderStatus.Tamamlandı;
        ActualEndDate = DateTime.UtcNow;
        CompletionPercent = 100;

        RaiseDomainEvent(new ProductionOrderCompletedDomainEvent(Id, TenantId, OrderNumber, ProductId, CompletedQuantity, ScrapQuantity));
    }

    public void Close(string closedBy)
    {
        if (Status != ProductionOrderStatus.Tamamlandı)
        {
            throw new InvalidOperationException("Sadece tamamlanmış üretim emirleri kapatılabilir");
        }

        Status = ProductionOrderStatus.Kapatıldı;
        ClosedBy = closedBy;
        ClosedDate = DateTime.UtcNow;

        RaiseDomainEvent(new ProductionOrderClosedDomainEvent(Id, TenantId, OrderNumber, ProductId, TotalActualCost ?? 0, closedBy));
    }

    public void Cancel(string cancelledBy, string reason)
    {
        if (Status == ProductionOrderStatus.Kapatıldı || Status == ProductionOrderStatus.İptal)
        {
            throw new InvalidOperationException("Kapatılmış veya iptal edilmiş üretim emirleri iptal edilemez");
        }

        Status = ProductionOrderStatus.İptal;
        ClosedBy = cancelledBy;
        ClosedDate = DateTime.UtcNow;
        Notes = $"İptal nedeni: {reason}. {Notes}";

        RaiseDomainEvent(new ProductionOrderCancelledDomainEvent(Id, TenantId, OrderNumber, ProductId, cancelledBy, reason));
    }

    public void Hold(string reason)
    {
        if (Status != ProductionOrderStatus.Başladı && Status != ProductionOrderStatus.Serbest)
        {
            throw new InvalidOperationException("Sadece serbest bırakılmış veya devam eden üretim emirleri bekletmeye alınabilir");
        }

        Status = ProductionOrderStatus.Beklemede;
        Notes = $"Bekletme nedeni: {reason}. {Notes}";

        RaiseDomainEvent(new ProductionOrderHoldDomainEvent(Id, TenantId, OrderNumber, ProductId, reason));
    }

    public void Resume()
    {
        if (Status != ProductionOrderStatus.Beklemede)
        {
            throw new InvalidOperationException("Sadece beklemede olan üretim emirleri devam ettirilebilir");
        }

        Status = ActualStartDate.HasValue ? ProductionOrderStatus.Başladı : ProductionOrderStatus.Serbest;

        RaiseDomainEvent(new ProductionOrderResumedDomainEvent(Id, TenantId, OrderNumber, ProductId));
    }

    #endregion

    #region Quantity Operations

    public void RecordCompletion(decimal quantity)
    {
        CompletedQuantity += quantity;
        UpdateCompletionPercent();
    }

    public void RecordScrap(decimal quantity)
    {
        ScrapQuantity += quantity;
    }

    public void RecordRework(decimal quantity)
    {
        ReworkQuantity += quantity;
    }

    public void UpdateCurrentOperation(int operationSequence)
    {
        CurrentOperationSequence = operationSequence;
        UpdateCompletionPercent();
    }

    private void UpdateCompletionPercent()
    {
        if (PlannedQuantity > 0)
        {
            CompletionPercent = Math.Min(100, (CompletedQuantity / PlannedQuantity) * 100);
        }
    }

    #endregion

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    /// <summary>
    /// Kalan üretilecek miktarı hesaplar
    /// </summary>
    public decimal GetRemainingQuantity()
    {
        return PlannedQuantity - CompletedQuantity - ScrapQuantity;
    }

    /// <summary>
    /// Maliyet sapmasını hesaplar
    /// </summary>
    public decimal CalculateCostVariance()
    {
        if (!TotalEstimatedCost.HasValue || !TotalActualCost.HasValue)
            return 0;

        return TotalActualCost.Value - TotalEstimatedCost.Value;
    }

    /// <summary>
    /// Birim maliyeti hesaplar
    /// </summary>
    public decimal CalculateUnitCost()
    {
        if (CompletedQuantity <= 0 || !TotalActualCost.HasValue)
            return 0;

        return TotalActualCost.Value / CompletedQuantity;
    }
}
