using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Fason İş Emri - Dış tedarikçiye verilen üretim/işleme siparişi
/// </summary>
public class SubcontractOrder : BaseEntity
{
    public string OrderNumber { get; private set; } = null!;
    public int SubcontractorId { get; private set; }
    public string SubcontractorName { get; private set; } = null!;
    public int? ProductionOrderId { get; private set; }
    public int? OperationId { get; private set; }
    public SubcontractOrderStatus Status { get; private set; }

    // Ürün bilgileri
    public int ProductId { get; private set; }
    public string? ProductCode { get; private set; }
    public string? ProductName { get; private set; }
    public decimal OrderQuantity { get; private set; }
    public string Unit { get; private set; } = "Adet";

    // Tarihler
    public DateTime OrderDate { get; private set; }
    public DateTime ExpectedDeliveryDate { get; private set; }
    public DateTime? ActualDeliveryDate { get; private set; }
    public int LeadTimeDays { get; private set; }

    // Maliyet
    public decimal UnitCost { get; private set; }
    public decimal TotalCost { get; private set; }
    public decimal? ActualCost { get; private set; }
    public string? CostCenterId { get; private set; }

    // Miktar takibi
    public decimal ShippedQuantity { get; private set; }
    public decimal ReceivedQuantity { get; private set; }
    public decimal RejectedQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }

    // Kalite
    public bool RequiresInspection { get; private set; }
    public int? QualityPlanId { get; private set; }

    public string? Notes { get; private set; }
    public new string? CreatedBy { get; private set; }
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual ProductionOrder? ProductionOrder { get; private set; }
    public virtual Operation? Operation { get; private set; }
    public virtual ICollection<SubcontractShipment> Shipments { get; private set; } = new List<SubcontractShipment>();
    public virtual ICollection<SubcontractMaterial> Materials { get; private set; } = new List<SubcontractMaterial>();

    protected SubcontractOrder() { }

    public SubcontractOrder(
        string orderNumber,
        int subcontractorId,
        string subcontractorName,
        int productId,
        decimal orderQuantity,
        DateTime expectedDeliveryDate)
    {
        OrderNumber = orderNumber;
        SubcontractorId = subcontractorId;
        SubcontractorName = subcontractorName;
        ProductId = productId;
        OrderQuantity = orderQuantity;
        OrderDate = DateTime.UtcNow;
        ExpectedDeliveryDate = expectedDeliveryDate;
        LeadTimeDays = (int)(expectedDeliveryDate - DateTime.UtcNow).TotalDays;
        Status = SubcontractOrderStatus.Taslak;
        ShippedQuantity = 0;
        ReceivedQuantity = 0;
        RejectedQuantity = 0;
        ScrapQuantity = 0;
        IsActive = true;
    }

    public void SetProductInfo(string? productCode, string? productName, string unit)
    {
        ProductCode = productCode;
        ProductName = productName;
        Unit = unit;
    }

    public void SetProductionOrderLink(int? productionOrderId, int? operationId)
    {
        ProductionOrderId = productionOrderId;
        OperationId = operationId;
    }

    public void SetCost(decimal unitCost)
    {
        UnitCost = unitCost;
        TotalCost = unitCost * OrderQuantity;
    }

    public void SetCostCenter(string? costCenterId)
    {
        CostCenterId = costCenterId;
    }

    public void SetQualityRequirements(bool requiresInspection, int? qualityPlanId)
    {
        RequiresInspection = requiresInspection;
        QualityPlanId = qualityPlanId;
    }

    public void SetCreatedBy(string createdBy) => CreatedBy = createdBy;

    public void Approve(string approvedBy)
    {
        if (Status != SubcontractOrderStatus.Taslak)
            throw new InvalidOperationException("Sadece taslak durumundaki siparişler onaylanabilir.");

        Status = SubcontractOrderStatus.Onaylandı;
        ApprovedBy = approvedBy;
        ApprovedDate = DateTime.UtcNow;
    }

    public SubcontractShipment ShipMaterial(decimal quantity, string? batchNumber, string? notes)
    {
        if (Status != SubcontractOrderStatus.Onaylandı && Status != SubcontractOrderStatus.MalzemeGönderildi)
            throw new InvalidOperationException("Malzeme göndermek için sipariş onaylanmış olmalıdır.");

        var shipment = new SubcontractShipment(
            Id,
            SubcontractShipmentType.MalzemeSevk,
            quantity,
            DateTime.UtcNow);

        shipment.SetBatchInfo(batchNumber);
        if (!string.IsNullOrEmpty(notes))
            shipment.SetNotes(notes);

        Shipments.Add(shipment);
        ShippedQuantity += quantity;

        if (Status == SubcontractOrderStatus.Onaylandı)
            Status = SubcontractOrderStatus.MalzemeGönderildi;

        return shipment;
    }

    public SubcontractShipment ReceiveProduct(decimal quantity, decimal rejectedQuantity, string? batchNumber, string? notes)
    {
        if (Status != SubcontractOrderStatus.MalzemeGönderildi && Status != SubcontractOrderStatus.ÜretimdeGönderildi)
            throw new InvalidOperationException("Ürün almak için malzeme gönderilmiş olmalıdır.");

        var shipment = new SubcontractShipment(
            Id,
            SubcontractShipmentType.MamulTesellüm,
            quantity,
            DateTime.UtcNow);

        shipment.SetBatchInfo(batchNumber);
        shipment.SetRejectedQuantity(rejectedQuantity);
        if (!string.IsNullOrEmpty(notes))
            shipment.SetNotes(notes);

        Shipments.Add(shipment);
        ReceivedQuantity += quantity;
        RejectedQuantity += rejectedQuantity;

        Status = SubcontractOrderStatus.ÜretimdeGönderildi;

        // Check if order is complete
        if (ReceivedQuantity >= OrderQuantity)
        {
            Complete();
        }

        return shipment;
    }

    public void RecordScrap(decimal scrapQuantity, string reason)
    {
        ScrapQuantity += scrapQuantity;

        var shipment = new SubcontractShipment(
            Id,
            SubcontractShipmentType.FireTesellüm,
            scrapQuantity,
            DateTime.UtcNow);
        shipment.SetNotes($"Fire: {reason}");
        Shipments.Add(shipment);
    }

    public void Complete()
    {
        if (ReceivedQuantity == 0)
            throw new InvalidOperationException("Hiç ürün alınmadan sipariş tamamlanamaz.");

        Status = SubcontractOrderStatus.Tamamlandı;
        ActualDeliveryDate = DateTime.UtcNow;
        ActualCost = CalculateActualCost();
    }

    public void Close()
    {
        if (Status != SubcontractOrderStatus.Tamamlandı)
            throw new InvalidOperationException("Sadece tamamlanmış siparişler kapatılabilir.");

        Status = SubcontractOrderStatus.Kapatıldı;
    }

    public void Cancel()
    {
        if (Status == SubcontractOrderStatus.Tamamlandı || Status == SubcontractOrderStatus.Kapatıldı)
            throw new InvalidOperationException("Tamamlanmış veya kapatılmış sipariş iptal edilemez.");

        Status = SubcontractOrderStatus.İptal;
        IsActive = false;
    }

    public SubcontractMaterial AddMaterial(int materialId, string? materialCode, string? materialName,
        decimal requiredQuantity, string unit)
    {
        var material = new SubcontractMaterial(Id, materialId, requiredQuantity, unit);
        material.SetMaterialInfo(materialCode, materialName);
        Materials.Add(material);
        return material;
    }

    public void SetNotes(string? notes) => Notes = notes;

    private decimal CalculateActualCost()
    {
        return UnitCost * ReceivedQuantity;
    }

    /// <summary>
    /// Tamamlanma yüzdesini hesaplar
    /// </summary>
    public decimal GetCompletionPercent()
    {
        if (OrderQuantity == 0) return 0;
        return (ReceivedQuantity / OrderQuantity) * 100;
    }
}

/// <summary>
/// Fason Sevkiyat - Malzeme gönderimi veya mamul tesellümü
/// </summary>
public class SubcontractShipment : BaseEntity
{
    public int SubcontractOrderId { get; private set; }
    public SubcontractShipmentType Type { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal RejectedQuantity { get; private set; }
    public DateTime ShipmentDate { get; private set; }
    public string? BatchNumber { get; private set; }
    public string? LotNumber { get; private set; }
    public string? InvoiceNumber { get; private set; }
    public string? DeliveryNoteNumber { get; private set; }
    public string? Notes { get; private set; }

    // Navigation
    public virtual SubcontractOrder SubcontractOrder { get; private set; } = null!;

    protected SubcontractShipment() { }

    public SubcontractShipment(int subcontractOrderId, SubcontractShipmentType type, decimal quantity, DateTime shipmentDate)
    {
        SubcontractOrderId = subcontractOrderId;
        Type = type;
        Quantity = quantity;
        ShipmentDate = shipmentDate;
        RejectedQuantity = 0;
    }

    public void SetBatchInfo(string? batchNumber, string? lotNumber = null)
    {
        BatchNumber = batchNumber;
        LotNumber = lotNumber;
    }

    public void SetDocumentNumbers(string? invoiceNumber, string? deliveryNoteNumber)
    {
        InvoiceNumber = invoiceNumber;
        DeliveryNoteNumber = deliveryNoteNumber;
    }

    public void SetRejectedQuantity(decimal rejectedQuantity)
    {
        RejectedQuantity = rejectedQuantity;
    }

    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Fason Malzeme - Fasoncu'ya gönderilecek hammadde/yarı mamul
/// </summary>
public class SubcontractMaterial : BaseEntity
{
    public int SubcontractOrderId { get; private set; }
    public int MaterialId { get; private set; }
    public string? MaterialCode { get; private set; }
    public string? MaterialName { get; private set; }
    public decimal RequiredQuantity { get; private set; }
    public decimal ShippedQuantity { get; private set; }
    public decimal ReturnedQuantity { get; private set; }
    public decimal ConsumedQuantity { get; private set; }
    public string Unit { get; private set; } = "Adet";

    // Navigation
    public virtual SubcontractOrder SubcontractOrder { get; private set; } = null!;

    protected SubcontractMaterial() { }

    public SubcontractMaterial(int subcontractOrderId, int materialId, decimal requiredQuantity, string unit)
    {
        SubcontractOrderId = subcontractOrderId;
        MaterialId = materialId;
        RequiredQuantity = requiredQuantity;
        Unit = unit;
        ShippedQuantity = 0;
        ReturnedQuantity = 0;
        ConsumedQuantity = 0;
    }

    public void SetMaterialInfo(string? materialCode, string? materialName)
    {
        MaterialCode = materialCode;
        MaterialName = materialName;
    }

    public void RecordShipment(decimal quantity)
    {
        ShippedQuantity += quantity;
    }

    public void RecordReturn(decimal quantity)
    {
        ReturnedQuantity += quantity;
    }

    public void RecordConsumption(decimal quantity)
    {
        ConsumedQuantity += quantity;
    }
}
