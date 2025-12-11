using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Kalite kontrol entity'si - Giriş, çıkış ve süreç içi kalite kontrolleri
/// Quality Control entity - Incoming, outgoing and in-process quality checks
/// ISO 9001, HACCP, GMP standartlarına uygun
/// </summary>
public class QualityControl : BaseEntity
{
    private readonly List<QualityControlItem> _items = new();
    private readonly List<QualityControlAttachment> _attachments = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Kalite kontrol numarası / QC number
    /// </summary>
    public string QcNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Kalite kontrol türü / QC type
    /// </summary>
    public QualityControlType QcType { get; private set; }

    /// <summary>
    /// Kontrol tarihi / Inspection date
    /// </summary>
    public DateTime InspectionDate { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public QualityControlStatus Status { get; private set; }

    #endregion

    #region İlişkili Kayıtlar (Related Records)

    /// <summary>
    /// Ürün ID / Product ID
    /// </summary>
    public int ProductId { get; private set; }

    /// <summary>
    /// Lot numarası / Lot number
    /// </summary>
    public string? LotNumber { get; private set; }

    /// <summary>
    /// Tedarikçi ID / Supplier ID
    /// </summary>
    public int? SupplierId { get; private set; }

    /// <summary>
    /// Satınalma siparişi ID / Purchase order ID
    /// </summary>
    public int? PurchaseOrderId { get; private set; }

    /// <summary>
    /// Satınalma siparişi numarası / Purchase order number
    /// </summary>
    public string? PurchaseOrderNumber { get; private set; }

    /// <summary>
    /// Depo ID / Warehouse ID
    /// </summary>
    public int? WarehouseId { get; private set; }

    #endregion

    #region Miktar Bilgileri (Quantity Information)

    /// <summary>
    /// Kontrol edilen miktar / Inspected quantity
    /// </summary>
    public decimal InspectedQuantity { get; private set; }

    /// <summary>
    /// Kabul edilen miktar / Accepted quantity
    /// </summary>
    public decimal AcceptedQuantity { get; private set; }

    /// <summary>
    /// Reddedilen miktar / Rejected quantity
    /// </summary>
    public decimal RejectedQuantity { get; private set; }

    /// <summary>
    /// Numune miktarı / Sample quantity
    /// </summary>
    public decimal? SampleQuantity { get; private set; }

    /// <summary>
    /// Birim / Unit
    /// </summary>
    public string Unit { get; private set; } = string.Empty;

    #endregion

    #region Sonuç Bilgileri (Result Information)

    /// <summary>
    /// Genel sonuç / Overall result
    /// </summary>
    public QualityControlResult Result { get; private set; }

    /// <summary>
    /// Kalite puanı (0-100) / Quality score
    /// </summary>
    public decimal? QualityScore { get; private set; }

    /// <summary>
    /// Kalite seviyesi / Quality grade
    /// </summary>
    public string? QualityGrade { get; private set; }

    /// <summary>
    /// Red nedeni / Rejection reason
    /// </summary>
    public string? RejectionReason { get; private set; }

    /// <summary>
    /// Red kategorisi / Rejection category
    /// </summary>
    public RejectionCategory? RejectionCategory { get; private set; }

    #endregion

    #region Kontrol Detayları (Inspection Details)

    /// <summary>
    /// Kontrol eden / Inspector
    /// </summary>
    public string? InspectorName { get; private set; }

    /// <summary>
    /// Kontrol eden kullanıcı ID / Inspector user ID
    /// </summary>
    public Guid? InspectorUserId { get; private set; }

    /// <summary>
    /// Kontrol süresi (dakika) / Inspection duration (minutes)
    /// </summary>
    public int? InspectionDurationMinutes { get; private set; }

    /// <summary>
    /// Kontrol lokasyonu / Inspection location
    /// </summary>
    public string? InspectionLocation { get; private set; }

    /// <summary>
    /// Kontrol standardı / Inspection standard
    /// </summary>
    public string? InspectionStandard { get; private set; }

    #endregion

    #region Eylem Bilgileri (Action Information)

    /// <summary>
    /// Önerilen eylem / Recommended action
    /// </summary>
    public QualityAction RecommendedAction { get; private set; }

    /// <summary>
    /// Uygulanan eylem / Applied action
    /// </summary>
    public QualityAction? AppliedAction { get; private set; }

    /// <summary>
    /// Eylem açıklaması / Action description
    /// </summary>
    public string? ActionDescription { get; private set; }

    /// <summary>
    /// Eylem tarihi / Action date
    /// </summary>
    public DateTime? ActionDate { get; private set; }

    #endregion

    #region Notlar (Notes)

    /// <summary>
    /// Kontrol notları / Inspection notes
    /// </summary>
    public string? InspectionNotes { get; private set; }

    /// <summary>
    /// Dahili notlar / Internal notes
    /// </summary>
    public string? InternalNotes { get; private set; }

    /// <summary>
    /// Tedarikçi bildirimi / Supplier notification
    /// </summary>
    public string? SupplierNotification { get; private set; }

    #endregion

    // Navigation
    public virtual Product Product { get; private set; } = null!;
    public virtual Supplier? Supplier { get; private set; }
    public virtual Warehouse? Warehouse { get; private set; }
    public IReadOnlyList<QualityControlItem> Items => _items.AsReadOnly();
    public IReadOnlyList<QualityControlAttachment> Attachments => _attachments.AsReadOnly();

    protected QualityControl() { }

    public QualityControl(
        string qcNumber,
        int productId,
        QualityControlType qcType,
        decimal inspectedQuantity,
        string unit)
    {
        QcNumber = qcNumber;
        ProductId = productId;
        QcType = qcType;
        InspectedQuantity = inspectedQuantity;
        Unit = unit;
        InspectionDate = DateTime.UtcNow;
        Status = QualityControlStatus.Pending;
        Result = QualityControlResult.Pending;
        RecommendedAction = QualityAction.None;
    }

    public static QualityControl CreateIncomingInspection(
        string qcNumber,
        int productId,
        decimal quantity,
        string unit,
        int supplierId,
        string? purchaseOrderNumber = null)
    {
        var qc = new QualityControl(qcNumber, productId, QualityControlType.IncomingInspection, quantity, unit);
        qc.SupplierId = supplierId;
        qc.PurchaseOrderNumber = purchaseOrderNumber;
        return qc;
    }

    public QualityControlItem AddCheckItem(
        string checkName,
        string? specification,
        string? acceptanceCriteria)
    {
        var item = new QualityControlItem(Id, checkName, specification, acceptanceCriteria);
        _items.Add(item);
        return item;
    }

    public void AddAttachment(string fileName, string filePath, string? description = null)
    {
        var attachment = new QualityControlAttachment(Id, fileName, filePath, description);
        _attachments.Add(attachment);
    }

    public void StartInspection(string inspectorName, Guid? inspectorUserId = null)
    {
        if (Status != QualityControlStatus.Pending)
            throw new InvalidOperationException("Sadece bekleyen kontroller başlatılabilir.");

        InspectorName = inspectorName;
        InspectorUserId = inspectorUserId;
        Status = QualityControlStatus.InProgress;
    }

    public void CompleteInspection(
        QualityControlResult result,
        decimal acceptedQty,
        decimal rejectedQty,
        decimal? qualityScore = null,
        string? qualityGrade = null)
    {
        if (Status != QualityControlStatus.InProgress)
            throw new InvalidOperationException("Sadece devam eden kontroller tamamlanabilir.");

        if (acceptedQty + rejectedQty > InspectedQuantity)
            throw new InvalidOperationException("Kabul ve red miktarı toplam miktarı aşamaz.");

        Result = result;
        AcceptedQuantity = acceptedQty;
        RejectedQuantity = rejectedQty;
        QualityScore = qualityScore;
        QualityGrade = qualityGrade;
        Status = QualityControlStatus.Completed;

        // Set recommended action based on result
        RecommendedAction = result switch
        {
            QualityControlResult.Passed => QualityAction.Accept,
            QualityControlResult.Failed => QualityAction.Reject,
            QualityControlResult.PartialPass => QualityAction.PartialAccept,
            QualityControlResult.ConditionalPass => QualityAction.AcceptWithDeviation,
            _ => QualityAction.None
        };
    }

    public void SetRejection(string reason, RejectionCategory category)
    {
        RejectionReason = reason;
        RejectionCategory = category;
    }

    public void ApplyAction(QualityAction action, string? description = null)
    {
        AppliedAction = action;
        ActionDescription = description;
        ActionDate = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == QualityControlStatus.Completed)
            throw new InvalidOperationException("Tamamlanmış kontroller iptal edilemez.");

        InternalNotes = $"İptal nedeni: {reason}. {InternalNotes}";
        Status = QualityControlStatus.Cancelled;
    }

    public void SetLotNumber(string? lotNumber) => LotNumber = lotNumber;
    public void SetWarehouse(int? warehouseId) => WarehouseId = warehouseId;
    public void SetSampleQuantity(decimal? quantity) => SampleQuantity = quantity;
    public void SetInspectionLocation(string? location) => InspectionLocation = location;
    public void SetInspectionStandard(string? standard) => InspectionStandard = standard;
    public void SetInspectionDuration(int? minutes) => InspectionDurationMinutes = minutes;
    public void SetInspectionNotes(string? notes) => InspectionNotes = notes;
    public void SetInternalNotes(string? notes) => InternalNotes = notes;
    public void SetSupplierNotification(string? notification) => SupplierNotification = notification;
}

/// <summary>
/// Kalite kontrol kontrol kalemi / QC check item
/// </summary>
public class QualityControlItem : BaseEntity
{
    public int QualityControlId { get; private set; }
    public string CheckName { get; private set; } = string.Empty;
    public string? Specification { get; private set; }
    public string? AcceptanceCriteria { get; private set; }
    public string? MeasuredValue { get; private set; }
    public bool? IsPassed { get; private set; }
    public string? Notes { get; private set; }
    public int SortOrder { get; private set; }

    public virtual QualityControl QualityControl { get; private set; } = null!;

    protected QualityControlItem() { }

    public QualityControlItem(int qcId, string checkName, string? specification, string? acceptanceCriteria)
    {
        QualityControlId = qcId;
        CheckName = checkName;
        Specification = specification;
        AcceptanceCriteria = acceptanceCriteria;
    }

    public void RecordResult(string? measuredValue, bool isPassed, string? notes = null)
    {
        MeasuredValue = measuredValue;
        IsPassed = isPassed;
        Notes = notes;
    }

    public void SetSortOrder(int order) => SortOrder = order;
}

/// <summary>
/// Kalite kontrol eki / QC attachment
/// </summary>
public class QualityControlAttachment : BaseEntity
{
    public int QualityControlId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string FilePath { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? FileType { get; private set; }
    public long? FileSize { get; private set; }

    public virtual QualityControl QualityControl { get; private set; } = null!;

    protected QualityControlAttachment() { }

    public QualityControlAttachment(int qcId, string fileName, string filePath, string? description = null)
    {
        QualityControlId = qcId;
        FileName = fileName;
        FilePath = filePath;
        Description = description;
    }

    public void SetFileInfo(string? fileType, long? fileSize)
    {
        FileType = fileType;
        FileSize = fileSize;
    }
}

#region Enums

public enum QualityControlType
{
    /// <summary>Giriş kontrolü / Incoming inspection</summary>
    IncomingInspection = 1,

    /// <summary>Çıkış kontrolü / Outgoing inspection</summary>
    OutgoingInspection = 2,

    /// <summary>Süreç içi kontrol / In-process inspection</summary>
    InProcessInspection = 3,

    /// <summary>Final kontrol / Final inspection</summary>
    FinalInspection = 4,

    /// <summary>Periyodik kontrol / Periodic inspection</summary>
    PeriodicInspection = 5,

    /// <summary>Müşteri şikayeti / Customer complaint</summary>
    CustomerComplaint = 6,

    /// <summary>İade kontrolü / Return inspection</summary>
    ReturnInspection = 7
}

public enum QualityControlStatus
{
    /// <summary>Bekliyor / Pending</summary>
    Pending = 0,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 1,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 2,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 3
}

public enum QualityControlResult
{
    /// <summary>Bekliyor / Pending</summary>
    Pending = 0,

    /// <summary>Geçti / Passed</summary>
    Passed = 1,

    /// <summary>Kaldı / Failed</summary>
    Failed = 2,

    /// <summary>Kısmi geçti / Partial pass</summary>
    PartialPass = 3,

    /// <summary>Şartlı geçti / Conditional pass</summary>
    ConditionalPass = 4
}

public enum QualityAction
{
    /// <summary>Yok / None</summary>
    None = 0,

    /// <summary>Kabul et / Accept</summary>
    Accept = 1,

    /// <summary>Reddet / Reject</summary>
    Reject = 2,

    /// <summary>Kısmi kabul / Partial accept</summary>
    PartialAccept = 3,

    /// <summary>Sapma ile kabul / Accept with deviation</summary>
    AcceptWithDeviation = 4,

    /// <summary>Yeniden işle / Rework</summary>
    Rework = 5,

    /// <summary>Tedarikçiye iade / Return to supplier</summary>
    ReturnToSupplier = 6,

    /// <summary>Fire / Scrap</summary>
    Scrap = 7,

    /// <summary>Karantina / Quarantine</summary>
    Quarantine = 8
}

public enum RejectionCategory
{
    /// <summary>Görsel kusur / Visual defect</summary>
    VisualDefect = 1,

    /// <summary>Boyut sapması / Dimensional deviation</summary>
    DimensionalDeviation = 2,

    /// <summary>Fonksiyonel arıza / Functional failure</summary>
    FunctionalFailure = 3,

    /// <summary>Malzeme hatası / Material defect</summary>
    MaterialDefect = 4,

    /// <summary>Ambalaj hasarı / Packaging damage</summary>
    PackagingDamage = 5,

    /// <summary>Kontaminasyon / Contamination</summary>
    Contamination = 6,

    /// <summary>Belge eksikliği / Documentation missing</summary>
    DocumentationMissing = 7,

    /// <summary>Son kullanma tarihi / Expiry date</summary>
    ExpiryDate = 8,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
