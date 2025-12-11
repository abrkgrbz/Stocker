using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Satın alma planlama entity'si - Dönemsel satın alma planlaması ve tahminleme
/// Purchase Planning entity - Periodic purchase planning and forecasting
/// </summary>
public class PurchasePlanning : TenantAggregateRoot
{
    private readonly List<PurchasePlanItem> _items = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Plan numarası / Plan number
    /// </summary>
    public string PlanNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Plan adı / Plan name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public PurchasePlanStatus Status { get; private set; }

    /// <summary>
    /// Plan tipi / Plan type
    /// </summary>
    public PurchasePlanType PlanType { get; private set; }

    #endregion

    #region Dönem Bilgileri (Period Information)

    /// <summary>
    /// Plan dönemi / Plan period
    /// </summary>
    public PlanPeriodType PeriodType { get; private set; }

    /// <summary>
    /// Dönem başlangıç tarihi / Period start date
    /// </summary>
    public DateTime PeriodStartDate { get; private set; }

    /// <summary>
    /// Dönem bitiş tarihi / Period end date
    /// </summary>
    public DateTime PeriodEndDate { get; private set; }

    /// <summary>
    /// Yıl / Year
    /// </summary>
    public int Year { get; private set; }

    /// <summary>
    /// Çeyrek / Quarter
    /// </summary>
    public int? Quarter { get; private set; }

    /// <summary>
    /// Ay / Month
    /// </summary>
    public int? Month { get; private set; }

    #endregion

    #region Bütçe Bilgileri (Budget Information)

    /// <summary>
    /// Planlanan bütçe / Planned budget
    /// </summary>
    public decimal PlannedBudget { get; private set; }

    /// <summary>
    /// Onaylanan bütçe / Approved budget
    /// </summary>
    public decimal? ApprovedBudget { get; private set; }

    /// <summary>
    /// Kullanılan bütçe / Used budget
    /// </summary>
    public decimal UsedBudget { get; private set; }

    /// <summary>
    /// Kalan bütçe / Remaining budget
    /// </summary>
    public decimal RemainingBudget => (ApprovedBudget ?? PlannedBudget) - UsedBudget;

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    #endregion

    #region Organizasyon Bilgileri (Organization Information)

    /// <summary>
    /// Departman ID / Department ID
    /// </summary>
    public Guid? DepartmentId { get; private set; }

    /// <summary>
    /// Maliyet merkezi ID / Cost center ID
    /// </summary>
    public Guid? CostCenterId { get; private set; }

    /// <summary>
    /// Proje ID / Project ID
    /// </summary>
    public Guid? ProjectId { get; private set; }

    /// <summary>
    /// Kategori ID / Category ID
    /// </summary>
    public Guid? CategoryId { get; private set; }

    #endregion

    #region Onay Bilgileri (Approval Information)

    /// <summary>
    /// Onay durumu / Approval status
    /// </summary>
    public PlanApprovalStatus ApprovalStatus { get; private set; }

    /// <summary>
    /// Onaylayan ID / Approved by ID
    /// </summary>
    public Guid? ApprovedById { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Onay notları / Approval notes
    /// </summary>
    public string? ApprovalNotes { get; private set; }

    #endregion

    #region Tahminleme Bilgileri (Forecasting Information)

    /// <summary>
    /// Tahmin yöntemi / Forecast method
    /// </summary>
    public ForecastMethod? ForecastMethod { get; private set; }

    /// <summary>
    /// Güven aralığı (%) / Confidence level (%)
    /// </summary>
    public decimal? ConfidenceLevel { get; private set; }

    /// <summary>
    /// Geçmiş dönem referansı / Historical period reference
    /// </summary>
    public string? HistoricalReference { get; private set; }

    /// <summary>
    /// Büyüme oranı (%) / Growth rate (%)
    /// </summary>
    public decimal? GrowthRate { get; private set; }

    /// <summary>
    /// Mevsimsellik faktörü / Seasonality factor
    /// </summary>
    public decimal? SeasonalityFactor { get; private set; }

    #endregion

    #region İzleme Bilgileri (Tracking Information)

    /// <summary>
    /// Oluşturan ID / Created by ID
    /// </summary>
    public Guid? CreatedById { get; private set; }

    /// <summary>
    /// Son güncelleyen ID / Last updated by ID
    /// </summary>
    public Guid? LastUpdatedById { get; private set; }

    /// <summary>
    /// Oluşturma tarihi / Creation date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Güncelleme tarihi / Update date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    #region İstatistikler (Statistics)

    /// <summary>
    /// Toplam kalem sayısı / Total item count
    /// </summary>
    public int TotalItemCount { get; private set; }

    /// <summary>
    /// Tamamlanan kalem sayısı / Completed item count
    /// </summary>
    public int CompletedItemCount { get; private set; }

    /// <summary>
    /// Tamamlanma oranı (%) / Completion rate (%)
    /// </summary>
    public decimal CompletionRate => TotalItemCount > 0 ? (decimal)CompletedItemCount / TotalItemCount * 100 : 0;

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Öncelik / Priority
    /// </summary>
    public PlanPriority Priority { get; private set; }

    #endregion

    // Navigation Properties
    public virtual IReadOnlyCollection<PurchasePlanItem> Items => _items.AsReadOnly();

    protected PurchasePlanning() : base() { }

    public static PurchasePlanning Create(
        string planNumber,
        string name,
        PurchasePlanType planType,
        PlanPeriodType periodType,
        DateTime periodStart,
        DateTime periodEnd,
        decimal plannedBudget,
        Guid tenantId)
    {
        var plan = new PurchasePlanning();
        plan.Id = Guid.NewGuid();
        plan.SetTenantId(tenantId);
        plan.PlanNumber = planNumber;
        plan.Name = name;
        plan.PlanType = planType;
        plan.PeriodType = periodType;
        plan.PeriodStartDate = periodStart;
        plan.PeriodEndDate = periodEnd;
        plan.Year = periodStart.Year;
        plan.PlannedBudget = plannedBudget;
        plan.Currency = "TRY";
        plan.Status = PurchasePlanStatus.Draft;
        plan.ApprovalStatus = PlanApprovalStatus.Pending;
        plan.Priority = PlanPriority.Medium;
        plan.CreatedAt = DateTime.UtcNow;
        return plan;
    }

    public PurchasePlanItem AddItem(
        Guid productId,
        string productName,
        decimal plannedQuantity,
        string unit,
        decimal estimatedUnitPrice)
    {
        var item = new PurchasePlanItem(Id, productId, productName, plannedQuantity, unit, estimatedUnitPrice);
        _items.Add(item);
        TotalItemCount = _items.Count;
        RecalculateBudget();
        return item;
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            TotalItemCount = _items.Count;
            RecalculateBudget();
        }
    }

    private void RecalculateBudget()
    {
        UsedBudget = _items.Sum(i => i.ActualAmount);
    }

    public void Submit()
    {
        if (Status != PurchasePlanStatus.Draft)
            throw new InvalidOperationException("Only draft plans can be submitted");

        Status = PurchasePlanStatus.Submitted;
        ApprovalStatus = PlanApprovalStatus.UnderReview;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, decimal? approvedBudget, string? notes)
    {
        Status = PurchasePlanStatus.Approved;
        ApprovalStatus = PlanApprovalStatus.Approved;
        ApprovedById = approvedById;
        ApprovedBudget = approvedBudget ?? PlannedBudget;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(Guid rejectedById, string reason)
    {
        Status = PurchasePlanStatus.Rejected;
        ApprovalStatus = PlanApprovalStatus.Rejected;
        ApprovedById = rejectedById;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        if (Status != PurchasePlanStatus.Approved)
            throw new InvalidOperationException("Only approved plans can be activated");

        Status = PurchasePlanStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        Status = PurchasePlanStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        Status = PurchasePlanStatus.Cancelled;
        Notes = $"İptal nedeni: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetOrganization(Guid? departmentId, Guid? costCenterId, Guid? projectId)
    {
        DepartmentId = departmentId;
        CostCenterId = costCenterId;
        ProjectId = projectId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetForecastingInfo(ForecastMethod? method, decimal? confidence, decimal? growthRate, decimal? seasonality)
    {
        ForecastMethod = method;
        ConfidenceLevel = confidence;
        GrowthRate = growthRate;
        SeasonalityFactor = seasonality;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateCompletionStats()
    {
        CompletedItemCount = _items.Count(i => i.IsCompleted);
    }

    public void SetNotes(string? notes) => Notes = notes;
    public void SetPriority(PlanPriority priority) => Priority = priority;
    public void SetCategory(Guid? categoryId) => CategoryId = categoryId;
}

/// <summary>
/// Satın alma plan kalemi / Purchase plan item
/// </summary>
public class PurchasePlanItem : TenantAggregateRoot
{
    public Guid PurchasePlanId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string? ProductCode { get; private set; }

    public decimal PlannedQuantity { get; private set; }
    public decimal OrderedQuantity { get; private set; }
    public decimal ReceivedQuantity { get; private set; }
    public string Unit { get; private set; } = string.Empty;

    public decimal EstimatedUnitPrice { get; private set; }
    public decimal? ActualUnitPrice { get; private set; }
    public decimal EstimatedAmount => PlannedQuantity * EstimatedUnitPrice;
    public decimal ActualAmount => OrderedQuantity * (ActualUnitPrice ?? EstimatedUnitPrice);

    public Guid? PreferredSupplierId { get; private set; }
    public string? PreferredSupplierName { get; private set; }

    public DateTime? RequiredDate { get; private set; }
    public PlanItemPriority Priority { get; private set; }
    public PlanItemStatus ItemStatus { get; private set; }

    public string? Specifications { get; private set; }
    public string? Notes { get; private set; }

    public bool IsCompleted => ItemStatus == PlanItemStatus.Completed;

    public virtual PurchasePlanning PurchasePlan { get; private set; } = null!;

    protected PurchasePlanItem() : base() { }

    public PurchasePlanItem(
        Guid purchasePlanId,
        Guid productId,
        string productName,
        decimal plannedQuantity,
        string unit,
        decimal estimatedUnitPrice) : base()
    {
        Id = Guid.NewGuid();
        PurchasePlanId = purchasePlanId;
        ProductId = productId;
        ProductName = productName;
        PlannedQuantity = plannedQuantity;
        Unit = unit;
        EstimatedUnitPrice = estimatedUnitPrice;
        ItemStatus = PlanItemStatus.Planned;
        Priority = PlanItemPriority.Medium;
    }

    public void SetPreferredSupplier(Guid? supplierId, string? supplierName)
    {
        PreferredSupplierId = supplierId;
        PreferredSupplierName = supplierName;
    }

    public void RecordOrder(decimal quantity, decimal actualPrice)
    {
        OrderedQuantity += quantity;
        ActualUnitPrice = actualPrice;
        ItemStatus = PlanItemStatus.Ordered;
    }

    public void RecordReceipt(decimal quantity)
    {
        ReceivedQuantity += quantity;
        if (ReceivedQuantity >= PlannedQuantity)
            ItemStatus = PlanItemStatus.Completed;
        else
            ItemStatus = PlanItemStatus.PartiallyReceived;
    }

    public void UpdateQuantity(decimal quantity, decimal estimatedPrice)
    {
        PlannedQuantity = quantity;
        EstimatedUnitPrice = estimatedPrice;
    }

    public void Cancel()
    {
        ItemStatus = PlanItemStatus.Cancelled;
    }

    public void SetRequiredDate(DateTime? date) => RequiredDate = date;
    public void SetPriority(PlanItemPriority priority) => Priority = priority;
    public void SetSpecifications(string? specs) => Specifications = specs;
    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

public enum PurchasePlanStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>Gönderildi / Submitted</summary>
    Submitted = 2,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 3,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 4,

    /// <summary>Aktif / Active</summary>
    Active = 5,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 6,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 7
}

public enum PurchasePlanType
{
    /// <summary>Yıllık plan / Annual plan</summary>
    Annual = 1,

    /// <summary>Çeyreklik plan / Quarterly plan</summary>
    Quarterly = 2,

    /// <summary>Aylık plan / Monthly plan</summary>
    Monthly = 3,

    /// <summary>Proje bazlı / Project based</summary>
    ProjectBased = 4,

    /// <summary>Ad hoc / Ad hoc</summary>
    AdHoc = 5
}

public enum PlanPeriodType
{
    /// <summary>Yıllık / Annual</summary>
    Annual = 1,

    /// <summary>Yarı yıllık / Semi-annual</summary>
    SemiAnnual = 2,

    /// <summary>Çeyreklik / Quarterly</summary>
    Quarterly = 3,

    /// <summary>Aylık / Monthly</summary>
    Monthly = 4,

    /// <summary>Haftalık / Weekly</summary>
    Weekly = 5
}

public enum PlanApprovalStatus
{
    /// <summary>Bekliyor / Pending</summary>
    Pending = 1,

    /// <summary>İncelemede / Under review</summary>
    UnderReview = 2,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 3,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 4,

    /// <summary>Revizyon gerekli / Revision required</summary>
    RevisionRequired = 5
}

public enum ForecastMethod
{
    /// <summary>Geçmiş veri ortalaması / Historical average</summary>
    HistoricalAverage = 1,

    /// <summary>Hareketli ortalama / Moving average</summary>
    MovingAverage = 2,

    /// <summary>Üstel düzeltme / Exponential smoothing</summary>
    ExponentialSmoothing = 3,

    /// <summary>Mevsimsel düzeltme / Seasonal adjustment</summary>
    SeasonalAdjustment = 4,

    /// <summary>Trend analizi / Trend analysis</summary>
    TrendAnalysis = 5,

    /// <summary>Manuel tahmin / Manual forecast</summary>
    Manual = 6
}

public enum PlanPriority
{
    /// <summary>Düşük / Low</summary>
    Low = 1,

    /// <summary>Orta / Medium</summary>
    Medium = 2,

    /// <summary>Yüksek / High</summary>
    High = 3,

    /// <summary>Acil / Urgent</summary>
    Urgent = 4
}

public enum PlanItemStatus
{
    /// <summary>Planlandı / Planned</summary>
    Planned = 1,

    /// <summary>Sipariş verildi / Ordered</summary>
    Ordered = 2,

    /// <summary>Kısmen teslim alındı / Partially received</summary>
    PartiallyReceived = 3,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 4,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 5
}

public enum PlanItemPriority
{
    /// <summary>Düşük / Low</summary>
    Low = 1,

    /// <summary>Orta / Medium</summary>
    Medium = 2,

    /// <summary>Yüksek / High</summary>
    High = 3,

    /// <summary>Kritik / Critical</summary>
    Critical = 4
}

#endregion
