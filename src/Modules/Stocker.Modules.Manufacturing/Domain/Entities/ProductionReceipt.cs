using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Üretim giriş kaydı - Üretilen mamul/yarı mamul kayıtları
/// </summary>
public class ProductionReceipt : AggregateRoot<Guid>
{
    public Guid TenantId { get; private set; }
    public string ReceiptNumber { get; private set; } = string.Empty;
    public Guid ProductionOrderId { get; private set; }
    public Guid ProductionOperationId { get; private set; }
    public Guid ProductId { get; private set; }
    public Guid? WarehouseId { get; private set; }
    public Guid? LocationId { get; private set; }

    // Miktar Bilgileri
    public decimal PlannedQuantity { get; private set; }
    public decimal ReceivedQuantity { get; private set; }
    public decimal AcceptedQuantity { get; private set; }
    public decimal RejectedQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }
    public string UnitOfMeasure { get; private set; } = string.Empty;

    // Lot/Parti Bilgileri
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public DateTime? ProductionDate { get; private set; }

    // Kalite Bilgileri
    public bool RequiresQualityCheck { get; private set; }
    public bool QualityCheckCompleted { get; private set; }
    public Guid? QualityInspectionId { get; private set; }
    public string QualityStatus { get; private set; } = "Beklemede"; // Beklemede, Onaylı, Reddedildi, Şartlı Kabul

    // Maliyet Bilgileri
    public decimal UnitCost { get; private set; }
    public decimal TotalCost { get; private set; }
    public decimal MaterialCost { get; private set; }
    public decimal LaborCost { get; private set; }
    public decimal OverheadCost { get; private set; }

    // Zaman Bilgileri
    public DateTime ReceiptDate { get; private set; }
    public DateTime? PostingDate { get; private set; }

    // İzlenebilirlik
    public string? TraceabilityCode { get; private set; }
    public string? OriginCountry { get; private set; } = "TR";

    // Onay Bilgileri
    public string Status { get; private set; } = "Taslak"; // Taslak, Onaylandı, İptal
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedAt { get; private set; }

    public string? Notes { get; private set; }
    public Guid CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Guid? ModifiedBy { get; private set; }
    public DateTime? ModifiedAt { get; private set; }

    // Navigation Properties
    public virtual ProductionOrder? ProductionOrder { get; private set; }
    public virtual ProductionOperation? ProductionOperation { get; private set; }
    public virtual QualityInspection? QualityInspection { get; private set; }

    private ProductionReceipt() { }

    public ProductionReceipt(
        Guid id,
        Guid tenantId,
        string receiptNumber,
        Guid productionOrderId,
        Guid productionOperationId,
        Guid productId,
        decimal receivedQuantity,
        string unitOfMeasure,
        Guid createdBy)
    {
        Id = id;
        TenantId = tenantId;
        ReceiptNumber = receiptNumber;
        ProductionOrderId = productionOrderId;
        ProductionOperationId = productionOperationId;
        ProductId = productId;
        ReceivedQuantity = receivedQuantity;
        AcceptedQuantity = receivedQuantity;
        UnitOfMeasure = unitOfMeasure;
        ReceiptDate = DateTime.UtcNow;
        ProductionDate = DateTime.UtcNow;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetWarehouse(Guid warehouseId, Guid? locationId = null)
    {
        WarehouseId = warehouseId;
        LocationId = locationId;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetLotInfo(string lotNumber, string? serialNumber = null, DateTime? expiryDate = null)
    {
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
        ExpiryDate = expiryDate;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetQuantities(decimal accepted, decimal rejected, decimal scrap)
    {
        if (accepted + rejected + scrap != ReceivedQuantity)
            throw new InvalidOperationException("Kabul, red ve hurda miktarları toplamı alınan miktara eşit olmalıdır.");

        AcceptedQuantity = accepted;
        RejectedQuantity = rejected;
        ScrapQuantity = scrap;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetCosts(decimal materialCost, decimal laborCost, decimal overheadCost)
    {
        MaterialCost = materialCost;
        LaborCost = laborCost;
        OverheadCost = overheadCost;
        TotalCost = materialCost + laborCost + overheadCost;
        UnitCost = AcceptedQuantity > 0 ? TotalCost / AcceptedQuantity : 0;
        ModifiedAt = DateTime.UtcNow;
    }

    public void RequireQualityCheck()
    {
        RequiresQualityCheck = true;
        QualityStatus = "Beklemede";
        ModifiedAt = DateTime.UtcNow;
    }

    public void CompleteQualityCheck(Guid qualityInspectionId, string status, decimal? acceptedQty = null, decimal? rejectedQty = null)
    {
        QualityInspectionId = qualityInspectionId;
        QualityCheckCompleted = true;
        QualityStatus = status;

        if (acceptedQty.HasValue && rejectedQty.HasValue)
        {
            AcceptedQuantity = acceptedQty.Value;
            RejectedQuantity = rejectedQty.Value;
        }

        ModifiedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedBy)
    {
        if (RequiresQualityCheck && !QualityCheckCompleted)
            throw new InvalidOperationException("Kalite kontrolü tamamlanmadan onaylanamaz.");

        Status = "Onaylandı";
        ApprovedBy = approvedBy;
        ApprovedAt = DateTime.UtcNow;
        PostingDate = DateTime.UtcNow;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Cancel(Guid modifiedBy, string? reason = null)
    {
        if (Status == "Onaylandı")
            throw new InvalidOperationException("Onaylanmış kayıt iptal edilemez.");

        Status = "İptal";
        Notes = reason ?? Notes;
        ModifiedBy = modifiedBy;
        ModifiedAt = DateTime.UtcNow;
    }
}
