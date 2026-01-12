using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Malzeme Rezervasyonu - Üretim emirleri için malzeme tahsisi
/// MRP çıktısı veya manuel olarak oluşturulan malzeme talepleri
/// </summary>
public class MaterialReservation : BaseEntity
{
    public string ReservationNumber { get; private set; } = null!;
    public MaterialReservationStatus Status { get; private set; }
    public MaterialReservationType Type { get; private set; }

    // Referans kayıt
    public int? ProductionOrderId { get; private set; }
    public int? ProductionOrderLineId { get; private set; }
    public int? SalesOrderId { get; private set; }
    public int? ProjectId { get; private set; }
    public int? SubcontractOrderId { get; private set; }
    public int? MrpPlanId { get; private set; }
    public string? ReferenceType { get; private set; }
    public int? ReferenceId { get; private set; }

    // Malzeme bilgileri
    public int ProductId { get; private set; }
    public string? ProductCode { get; private set; }
    public string? ProductName { get; private set; }
    public int? BomLineId { get; private set; }

    // Miktar bilgileri
    public decimal RequiredQuantity { get; private set; }
    public decimal AllocatedQuantity { get; private set; }
    public decimal IssuedQuantity { get; private set; }
    public decimal ReturnedQuantity { get; private set; }
    public string Unit { get; private set; } = "Adet";

    // Tarihler
    public DateTime RequiredDate { get; private set; }
    public DateTime? AllocationDate { get; private set; }
    public DateTime? ExpiryDate { get; private set; }

    // Depo/Lokasyon
    public int? WarehouseId { get; private set; }
    public string? WarehouseCode { get; private set; }
    public int? LocationId { get; private set; }
    public string? LocationCode { get; private set; }

    // Lot/Seri takibi
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    public bool IsLotControlled { get; private set; }
    public bool IsSerialControlled { get; private set; }

    // Öncelik ve planlama
    public int Priority { get; private set; }
    public bool IsUrgent { get; private set; }
    public bool AutoAllocate { get; private set; }

    // Talep eden
    public string? RequestedBy { get; private set; }
    public int? RequestedByUserId { get; private set; }
    public DateTime RequestedDate { get; private set; }

    // Onay
    public bool RequiresApproval { get; private set; }
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }

    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual ProductionOrder? ProductionOrder { get; private set; }
    public virtual ProductionOrderLine? ProductionOrderLine { get; private set; }
    public virtual BomLine? BomLine { get; private set; }
    public virtual ICollection<MaterialReservationAllocation> Allocations { get; private set; } = new List<MaterialReservationAllocation>();
    public virtual ICollection<MaterialReservationIssue> Issues { get; private set; } = new List<MaterialReservationIssue>();

    protected MaterialReservation() { }

    public MaterialReservation(
        string reservationNumber,
        int productId,
        decimal requiredQuantity,
        string unit,
        DateTime requiredDate,
        MaterialReservationType type)
    {
        ReservationNumber = reservationNumber;
        ProductId = productId;
        RequiredQuantity = requiredQuantity;
        Unit = unit;
        RequiredDate = requiredDate;
        Type = type;
        Status = MaterialReservationStatus.Aktif;
        AllocatedQuantity = 0;
        IssuedQuantity = 0;
        ReturnedQuantity = 0;
        Priority = 5; // Default orta öncelik
        RequestedDate = DateTime.UtcNow;
        AutoAllocate = false;
        RequiresApproval = false;
        IsActive = true;
    }

    public void SetProductInfo(string? productCode, string? productName)
    {
        ProductCode = productCode;
        ProductName = productName;
    }

    public void SetProductionOrderReference(int productionOrderId, int? productionOrderLineId, int? bomLineId)
    {
        ProductionOrderId = productionOrderId;
        ProductionOrderLineId = productionOrderLineId;
        BomLineId = bomLineId;
        ReferenceType = "ProductionOrder";
        ReferenceId = productionOrderId;
    }

    public void SetSalesOrderReference(int salesOrderId)
    {
        SalesOrderId = salesOrderId;
        ReferenceType = "SalesOrder";
        ReferenceId = salesOrderId;
    }

    public void SetProjectReference(int projectId)
    {
        ProjectId = projectId;
        ReferenceType = "Project";
        ReferenceId = projectId;
    }

    public void SetSubcontractOrderReference(int subcontractOrderId)
    {
        SubcontractOrderId = subcontractOrderId;
        ReferenceType = "SubcontractOrder";
        ReferenceId = subcontractOrderId;
    }

    public void SetMrpPlanReference(int mrpPlanId)
    {
        MrpPlanId = mrpPlanId;
    }

    public void SetWarehouse(int warehouseId, string? warehouseCode, int? locationId = null, string? locationCode = null)
    {
        WarehouseId = warehouseId;
        WarehouseCode = warehouseCode;
        LocationId = locationId;
        LocationCode = locationCode;
    }

    public void SetLotSerialControl(bool lotControlled, bool serialControlled)
    {
        IsLotControlled = lotControlled;
        IsSerialControlled = serialControlled;
    }

    public void SetLotSerial(string? lotNumber, string? serialNumber)
    {
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
    }

    public void SetPriority(int priority, bool isUrgent)
    {
        Priority = Math.Max(1, Math.Min(10, priority));
        IsUrgent = isUrgent;
    }

    public void SetAutoAllocate(bool autoAllocate)
    {
        AutoAllocate = autoAllocate;
    }

    public void SetRequestedBy(string requestedBy, int? userId)
    {
        RequestedBy = requestedBy;
        RequestedByUserId = userId;
    }

    public void SetApprovalRequired(bool required)
    {
        RequiresApproval = required;
    }

    public void SetExpiryDate(DateTime expiryDate)
    {
        ExpiryDate = expiryDate;
    }

    public void Approve(string approvedBy)
    {
        if (!RequiresApproval)
            throw new InvalidOperationException("Bu rezervasyon onay gerektirmiyor.");

        ApprovedBy = approvedBy;
        ApprovedDate = DateTime.UtcNow;
    }

    /// <summary>
    /// Malzeme tahsisi yapar
    /// </summary>
    public MaterialReservationAllocation Allocate(
        decimal quantity,
        int warehouseId,
        string? warehouseCode,
        int? locationId,
        string? locationCode,
        string? lotNumber,
        string? serialNumber,
        string allocatedBy)
    {
        if (Status != MaterialReservationStatus.Aktif && Status != MaterialReservationStatus.KısmenTahsis)
            throw new InvalidOperationException("Sadece aktif veya kısmi tahsisli rezervasyonlara tahsis yapılabilir.");

        var remainingToAllocate = RequiredQuantity - AllocatedQuantity;
        if (quantity > remainingToAllocate)
            throw new InvalidOperationException($"Tahsis miktarı kalan miktarı aşıyor. Kalan: {remainingToAllocate}");

        var allocation = new MaterialReservationAllocation(
            Id,
            quantity,
            warehouseId,
            allocatedBy);

        allocation.SetWarehouseInfo(warehouseCode, locationId, locationCode);
        allocation.SetLotSerial(lotNumber, serialNumber);

        Allocations.Add(allocation);
        AllocatedQuantity += quantity;
        AllocationDate ??= DateTime.UtcNow;

        UpdateStatus();
        return allocation;
    }

    /// <summary>
    /// Malzeme çıkışı yapar
    /// </summary>
    public MaterialReservationIssue Issue(
        decimal quantity,
        int warehouseId,
        int? stockMovementId,
        string? lotNumber,
        string? serialNumber,
        string issuedBy)
    {
        if (Status != MaterialReservationStatus.KısmenTahsis && Status != MaterialReservationStatus.TamTahsis && Status != MaterialReservationStatus.KısmenTüketildi)
            throw new InvalidOperationException("Malzeme çıkışı sadece tahsis edilmiş rezervasyonlardan yapılabilir.");

        var remainingToIssue = AllocatedQuantity - IssuedQuantity;
        if (quantity > remainingToIssue)
            throw new InvalidOperationException($"Çıkış miktarı tahsis edilen miktarı aşıyor. Tahsis edilen kalan: {remainingToIssue}");

        var issue = new MaterialReservationIssue(
            Id,
            quantity,
            warehouseId,
            issuedBy);

        issue.SetLotSerial(lotNumber, serialNumber);
        if (stockMovementId.HasValue)
            issue.SetStockMovementId(stockMovementId.Value);

        Issues.Add(issue);
        IssuedQuantity += quantity;

        UpdateStatus();
        return issue;
    }

    /// <summary>
    /// Malzeme iadesi kaydeder
    /// </summary>
    public void RecordReturn(decimal quantity, string reason, string returnedBy)
    {
        if (quantity > IssuedQuantity - ReturnedQuantity)
            throw new InvalidOperationException("İade miktarı çıkış miktarını aşıyor.");

        ReturnedQuantity += quantity;

        // Son issue'ya iade bilgisini ekle
        var lastIssue = Issues.LastOrDefault();
        if (lastIssue != null)
        {
            lastIssue.RecordReturn(quantity, reason, returnedBy);
        }

        UpdateStatus();
    }

    /// <summary>
    /// Tahsisi iptal eder
    /// </summary>
    public void CancelAllocation(int allocationId, string reason, string cancelledBy)
    {
        var allocation = Allocations.FirstOrDefault(a => a.Id == allocationId);
        if (allocation == null)
            throw new InvalidOperationException("Tahsis bulunamadı.");

        allocation.Cancel(reason, cancelledBy);
        AllocatedQuantity -= allocation.Quantity;

        UpdateStatus();
    }

    /// <summary>
    /// Rezervasyonu tamamlar
    /// </summary>
    public void Complete()
    {
        if (IssuedQuantity == 0)
            throw new InvalidOperationException("Hiç malzeme çıkışı yapılmadan rezervasyon tamamlanamaz.");

        Status = MaterialReservationStatus.Tamamlandı;
    }

    /// <summary>
    /// Rezervasyonu iptal eder
    /// </summary>
    public void Cancel(string reason)
    {
        if (Status == MaterialReservationStatus.Tamamlandı)
            throw new InvalidOperationException("Tamamlanmış rezervasyon iptal edilemez.");

        Status = MaterialReservationStatus.İptal;
        Notes = $"İptal nedeni: {reason}. {Notes}";

        // Tüm aktif tahsisleri iptal et
        foreach (var allocation in Allocations.Where(a => !a.IsCancelled))
        {
            allocation.Cancel(reason, "Sistem");
        }

        AllocatedQuantity = 0;
    }

    /// <summary>
    /// Rezervasyon süresini kontrol eder ve gerekirse süresi dolmuş olarak işaretler
    /// </summary>
    public bool CheckExpiry()
    {
        if (ExpiryDate.HasValue && DateTime.UtcNow > ExpiryDate.Value && Status != MaterialReservationStatus.Tamamlandı)
        {
            Status = MaterialReservationStatus.Süresi_Doldu;
            return true;
        }
        return false;
    }

    private void UpdateStatus()
    {
        if (IssuedQuantity >= RequiredQuantity)
        {
            Status = MaterialReservationStatus.Tamamlandı;
        }
        else if (IssuedQuantity > 0)
        {
            Status = MaterialReservationStatus.KısmenTüketildi;
        }
        else if (AllocatedQuantity >= RequiredQuantity)
        {
            Status = MaterialReservationStatus.TamTahsis;
        }
        else if (AllocatedQuantity > 0)
        {
            Status = MaterialReservationStatus.KısmenTahsis;
        }
        else
        {
            Status = MaterialReservationStatus.Aktif;
        }
    }

    public void SetNotes(string? notes) => Notes = notes;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    /// <summary>
    /// Kalan ihtiyacı hesaplar
    /// </summary>
    public decimal GetRemainingRequirement()
    {
        return RequiredQuantity - IssuedQuantity + ReturnedQuantity;
    }

    /// <summary>
    /// Tahsis edilebilir kalan miktarı hesaplar
    /// </summary>
    public decimal GetRemainingToAllocate()
    {
        return RequiredQuantity - AllocatedQuantity;
    }

    /// <summary>
    /// Çıkış yapılabilir kalan miktarı hesaplar
    /// </summary>
    public decimal GetRemainingToIssue()
    {
        return AllocatedQuantity - IssuedQuantity;
    }
}

/// <summary>
/// Malzeme Rezervasyon Tahsisi - Stoktan yapılan tahsis kaydı
/// </summary>
public class MaterialReservationAllocation : BaseEntity
{
    public int MaterialReservationId { get; private set; }
    public decimal Quantity { get; private set; }

    // Depo/Lokasyon
    public int WarehouseId { get; private set; }
    public string? WarehouseCode { get; private set; }
    public int? LocationId { get; private set; }
    public string? LocationCode { get; private set; }

    // Lot/Seri
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }

    // Stok referansı
    public int? StockId { get; private set; }

    // Tahsis bilgileri
    public DateTime AllocationDate { get; private set; }
    public string AllocatedBy { get; private set; } = null!;

    // İptal bilgileri
    public bool IsCancelled { get; private set; }
    public string? CancelReason { get; private set; }
    public string? CancelledBy { get; private set; }
    public DateTime? CancelledDate { get; private set; }

    public string? Notes { get; private set; }

    // Navigation
    public virtual MaterialReservation MaterialReservation { get; private set; } = null!;

    protected MaterialReservationAllocation() { }

    public MaterialReservationAllocation(
        int reservationId,
        decimal quantity,
        int warehouseId,
        string allocatedBy)
    {
        MaterialReservationId = reservationId;
        Quantity = quantity;
        WarehouseId = warehouseId;
        AllocatedBy = allocatedBy;
        AllocationDate = DateTime.UtcNow;
        IsCancelled = false;
    }

    public void SetWarehouseInfo(string? warehouseCode, int? locationId, string? locationCode)
    {
        WarehouseCode = warehouseCode;
        LocationId = locationId;
        LocationCode = locationCode;
    }

    public void SetLotSerial(string? lotNumber, string? serialNumber)
    {
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
    }

    public void SetStockId(int stockId)
    {
        StockId = stockId;
    }

    public void Cancel(string reason, string cancelledBy)
    {
        IsCancelled = true;
        CancelReason = reason;
        CancelledBy = cancelledBy;
        CancelledDate = DateTime.UtcNow;
    }

    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Malzeme Rezervasyon Çıkışı - Stoktan yapılan fiili çıkış kaydı
/// </summary>
public class MaterialReservationIssue : BaseEntity
{
    public int MaterialReservationId { get; private set; }
    public decimal Quantity { get; private set; }

    // Depo/Lokasyon
    public int WarehouseId { get; private set; }
    public string? WarehouseCode { get; private set; }
    public int? LocationId { get; private set; }
    public string? LocationCode { get; private set; }

    // Lot/Seri
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }

    // Stok hareketi
    public int? StockMovementId { get; private set; }

    // Çıkış bilgileri
    public DateTime IssueDate { get; private set; }
    public string IssuedBy { get; private set; } = null!;

    // İade bilgileri
    public decimal ReturnedQuantity { get; private set; }
    public string? ReturnReason { get; private set; }
    public string? ReturnedBy { get; private set; }
    public DateTime? ReturnDate { get; private set; }

    public string? Notes { get; private set; }

    // Navigation
    public virtual MaterialReservation MaterialReservation { get; private set; } = null!;

    protected MaterialReservationIssue() { }

    public MaterialReservationIssue(
        int reservationId,
        decimal quantity,
        int warehouseId,
        string issuedBy)
    {
        MaterialReservationId = reservationId;
        Quantity = quantity;
        WarehouseId = warehouseId;
        IssuedBy = issuedBy;
        IssueDate = DateTime.UtcNow;
        ReturnedQuantity = 0;
    }

    public void SetWarehouseInfo(string? warehouseCode, int? locationId, string? locationCode)
    {
        WarehouseCode = warehouseCode;
        LocationId = locationId;
        LocationCode = locationCode;
    }

    public void SetLotSerial(string? lotNumber, string? serialNumber)
    {
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
    }

    public void SetStockMovementId(int stockMovementId)
    {
        StockMovementId = stockMovementId;
    }

    public void RecordReturn(decimal quantity, string reason, string returnedBy)
    {
        if (quantity > Quantity - ReturnedQuantity)
            throw new InvalidOperationException("İade miktarı çıkış miktarını aşıyor.");

        ReturnedQuantity += quantity;
        ReturnReason = reason;
        ReturnedBy = returnedBy;
        ReturnDate = DateTime.UtcNow;
    }

    public void SetNotes(string? notes) => Notes = notes;

    /// <summary>
    /// Net çıkış miktarını hesaplar
    /// </summary>
    public decimal GetNetQuantity()
    {
        return Quantity - ReturnedQuantity;
    }
}
