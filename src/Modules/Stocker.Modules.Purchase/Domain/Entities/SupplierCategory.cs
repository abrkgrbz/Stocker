using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Tedarikçi kategorisi entity'si - Tedarikçi sınıflandırma ve gruplandırma
/// Supplier Category entity - Supplier classification and grouping
/// </summary>
public class SupplierCategory : TenantAggregateRoot
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Kategori adı / Category name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Kategori kodu / Category code
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    #endregion

    #region Hiyerarşi (Hierarchy)

    /// <summary>
    /// Üst kategori ID / Parent category ID
    /// </summary>
    public Guid? ParentCategoryId { get; private set; }

    /// <summary>
    /// Hiyerarşi seviyesi / Hierarchy level
    /// </summary>
    public int Level { get; private set; }

    /// <summary>
    /// Hiyerarşi yolu / Hierarchy path
    /// </summary>
    public string? HierarchyPath { get; private set; }

    /// <summary>
    /// Sıralama / Sort order
    /// </summary>
    public int SortOrder { get; private set; }

    #endregion

    #region Varsayılan Ayarlar (Default Settings)

    /// <summary>
    /// Varsayılan ödeme vadesi (gün) / Default payment terms (days)
    /// </summary>
    public int? DefaultPaymentTermDays { get; private set; }

    /// <summary>
    /// Varsayılan para birimi / Default currency
    /// </summary>
    public string? DefaultCurrency { get; private set; }

    /// <summary>
    /// Varsayılan iskonto oranı / Default discount rate
    /// </summary>
    public decimal? DefaultDiscountRate { get; private set; }

    /// <summary>
    /// Minimum sipariş tutarı / Minimum order amount
    /// </summary>
    public decimal? MinimumOrderAmount { get; private set; }

    #endregion

    #region Onay Ayarları (Approval Settings)

    /// <summary>
    /// Onay gerekli mi? / Approval required?
    /// </summary>
    public bool RequiresApproval { get; private set; }

    /// <summary>
    /// Onay limiti / Approval limit
    /// </summary>
    public decimal? ApprovalLimit { get; private set; }

    /// <summary>
    /// Onay iş akışı ID / Approval workflow ID
    /// </summary>
    public Guid? ApprovalWorkflowId { get; private set; }

    #endregion

    #region Kalite Gereksinimleri (Quality Requirements)

    /// <summary>
    /// Sertifika gerekli mi? / Certification required?
    /// </summary>
    public bool CertificationRequired { get; private set; }

    /// <summary>
    /// Gerekli sertifikalar / Required certifications
    /// </summary>
    public string? RequiredCertifications { get; private set; }

    /// <summary>
    /// Minimum değerlendirme puanı / Minimum evaluation score
    /// </summary>
    public decimal? MinimumEvaluationScore { get; private set; }

    /// <summary>
    /// Denetim gerekli mi? / Audit required?
    /// </summary>
    public bool AuditRequired { get; private set; }

    /// <summary>
    /// Denetim sıklığı (ay) / Audit frequency (months)
    /// </summary>
    public int? AuditFrequencyMonths { get; private set; }

    #endregion

    #region Risk Yönetimi (Risk Management)

    /// <summary>
    /// Risk seviyesi / Risk level
    /// </summary>
    public SupplierCategoryRiskLevel RiskLevel { get; private set; }

    /// <summary>
    /// Stratejik önem / Strategic importance
    /// </summary>
    public StrategicImportance StrategicImportance { get; private set; }

    /// <summary>
    /// Çoklu kaynak gerekli mi? / Multi-sourcing required?
    /// </summary>
    public bool MultiSourcingRequired { get; private set; }

    /// <summary>
    /// Minimum tedarikçi sayısı / Minimum supplier count
    /// </summary>
    public int? MinimumSupplierCount { get; private set; }

    #endregion

    #region İstatistikler (Statistics)

    /// <summary>
    /// Toplam tedarikçi sayısı / Total supplier count
    /// </summary>
    public int TotalSupplierCount { get; private set; }

    /// <summary>
    /// Aktif tedarikçi sayısı / Active supplier count
    /// </summary>
    public int ActiveSupplierCount { get; private set; }

    /// <summary>
    /// Yıllık satın alma tutarı / Annual purchase amount
    /// </summary>
    public decimal AnnualPurchaseAmount { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Renk kodu / Color code
    /// </summary>
    public string? ColorCode { get; private set; }

    /// <summary>
    /// İkon / Icon
    /// </summary>
    public string? Icon { get; private set; }

    #endregion

    // Navigation Properties
    public virtual SupplierCategory? ParentCategory { get; private set; }
    public virtual ICollection<SupplierCategory> ChildCategories { get; private set; } = new List<SupplierCategory>();
    public virtual ICollection<Supplier> Suppliers { get; private set; } = new List<Supplier>();

    protected SupplierCategory() : base() { }

    public static SupplierCategory Create(
        string code,
        string name,
        Guid tenantId,
        Guid? parentCategoryId = null)
    {
        var category = new SupplierCategory();
        category.Id = Guid.NewGuid();
        category.SetTenantId(tenantId);
        category.Code = code;
        category.Name = name;
        category.ParentCategoryId = parentCategoryId;
        category.IsActive = true;
        category.Level = parentCategoryId.HasValue ? 1 : 0;
        category.RiskLevel = SupplierCategoryRiskLevel.Medium;
        category.StrategicImportance = StrategicImportance.Medium;
        return category;
    }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void SetParentCategory(Guid? parentId, int level, string? hierarchyPath)
    {
        ParentCategoryId = parentId;
        Level = level;
        HierarchyPath = hierarchyPath;
    }

    public void SetDefaultSettings(int? paymentTermDays, string? currency, decimal? discountRate, decimal? minOrderAmount)
    {
        DefaultPaymentTermDays = paymentTermDays;
        DefaultCurrency = currency;
        DefaultDiscountRate = discountRate;
        MinimumOrderAmount = minOrderAmount;
    }

    public void SetApprovalSettings(bool requiresApproval, decimal? approvalLimit, Guid? workflowId)
    {
        RequiresApproval = requiresApproval;
        ApprovalLimit = approvalLimit;
        ApprovalWorkflowId = workflowId;
    }

    public void SetQualityRequirements(bool certRequired, string? certifications, decimal? minScore, bool auditRequired, int? auditFrequency)
    {
        CertificationRequired = certRequired;
        RequiredCertifications = certifications;
        MinimumEvaluationScore = minScore;
        AuditRequired = auditRequired;
        AuditFrequencyMonths = auditFrequency;
    }

    public void SetRiskManagement(SupplierCategoryRiskLevel riskLevel, StrategicImportance importance, bool multiSourcing, int? minSupplierCount)
    {
        RiskLevel = riskLevel;
        StrategicImportance = importance;
        MultiSourcingRequired = multiSourcing;
        MinimumSupplierCount = minSupplierCount;
    }

    public void UpdateStatistics(int total, int active, decimal annualAmount)
    {
        TotalSupplierCount = total;
        ActiveSupplierCount = active;
        AnnualPurchaseAmount = annualAmount;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
    public void SetSortOrder(int order) => SortOrder = order;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;
    public void SetAppearance(string? colorCode, string? icon)
    {
        ColorCode = colorCode;
        Icon = icon;
    }
}

#region Enums

public enum SupplierCategoryRiskLevel
{
    /// <summary>Çok düşük / Very low</summary>
    VeryLow = 1,

    /// <summary>Düşük / Low</summary>
    Low = 2,

    /// <summary>Orta / Medium</summary>
    Medium = 3,

    /// <summary>Yüksek / High</summary>
    High = 4,

    /// <summary>Çok yüksek / Very high</summary>
    VeryHigh = 5
}

public enum StrategicImportance
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
