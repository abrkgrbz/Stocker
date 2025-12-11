using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Stok düzeltme/ayarlama entity'si - Fire, kayıp, fazlalık, düzeltme işlemleri
/// Inventory Adjustment entity - Scrap, loss, surplus, correction operations
/// Türkiye'de VUK gereği belgelenmesi zorunlu işlemler
/// </summary>
public class InventoryAdjustment : BaseEntity
{
    private readonly List<InventoryAdjustmentItem> _items = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Düzeltme numarası / Adjustment number
    /// </summary>
    public string AdjustmentNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Düzeltme tarihi / Adjustment date
    /// </summary>
    public DateTime AdjustmentDate { get; private set; }

    /// <summary>
    /// Düzeltme türü / Adjustment type
    /// </summary>
    public AdjustmentType AdjustmentType { get; private set; }

    /// <summary>
    /// Düzeltme nedeni / Adjustment reason
    /// </summary>
    public AdjustmentReason Reason { get; private set; }

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    #endregion

    #region Depo Bilgileri (Warehouse Information)

    /// <summary>
    /// Depo ID / Warehouse ID
    /// </summary>
    public int WarehouseId { get; private set; }

    /// <summary>
    /// Lokasyon ID / Location ID
    /// </summary>
    public int? LocationId { get; private set; }

    #endregion

    #region İlişkili Belgeler (Related Documents)

    /// <summary>
    /// Sayım ID (sayım sonucu düzeltme ise) / Stock count ID
    /// </summary>
    public int? StockCountId { get; private set; }

    /// <summary>
    /// Referans belge numarası / Reference document number
    /// </summary>
    public string? ReferenceNumber { get; private set; }

    /// <summary>
    /// Referans belge türü / Reference document type
    /// </summary>
    public string? ReferenceType { get; private set; }

    #endregion

    #region Maliyet Bilgileri (Cost Information)

    /// <summary>
    /// Toplam maliyet etkisi / Total cost impact
    /// </summary>
    public decimal TotalCostImpact { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    #endregion

    #region Onay Bilgileri (Approval Information)

    /// <summary>
    /// Durum / Status
    /// </summary>
    public AdjustmentStatus Status { get; private set; }

    /// <summary>
    /// Onaylayan kullanıcı / Approved by
    /// </summary>
    public string? ApprovedBy { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovedDate { get; private set; }

    /// <summary>
    /// Red nedeni / Rejection reason
    /// </summary>
    public string? RejectionReason { get; private set; }

    #endregion

    #region Notlar (Notes)

    /// <summary>
    /// Dahili notlar / Internal notes
    /// </summary>
    public string? InternalNotes { get; private set; }

    /// <summary>
    /// Muhasebe notları / Accounting notes
    /// </summary>
    public string? AccountingNotes { get; private set; }

    #endregion

    // Navigation
    public virtual Warehouse Warehouse { get; private set; } = null!;
    public virtual Location? Location { get; private set; }
    public virtual StockCount? StockCount { get; private set; }
    public IReadOnlyList<InventoryAdjustmentItem> Items => _items.AsReadOnly();

    protected InventoryAdjustment() { }

    public InventoryAdjustment(
        string adjustmentNumber,
        int warehouseId,
        AdjustmentType adjustmentType,
        AdjustmentReason reason,
        DateTime? adjustmentDate = null)
    {
        AdjustmentNumber = adjustmentNumber;
        WarehouseId = warehouseId;
        AdjustmentType = adjustmentType;
        Reason = reason;
        AdjustmentDate = adjustmentDate ?? DateTime.UtcNow;
        Status = AdjustmentStatus.Draft;
    }

    public static InventoryAdjustment CreateFromStockCount(
        string adjustmentNumber,
        int warehouseId,
        int stockCountId)
    {
        var adjustment = new InventoryAdjustment(
            adjustmentNumber,
            warehouseId,
            AdjustmentType.Correction,
            AdjustmentReason.StockCountVariance);

        adjustment.StockCountId = stockCountId;
        return adjustment;
    }

    public InventoryAdjustmentItem AddItem(
        int productId,
        decimal systemQuantity,
        decimal actualQuantity,
        decimal unitCost,
        string? lotNumber = null,
        string? serialNumber = null)
    {
        if (Status != AdjustmentStatus.Draft)
            throw new InvalidOperationException("Sadece taslak düzeltmelere kalem eklenebilir.");

        var item = new InventoryAdjustmentItem(
            Id,
            productId,
            systemQuantity,
            actualQuantity,
            unitCost,
            lotNumber,
            serialNumber);

        _items.Add(item);
        CalculateTotalCost();
        return item;
    }

    public void RemoveItem(int itemId)
    {
        if (Status != AdjustmentStatus.Draft)
            throw new InvalidOperationException("Sadece taslak düzeltmelerden kalem silinebilir.");

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            CalculateTotalCost();
        }
    }

    private void CalculateTotalCost()
    {
        TotalCostImpact = _items.Sum(i => i.CostImpact);
    }

    public void Submit()
    {
        if (Status != AdjustmentStatus.Draft)
            throw new InvalidOperationException("Sadece taslak düzeltmeler gönderilebilir.");

        if (!_items.Any())
            throw new InvalidOperationException("En az bir kalem gereklidir.");

        Status = AdjustmentStatus.PendingApproval;
    }

    public void Approve(string approvedBy)
    {
        if (Status != AdjustmentStatus.PendingApproval)
            throw new InvalidOperationException("Sadece onay bekleyen düzeltmeler onaylanabilir.");

        ApprovedBy = approvedBy;
        ApprovedDate = DateTime.UtcNow;
        Status = AdjustmentStatus.Approved;
    }

    public void Reject(string rejectedBy, string reason)
    {
        if (Status != AdjustmentStatus.PendingApproval)
            throw new InvalidOperationException("Sadece onay bekleyen düzeltmeler reddedilebilir.");

        ApprovedBy = rejectedBy;
        ApprovedDate = DateTime.UtcNow;
        RejectionReason = reason;
        Status = AdjustmentStatus.Rejected;
    }

    public void Process()
    {
        if (Status != AdjustmentStatus.Approved)
            throw new InvalidOperationException("Sadece onaylı düzeltmeler işlenebilir.");

        Status = AdjustmentStatus.Processed;
    }

    public void Cancel(string reason)
    {
        if (Status == AdjustmentStatus.Processed)
            throw new InvalidOperationException("İşlenmiş düzeltmeler iptal edilemez.");

        InternalNotes = $"İptal nedeni: {reason}. {InternalNotes}";
        Status = AdjustmentStatus.Cancelled;
    }

    public void SetLocation(int? locationId) => LocationId = locationId;
    public void SetDescription(string? description) => Description = description;
    public void SetReferenceDocument(string? referenceNumber, string? referenceType)
    {
        ReferenceNumber = referenceNumber;
        ReferenceType = referenceType;
    }
    public void SetInternalNotes(string? notes) => InternalNotes = notes;
    public void SetAccountingNotes(string? notes) => AccountingNotes = notes;
}

/// <summary>
/// Stok düzeltme kalemi / Inventory adjustment item
/// </summary>
public class InventoryAdjustmentItem : BaseEntity
{
    /// <summary>
    /// Düzeltme ID / Adjustment ID
    /// </summary>
    public int InventoryAdjustmentId { get; private set; }

    /// <summary>
    /// Ürün ID / Product ID
    /// </summary>
    public int ProductId { get; private set; }

    /// <summary>
    /// Sistem miktarı / System quantity
    /// </summary>
    public decimal SystemQuantity { get; private set; }

    /// <summary>
    /// Gerçek miktar / Actual quantity
    /// </summary>
    public decimal ActualQuantity { get; private set; }

    /// <summary>
    /// Fark miktarı / Variance quantity
    /// </summary>
    public decimal VarianceQuantity => ActualQuantity - SystemQuantity;

    /// <summary>
    /// Birim maliyet / Unit cost
    /// </summary>
    public decimal UnitCost { get; private set; }

    /// <summary>
    /// Maliyet etkisi / Cost impact
    /// </summary>
    public decimal CostImpact => VarianceQuantity * UnitCost;

    /// <summary>
    /// Lot numarası / Lot number
    /// </summary>
    public string? LotNumber { get; private set; }

    /// <summary>
    /// Seri numarası / Serial number
    /// </summary>
    public string? SerialNumber { get; private set; }

    /// <summary>
    /// Son kullanma tarihi / Expiry date
    /// </summary>
    public DateTime? ExpiryDate { get; private set; }

    /// <summary>
    /// Neden kodu / Reason code
    /// </summary>
    public string? ReasonCode { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    // Navigation
    public virtual InventoryAdjustment InventoryAdjustment { get; private set; } = null!;
    public virtual Product Product { get; private set; } = null!;

    protected InventoryAdjustmentItem() { }

    public InventoryAdjustmentItem(
        int inventoryAdjustmentId,
        int productId,
        decimal systemQuantity,
        decimal actualQuantity,
        decimal unitCost,
        string? lotNumber = null,
        string? serialNumber = null)
    {
        InventoryAdjustmentId = inventoryAdjustmentId;
        ProductId = productId;
        SystemQuantity = systemQuantity;
        ActualQuantity = actualQuantity;
        UnitCost = unitCost;
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
    }

    public void UpdateQuantities(decimal systemQuantity, decimal actualQuantity)
    {
        SystemQuantity = systemQuantity;
        ActualQuantity = actualQuantity;
    }

    public void SetExpiryDate(DateTime? date) => ExpiryDate = date;
    public void SetReasonCode(string? code) => ReasonCode = code;
    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

/// <summary>
/// Düzeltme türü / Adjustment type
/// </summary>
public enum AdjustmentType
{
    /// <summary>Artış / Increase</summary>
    Increase = 1,

    /// <summary>Azalış / Decrease</summary>
    Decrease = 2,

    /// <summary>Düzeltme / Correction</summary>
    Correction = 3,

    /// <summary>Fire / Scrap</summary>
    Scrap = 4,

    /// <summary>Transfer (dahili) / Internal Transfer</summary>
    InternalTransfer = 5
}

/// <summary>
/// Düzeltme nedeni / Adjustment reason
/// </summary>
public enum AdjustmentReason
{
    /// <summary>Sayım farkı / Stock count variance</summary>
    StockCountVariance = 1,

    /// <summary>Hasar / Damage</summary>
    Damage = 2,

    /// <summary>Kayıp / Loss</summary>
    Loss = 3,

    /// <summary>Hırsızlık / Theft</summary>
    Theft = 4,

    /// <summary>Fire (üretim) / Production scrap</summary>
    ProductionScrap = 5,

    /// <summary>Son kullanma tarihi geçmiş / Expired</summary>
    Expired = 6,

    /// <summary>Kalite reddi / Quality rejection</summary>
    QualityRejection = 7,

    /// <summary>Müşteri iadesi / Customer return</summary>
    CustomerReturn = 8,

    /// <summary>Tedarikçi iadesi / Supplier return</summary>
    SupplierReturn = 9,

    /// <summary>Sistem düzeltmesi / System correction</summary>
    SystemCorrection = 10,

    /// <summary>Başlangıç stoğu / Opening stock</summary>
    OpeningStock = 11,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

/// <summary>
/// Düzeltme durumu / Adjustment status
/// </summary>
public enum AdjustmentStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 0,

    /// <summary>Onay bekliyor / Pending approval</summary>
    PendingApproval = 1,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 2,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 3,

    /// <summary>İşlendi / Processed</summary>
    Processed = 4,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 5
}

#endregion
