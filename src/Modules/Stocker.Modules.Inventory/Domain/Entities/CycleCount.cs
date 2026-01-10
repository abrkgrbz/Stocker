using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Dönemsel sayım planlaması entity'si - ABC analizi ile otomatik planlama
/// Cycle Count entity - Automated planning with ABC analysis
/// Yıllık envanter sayımına alternatif, sürekli doğrulama yaklaşımı
/// </summary>
public class CycleCount : BaseEntity
{
    private readonly List<CycleCountItem> _items = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Sayım planı numarası / Cycle count plan number
    /// </summary>
    public string PlanNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Plan adı / Plan name
    /// </summary>
    public string PlanName { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Sayım türü / Cycle count type
    /// </summary>
    public CycleCountType CountType { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public CycleCountStatus Status { get; private set; }

    #endregion

    #region Planlama Bilgileri (Planning Information)

    /// <summary>
    /// Planlanan başlangıç tarihi / Scheduled start date
    /// </summary>
    public DateTime ScheduledStartDate { get; private set; }

    /// <summary>
    /// Planlanan bitiş tarihi / Scheduled end date
    /// </summary>
    public DateTime ScheduledEndDate { get; private set; }

    /// <summary>
    /// Gerçek başlangıç tarihi / Actual start date
    /// </summary>
    public DateTime? ActualStartDate { get; private set; }

    /// <summary>
    /// Gerçek bitiş tarihi / Actual end date
    /// </summary>
    public DateTime? ActualEndDate { get; private set; }

    /// <summary>
    /// Tekrarlama sıklığı / Recurrence frequency
    /// </summary>
    public RecurrenceFrequency? Frequency { get; private set; }

    /// <summary>
    /// Bir sonraki planlanan tarih / Next scheduled date
    /// </summary>
    public DateTime? NextScheduledDate { get; private set; }

    #endregion

    #region Kapsam Bilgileri (Scope Information)

    /// <summary>
    /// Depo ID / Warehouse ID
    /// </summary>
    public int WarehouseId { get; private set; }

    /// <summary>
    /// Bölge ID (opsiyonel) / Zone ID (optional)
    /// </summary>
    public int? ZoneId { get; private set; }

    /// <summary>
    /// Kategori ID (opsiyonel) / Category ID (optional)
    /// </summary>
    public int? CategoryId { get; private set; }

    /// <summary>
    /// ABC sınıfı filtresi / ABC class filter
    /// </summary>
    public AbcClass? AbcClassFilter { get; private set; }

    /// <summary>
    /// Sadece negatif stoklar / Only negative stocks
    /// </summary>
    public bool OnlyNegativeStocks { get; private set; }

    /// <summary>
    /// Sadece sıfır stoklar / Only zero stocks
    /// </summary>
    public bool OnlyZeroStocks { get; private set; }

    /// <summary>
    /// Son hareket tarihinden bu yana (gün) / Days since last movement
    /// </summary>
    public int? DaysSinceLastMovement { get; private set; }

    #endregion

    #region Sayım Bilgileri (Count Information)

    /// <summary>
    /// Toplam kalem sayısı / Total item count
    /// </summary>
    public int TotalItems { get; private set; }

    /// <summary>
    /// Sayılan kalem sayısı / Counted items
    /// </summary>
    public int CountedItems { get; private set; }

    /// <summary>
    /// Fark bulunan kalem sayısı / Items with variance
    /// </summary>
    public int ItemsWithVariance { get; private set; }

    /// <summary>
    /// İlerleme yüzdesi / Progress percentage
    /// </summary>
    public decimal ProgressPercent => TotalItems > 0 ? (CountedItems * 100m) / TotalItems : 0;

    /// <summary>
    /// Doğruluk yüzdesi / Accuracy percentage
    /// </summary>
    public decimal? AccuracyPercent { get; private set; }

    #endregion

    #region Tolerans Bilgileri (Tolerance Information)

    /// <summary>
    /// Miktar toleransı (%) / Quantity tolerance (%)
    /// </summary>
    public decimal QuantityTolerancePercent { get; private set; } = 0;

    /// <summary>
    /// Değer toleransı / Value tolerance
    /// </summary>
    public decimal? ValueTolerance { get; private set; }

    /// <summary>
    /// Tolerans aşımında otomatik onay engelle / Block auto-approve on tolerance exceeded
    /// </summary>
    public bool BlockAutoApproveOnToleranceExceeded { get; private set; } = true;

    #endregion

    #region Atama Bilgileri (Assignment Information)

    /// <summary>
    /// Atanan kullanıcı / Assigned user
    /// </summary>
    public string? AssignedTo { get; private set; }

    /// <summary>
    /// Atanan kullanıcı ID / Assigned user ID
    /// </summary>
    public Guid? AssignedUserId { get; private set; }

    /// <summary>
    /// Onaylayan / Approved by
    /// </summary>
    public string? ApprovedBy { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovedDate { get; private set; }

    #endregion

    #region Notlar (Notes)

    /// <summary>
    /// Planlama notları / Planning notes
    /// </summary>
    public string? PlanningNotes { get; private set; }

    /// <summary>
    /// Sayım notları / Count notes
    /// </summary>
    public string? CountNotes { get; private set; }

    #endregion

    // Navigation
    public virtual Warehouse Warehouse { get; private set; } = null!;
    public virtual WarehouseZone? Zone { get; private set; }
    public virtual Category? Category { get; private set; }
    public IReadOnlyList<CycleCountItem> Items => _items.AsReadOnly();

    protected CycleCount() { }

    public CycleCount(
        string planNumber,
        string planName,
        int warehouseId,
        DateTime scheduledStartDate,
        DateTime scheduledEndDate,
        CycleCountType countType = CycleCountType.Standard)
    {
        PlanNumber = planNumber;
        PlanName = planName;
        WarehouseId = warehouseId;
        ScheduledStartDate = scheduledStartDate;
        ScheduledEndDate = scheduledEndDate;
        CountType = countType;
        Status = CycleCountStatus.Planned;
    }

    public void RaiseCreatedEvent()
    {
        RaiseDomainEvent(new CycleCountCreatedDomainEvent(
            Id,
            TenantId,
            PlanNumber,
            PlanName,
            WarehouseId,
            CountType.ToString(),
            ScheduledStartDate));
    }

    public static CycleCount CreateAbcBased(
        string planNumber,
        string planName,
        int warehouseId,
        AbcClass abcClass,
        DateTime scheduledStartDate,
        DateTime scheduledEndDate)
    {
        var cycleCount = new CycleCount(planNumber, planName, warehouseId, scheduledStartDate, scheduledEndDate, CycleCountType.AbcBased);
        cycleCount.AbcClassFilter = abcClass;

        // ABC sınıfına göre frekans ayarla
        cycleCount.Frequency = abcClass switch
        {
            AbcClass.A => RecurrenceFrequency.Monthly,
            AbcClass.B => RecurrenceFrequency.Quarterly,
            AbcClass.C => RecurrenceFrequency.Annually,
            _ => RecurrenceFrequency.Quarterly
        };

        return cycleCount;
    }

    public static CycleCount CreateZoneBased(
        string planNumber,
        string planName,
        int warehouseId,
        int zoneId,
        DateTime scheduledStartDate,
        DateTime scheduledEndDate)
    {
        var cycleCount = new CycleCount(planNumber, planName, warehouseId, scheduledStartDate, scheduledEndDate, CycleCountType.ZoneBased);
        cycleCount.ZoneId = zoneId;
        return cycleCount;
    }

    public CycleCountItem AddItem(
        int productId,
        int? locationId,
        decimal systemQuantity,
        decimal? unitCost = null,
        string? lotNumber = null)
    {
        if (Status != CycleCountStatus.Planned && Status != CycleCountStatus.InProgress)
            throw new InvalidOperationException("Sadece planlı veya devam eden sayımlara kalem eklenebilir.");

        var item = new CycleCountItem(Id, productId, locationId, systemQuantity, unitCost, lotNumber);
        _items.Add(item);
        TotalItems = _items.Count;
        return item;
    }

    public void Start()
    {
        if (Status != CycleCountStatus.Planned)
            throw new InvalidOperationException("Sadece planlı sayımlar başlatılabilir.");

        if (!_items.Any())
            throw new InvalidOperationException("En az bir kalem gereklidir.");

        ActualStartDate = DateTime.UtcNow;
        Status = CycleCountStatus.InProgress;

        RaiseDomainEvent(new CycleCountStartedDomainEvent(
            Id,
            TenantId,
            PlanNumber,
            WarehouseId,
            TotalItems,
            ActualStartDate.Value));
    }

    public void RecordCount(int itemId, decimal countedQuantity, string? notes = null)
    {
        if (Status != CycleCountStatus.InProgress)
            throw new InvalidOperationException("Sadece devam eden sayımlarda sayım yapılabilir.");

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException("Kalem bulunamadı.");

        item.RecordCount(countedQuantity, notes);
        UpdateCountStatistics();
    }

    private void UpdateCountStatistics()
    {
        CountedItems = _items.Count(i => i.IsCounted);
        ItemsWithVariance = _items.Count(i => i.IsCounted && i.HasVariance);

        if (CountedItems > 0)
        {
            var accurateItems = _items.Count(i => i.IsCounted && !i.HasVariance);
            AccuracyPercent = (accurateItems * 100m) / CountedItems;
        }
    }

    public void Complete()
    {
        if (Status != CycleCountStatus.InProgress)
            throw new InvalidOperationException("Sadece devam eden sayımlar tamamlanabilir.");

        // Tüm kalemlerin sayılmış olması gerekir
        if (_items.Any(i => !i.IsCounted))
            throw new InvalidOperationException("Tüm kalemler sayılmadan tamamlanamaz.");

        ActualEndDate = DateTime.UtcNow;
        Status = CycleCountStatus.Completed;

        // Sonraki sayım tarihini ayarla
        if (Frequency.HasValue)
        {
            NextScheduledDate = Frequency.Value switch
            {
                RecurrenceFrequency.Daily => DateTime.UtcNow.AddDays(1),
                RecurrenceFrequency.Weekly => DateTime.UtcNow.AddDays(7),
                RecurrenceFrequency.BiWeekly => DateTime.UtcNow.AddDays(14),
                RecurrenceFrequency.Monthly => DateTime.UtcNow.AddMonths(1),
                RecurrenceFrequency.Quarterly => DateTime.UtcNow.AddMonths(3),
                RecurrenceFrequency.SemiAnnually => DateTime.UtcNow.AddMonths(6),
                RecurrenceFrequency.Annually => DateTime.UtcNow.AddYears(1),
                _ => null
            };
        }

        RaiseDomainEvent(new CycleCountCompletedDomainEvent(
            Id,
            TenantId,
            PlanNumber,
            WarehouseId,
            TotalItems,
            CountedItems,
            ItemsWithVariance,
            AccuracyPercent,
            ActualEndDate.Value));
    }

    public void Approve(string approvedBy)
    {
        if (Status != CycleCountStatus.Completed)
            throw new InvalidOperationException("Sadece tamamlanmış sayımlar onaylanabilir.");

        ApprovedBy = approvedBy;
        ApprovedDate = DateTime.UtcNow;
        Status = CycleCountStatus.Approved;

        RaiseDomainEvent(new CycleCountApprovedDomainEvent(
            Id,
            TenantId,
            PlanNumber,
            ApprovedBy,
            ApprovedDate.Value));
    }

    public void Cancel(string reason)
    {
        if (Status == CycleCountStatus.Approved || Status == CycleCountStatus.Processed)
            throw new InvalidOperationException("Onaylı veya işlenmiş sayımlar iptal edilemez.");

        CountNotes = $"İptal nedeni: {reason}. {CountNotes}";
        Status = CycleCountStatus.Cancelled;

        RaiseDomainEvent(new CycleCountCancelledDomainEvent(
            Id,
            TenantId,
            PlanNumber,
            reason));
    }

    public void MarkAsProcessed()
    {
        if (Status != CycleCountStatus.Approved)
            throw new InvalidOperationException("Sadece onaylı sayımlar işlenebilir.");

        Status = CycleCountStatus.Processed;

        RaiseDomainEvent(new CycleCountProcessedDomainEvent(
            Id,
            TenantId,
            PlanNumber,
            WarehouseId,
            ItemsWithVariance));
    }

    public void SetZone(int? zoneId) => ZoneId = zoneId;
    public void SetCategory(int? categoryId) => CategoryId = categoryId;
    public void SetAbcClassFilter(AbcClass? abcClass) => AbcClassFilter = abcClass;
    public void SetFrequency(RecurrenceFrequency? frequency) => Frequency = frequency;
    public void SetTolerance(decimal quantityPercent, decimal? valueTolerance)
    {
        QuantityTolerancePercent = quantityPercent;
        ValueTolerance = valueTolerance;
    }
    public void SetOnlyNegativeStocks(bool value) => OnlyNegativeStocks = value;
    public void SetOnlyZeroStocks(bool value) => OnlyZeroStocks = value;
    public void SetDaysSinceLastMovement(int? days) => DaysSinceLastMovement = days;
    public void AssignTo(string userName, Guid? userId)
    {
        AssignedTo = userName;
        AssignedUserId = userId;
    }
    public void SetDescription(string? description) => Description = description;
    public void SetPlanningNotes(string? notes) => PlanningNotes = notes;
    public void SetCountNotes(string? notes) => CountNotes = notes;
}

/// <summary>
/// Dönemsel sayım kalemi / Cycle count item
/// </summary>
public class CycleCountItem : BaseEntity
{
    public int CycleCountId { get; private set; }
    public int ProductId { get; private set; }
    public int? LocationId { get; private set; }
    public string? LotNumber { get; private set; }
    public decimal SystemQuantity { get; private set; }
    public decimal? CountedQuantity { get; private set; }
    public decimal VarianceQuantity => (CountedQuantity ?? SystemQuantity) - SystemQuantity;
    public decimal VariancePercent => SystemQuantity != 0 ? (VarianceQuantity * 100) / SystemQuantity : 0;
    public bool IsCounted { get; private set; }
    public bool HasVariance => IsCounted && CountedQuantity.HasValue && CountedQuantity.Value != SystemQuantity;
    public decimal? UnitCost { get; private set; }
    public decimal? VarianceValue => UnitCost.HasValue ? VarianceQuantity * UnitCost.Value : null;
    public DateTime? CountedDate { get; private set; }
    public string? CountedBy { get; private set; }
    public string? Notes { get; private set; }
    public int CountAttempts { get; private set; }

    public virtual CycleCount CycleCount { get; private set; } = null!;
    public virtual Product Product { get; private set; } = null!;
    public virtual Location? Location { get; private set; }

    protected CycleCountItem() { }

    public CycleCountItem(
        int cycleCountId,
        int productId,
        int? locationId,
        decimal systemQuantity,
        decimal? unitCost = null,
        string? lotNumber = null)
    {
        CycleCountId = cycleCountId;
        ProductId = productId;
        LocationId = locationId;
        SystemQuantity = systemQuantity;
        UnitCost = unitCost;
        LotNumber = lotNumber;
        IsCounted = false;
        CountAttempts = 0;
    }

    public void RecordCount(decimal countedQuantity, string? notes = null, string? countedBy = null)
    {
        CountedQuantity = countedQuantity;
        CountedDate = DateTime.UtcNow;
        CountedBy = countedBy;
        Notes = notes;
        IsCounted = true;
        CountAttempts++;
    }

    public void Recount()
    {
        IsCounted = false;
        CountedQuantity = null;
        CountedDate = null;
    }
}

#region Enums

public enum CycleCountType
{
    /// <summary>Standart / Standard</summary>
    Standard = 1,

    /// <summary>ABC bazlı / ABC based</summary>
    AbcBased = 2,

    /// <summary>Bölge bazlı / Zone based</summary>
    ZoneBased = 3,

    /// <summary>Kategori bazlı / Category based</summary>
    CategoryBased = 4,

    /// <summary>Rastgele / Random</summary>
    Random = 5,

    /// <summary>Hareket bazlı / Movement based</summary>
    MovementBased = 6
}

public enum CycleCountStatus
{
    /// <summary>Planlandı / Planned</summary>
    Planned = 0,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 1,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 2,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 3,

    /// <summary>İşlendi / Processed</summary>
    Processed = 4,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 5
}

public enum AbcClass
{
    /// <summary>A Sınıfı - Yüksek değer/hareket</summary>
    A = 1,

    /// <summary>B Sınıfı - Orta değer/hareket</summary>
    B = 2,

    /// <summary>C Sınıfı - Düşük değer/hareket</summary>
    C = 3
}

public enum RecurrenceFrequency
{
    /// <summary>Günlük / Daily</summary>
    Daily = 1,

    /// <summary>Haftalık / Weekly</summary>
    Weekly = 2,

    /// <summary>İki haftalık / Bi-weekly</summary>
    BiWeekly = 3,

    /// <summary>Aylık / Monthly</summary>
    Monthly = 4,

    /// <summary>Üç aylık / Quarterly</summary>
    Quarterly = 5,

    /// <summary>Altı aylık / Semi-annually</summary>
    SemiAnnually = 6,

    /// <summary>Yıllık / Annually</summary>
    Annually = 7
}

#endregion
