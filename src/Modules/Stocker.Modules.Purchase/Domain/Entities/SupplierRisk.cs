using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Tedarikçi risk entity'si - Tedarikçi risk değerlendirmesi ve yönetimi
/// Supplier Risk entity - Supplier risk assessment and management
/// </summary>
public class SupplierRisk : TenantAggregateRoot
{
    private readonly List<SupplierRiskFactor> _riskFactors = new();
    private readonly List<SupplierRiskMitigation> _mitigations = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Tedarikçi ID / Supplier ID
    /// </summary>
    public Guid SupplierId { get; private set; }

    /// <summary>
    /// Değerlendirme numarası / Assessment number
    /// </summary>
    public string AssessmentNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Değerlendirme tarihi / Assessment date
    /// </summary>
    public DateTime AssessmentDate { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public RiskAssessmentStatus Status { get; private set; }

    /// <summary>
    /// Değerlendirme tipi / Assessment type
    /// </summary>
    public RiskAssessmentType AssessmentType { get; private set; }

    #endregion

    #region Genel Risk Skorları (Overall Risk Scores)

    /// <summary>
    /// Genel risk seviyesi / Overall risk level
    /// </summary>
    public SupplierRiskLevel OverallRiskLevel { get; private set; }

    /// <summary>
    /// Genel risk skoru (1-100) / Overall risk score (1-100)
    /// </summary>
    public decimal OverallRiskScore { get; private set; }

    /// <summary>
    /// Önceki risk skoru / Previous risk score
    /// </summary>
    public decimal? PreviousRiskScore { get; private set; }

    /// <summary>
    /// Risk trendi / Risk trend
    /// </summary>
    public RiskTrend RiskTrend { get; private set; }

    #endregion

    #region Kategori Bazlı Risk Skorları (Category Risk Scores)

    /// <summary>
    /// Finansal risk skoru / Financial risk score
    /// </summary>
    public decimal FinancialRiskScore { get; private set; }

    /// <summary>
    /// Operasyonel risk skoru / Operational risk score
    /// </summary>
    public decimal OperationalRiskScore { get; private set; }

    /// <summary>
    /// Kalite risk skoru / Quality risk score
    /// </summary>
    public decimal QualityRiskScore { get; private set; }

    /// <summary>
    /// Teslimat risk skoru / Delivery risk score
    /// </summary>
    public decimal DeliveryRiskScore { get; private set; }

    /// <summary>
    /// Uyumluluk risk skoru / Compliance risk score
    /// </summary>
    public decimal ComplianceRiskScore { get; private set; }

    /// <summary>
    /// Stratejik risk skoru / Strategic risk score
    /// </summary>
    public decimal StrategicRiskScore { get; private set; }

    /// <summary>
    /// Coğrafi risk skoru / Geographic risk score
    /// </summary>
    public decimal GeographicRiskScore { get; private set; }

    /// <summary>
    /// Siber güvenlik risk skoru / Cybersecurity risk score
    /// </summary>
    public decimal? CybersecurityRiskScore { get; private set; }

    /// <summary>
    /// ESG risk skoru / ESG risk score
    /// </summary>
    public decimal? EsgRiskScore { get; private set; }

    #endregion

    #region Finansal Göstergeler (Financial Indicators)

    /// <summary>
    /// Mali durum notu / Financial status rating
    /// </summary>
    public string? FinancialRating { get; private set; }

    /// <summary>
    /// Kredi notu / Credit score
    /// </summary>
    public int? CreditScore { get; private set; }

    /// <summary>
    /// Ödeme geçmişi skoru / Payment history score
    /// </summary>
    public decimal? PaymentHistoryScore { get; private set; }

    /// <summary>
    /// Likidite oranı / Liquidity ratio
    /// </summary>
    public decimal? LiquidityRatio { get; private set; }

    /// <summary>
    /// Borç/özsermaye oranı / Debt to equity ratio
    /// </summary>
    public decimal? DebtToEquityRatio { get; private set; }

    /// <summary>
    /// İflas riski var mı? / Is bankruptcy risk?
    /// </summary>
    public bool HasBankruptcyRisk { get; private set; }

    #endregion

    #region Operasyonel Göstergeler (Operational Indicators)

    /// <summary>
    /// Kapasite yeterliliği / Capacity adequacy
    /// </summary>
    public decimal? CapacityAdequacyScore { get; private set; }

    /// <summary>
    /// Tek kaynak bağımlılığı / Single source dependency
    /// </summary>
    public bool SingleSourceDependency { get; private set; }

    /// <summary>
    /// Alternatif tedarikçi var mı? / Has alternative supplier?
    /// </summary>
    public bool HasAlternativeSupplier { get; private set; }

    /// <summary>
    /// Alternatif tedarikçi ID / Alternative supplier ID
    /// </summary>
    public Guid? AlternativeSupplierId { get; private set; }

    /// <summary>
    /// Tedarik zinciri derinliği / Supply chain depth
    /// </summary>
    public int? SupplyChainDepth { get; private set; }

    #endregion

    #region Performans Göstergeleri (Performance Indicators)

    /// <summary>
    /// Zamanında teslimat oranı (%) / On-time delivery rate (%)
    /// </summary>
    public decimal? OnTimeDeliveryRate { get; private set; }

    /// <summary>
    /// Kalite uyum oranı (%) / Quality conformance rate (%)
    /// </summary>
    public decimal? QualityConformanceRate { get; private set; }

    /// <summary>
    /// İade oranı (%) / Return rate (%)
    /// </summary>
    public decimal? ReturnRate { get; private set; }

    /// <summary>
    /// Müşteri şikayet oranı / Customer complaint rate
    /// </summary>
    public decimal? ComplaintRate { get; private set; }

    /// <summary>
    /// Ortalama teslim süresi (gün) / Average lead time (days)
    /// </summary>
    public decimal? AverageLeadTimeDays { get; private set; }

    #endregion

    #region Coğrafi ve Politik Risk (Geographic and Political Risk)

    /// <summary>
    /// Ülke riski / Country risk
    /// </summary>
    public SupplierRiskLevel? CountryRiskLevel { get; private set; }

    /// <summary>
    /// Ülke risk notları / Country risk notes
    /// </summary>
    public string? CountryRiskNotes { get; private set; }

    /// <summary>
    /// Politik istikrarsızlık riski / Political instability risk
    /// </summary>
    public bool HasPoliticalInstabilityRisk { get; private set; }

    /// <summary>
    /// Doğal afet riski / Natural disaster risk
    /// </summary>
    public bool HasNaturalDisasterRisk { get; private set; }

    /// <summary>
    /// Lojistik risk / Logistics risk
    /// </summary>
    public string? LogisticsRiskNotes { get; private set; }

    #endregion

    #region Değerlendirme Bilgileri (Assessment Information)

    /// <summary>
    /// Değerlendiren ID / Assessed by ID
    /// </summary>
    public Guid? AssessedById { get; private set; }

    /// <summary>
    /// Değerlendiren adı / Assessed by name
    /// </summary>
    public string? AssessedByName { get; private set; }

    /// <summary>
    /// Onaylayan ID / Approved by ID
    /// </summary>
    public Guid? ApprovedById { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Sonraki değerlendirme tarihi / Next assessment date
    /// </summary>
    public DateTime? NextAssessmentDate { get; private set; }

    /// <summary>
    /// Değerlendirme sıklığı (ay) / Assessment frequency (months)
    /// </summary>
    public int? AssessmentFrequencyMonths { get; private set; }

    #endregion

    #region Sonuç ve Öneriler (Results and Recommendations)

    /// <summary>
    /// Özet / Summary
    /// </summary>
    public string? Summary { get; private set; }

    /// <summary>
    /// Öneriler / Recommendations
    /// </summary>
    public string? Recommendations { get; private set; }

    /// <summary>
    /// Aksiyon gerekli mi? / Action required?
    /// </summary>
    public bool ActionRequired { get; private set; }

    /// <summary>
    /// Acil aksiyon gerekli mi? / Urgent action required?
    /// </summary>
    public bool UrgentActionRequired { get; private set; }

    /// <summary>
    /// İzleme gerekli mi? / Monitoring required?
    /// </summary>
    public bool MonitoringRequired { get; private set; }

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
    /// Oluşturma tarihi / Creation date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Güncelleme tarihi / Update date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Supplier Supplier { get; private set; } = null!;
    public virtual Supplier? AlternativeSupplier { get; private set; }
    public virtual IReadOnlyCollection<SupplierRiskFactor> RiskFactors => _riskFactors.AsReadOnly();
    public virtual IReadOnlyCollection<SupplierRiskMitigation> Mitigations => _mitigations.AsReadOnly();

    protected SupplierRisk() : base() { }

    public static SupplierRisk Create(
        Guid supplierId,
        string assessmentNumber,
        RiskAssessmentType assessmentType,
        Guid tenantId,
        DateTime? assessmentDate = null)
    {
        var risk = new SupplierRisk();
        risk.Id = Guid.NewGuid();
        risk.SetTenantId(tenantId);
        risk.SupplierId = supplierId;
        risk.AssessmentNumber = assessmentNumber;
        risk.AssessmentType = assessmentType;
        risk.AssessmentDate = assessmentDate ?? DateTime.UtcNow;
        risk.Status = RiskAssessmentStatus.Draft;
        risk.OverallRiskLevel = SupplierRiskLevel.Medium;
        risk.RiskTrend = RiskTrend.Stable;
        risk.AssessmentFrequencyMonths = 12;
        risk.CreatedAt = DateTime.UtcNow;
        return risk;
    }

    public SupplierRiskFactor AddRiskFactor(
        RiskCategory category,
        string factorName,
        decimal probability,
        decimal impact,
        string? description = null)
    {
        var factor = new SupplierRiskFactor(Id, category, factorName, probability, impact, description);
        _riskFactors.Add(factor);
        RecalculateOverallRisk();
        return factor;
    }

    public void RemoveRiskFactor(Guid factorId)
    {
        var factor = _riskFactors.FirstOrDefault(f => f.Id == factorId);
        if (factor != null)
        {
            _riskFactors.Remove(factor);
            RecalculateOverallRisk();
        }
    }

    public SupplierRiskMitigation AddMitigation(
        Guid? riskFactorId,
        string mitigationAction,
        MitigationPriority priority,
        DateTime? dueDate = null)
    {
        var mitigation = new SupplierRiskMitigation(Id, riskFactorId, mitigationAction, priority, dueDate);
        _mitigations.Add(mitigation);
        return mitigation;
    }

    public void RemoveMitigation(Guid mitigationId)
    {
        var mitigation = _mitigations.FirstOrDefault(m => m.Id == mitigationId);
        if (mitigation != null)
            _mitigations.Remove(mitigation);
    }

    private void RecalculateOverallRisk()
    {
        if (!_riskFactors.Any())
        {
            OverallRiskScore = 0;
            return;
        }

        // Calculate weighted average of risk scores
        var totalWeight = _riskFactors.Sum(f => f.Weight);
        if (totalWeight > 0)
        {
            OverallRiskScore = _riskFactors.Sum(f => f.RiskScore * f.Weight) / totalWeight;
        }
        else
        {
            OverallRiskScore = _riskFactors.Average(f => f.RiskScore);
        }

        // Determine risk level based on score
        OverallRiskLevel = OverallRiskScore switch
        {
            >= 80 => SupplierRiskLevel.Critical,
            >= 60 => SupplierRiskLevel.High,
            >= 40 => SupplierRiskLevel.Medium,
            >= 20 => SupplierRiskLevel.Low,
            _ => SupplierRiskLevel.VeryLow
        };

        // Determine trend
        if (PreviousRiskScore.HasValue)
        {
            var diff = OverallRiskScore - PreviousRiskScore.Value;
            RiskTrend = diff switch
            {
                > 10 => RiskTrend.Increasing,
                > 5 => RiskTrend.SlightlyIncreasing,
                < -10 => RiskTrend.Decreasing,
                < -5 => RiskTrend.SlightlyDecreasing,
                _ => RiskTrend.Stable
            };
        }

        // Set action flags based on risk level
        ActionRequired = OverallRiskLevel >= SupplierRiskLevel.High;
        UrgentActionRequired = OverallRiskLevel == SupplierRiskLevel.Critical;
        MonitoringRequired = OverallRiskLevel >= SupplierRiskLevel.Medium;

        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCategoryScores(
        decimal financial,
        decimal operational,
        decimal quality,
        decimal delivery,
        decimal compliance,
        decimal strategic,
        decimal geographic)
    {
        FinancialRiskScore = financial;
        OperationalRiskScore = operational;
        QualityRiskScore = quality;
        DeliveryRiskScore = delivery;
        ComplianceRiskScore = compliance;
        StrategicRiskScore = strategic;
        GeographicRiskScore = geographic;
        RecalculateOverallRisk();
    }

    public void SetFinancialIndicators(
        string? rating,
        int? creditScore,
        decimal? paymentHistory,
        decimal? liquidity,
        decimal? debtToEquity,
        bool bankruptcyRisk)
    {
        FinancialRating = rating;
        CreditScore = creditScore;
        PaymentHistoryScore = paymentHistory;
        LiquidityRatio = liquidity;
        DebtToEquityRatio = debtToEquity;
        HasBankruptcyRisk = bankruptcyRisk;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetOperationalIndicators(
        decimal? capacityScore,
        bool singleSource,
        bool hasAlternative,
        Guid? alternativeSupplierId,
        int? supplyChainDepth)
    {
        CapacityAdequacyScore = capacityScore;
        SingleSourceDependency = singleSource;
        HasAlternativeSupplier = hasAlternative;
        AlternativeSupplierId = alternativeSupplierId;
        SupplyChainDepth = supplyChainDepth;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPerformanceIndicators(
        decimal? onTimeDelivery,
        decimal? qualityConformance,
        decimal? returnRate,
        decimal? complaintRate,
        decimal? avgLeadTime)
    {
        OnTimeDeliveryRate = onTimeDelivery;
        QualityConformanceRate = qualityConformance;
        ReturnRate = returnRate;
        ComplaintRate = complaintRate;
        AverageLeadTimeDays = avgLeadTime;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetGeographicRisks(
        SupplierRiskLevel? countryRisk,
        string? countryNotes,
        bool politicalRisk,
        bool naturalDisasterRisk,
        string? logisticsNotes)
    {
        CountryRiskLevel = countryRisk;
        CountryRiskNotes = countryNotes;
        HasPoliticalInstabilityRisk = politicalRisk;
        HasNaturalDisasterRisk = naturalDisasterRisk;
        LogisticsRiskNotes = logisticsNotes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != RiskAssessmentStatus.Draft)
            throw new InvalidOperationException("Only draft assessments can be submitted");

        Status = RiskAssessmentStatus.UnderReview;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById)
    {
        Status = RiskAssessmentStatus.Approved;
        ApprovedById = approvedById;
        ApprovalDate = DateTime.UtcNow;
        NextAssessmentDate = DateTime.UtcNow.AddMonths(AssessmentFrequencyMonths ?? 12);
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        Status = RiskAssessmentStatus.Rejected;
        Notes = $"Reddedildi: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void Archive()
    {
        Status = RiskAssessmentStatus.Archived;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAssessor(Guid? assessorId, string? assessorName)
    {
        AssessedById = assessorId;
        AssessedByName = assessorName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPreviousScore(decimal? score) => PreviousRiskScore = score;
    public void SetEsgScore(decimal? score) => EsgRiskScore = score;
    public void SetCybersecurityScore(decimal? score) => CybersecurityRiskScore = score;
    public void SetSummary(string? summary) => Summary = summary;
    public void SetRecommendations(string? recommendations) => Recommendations = recommendations;
    public void SetAssessmentFrequency(int? months) => AssessmentFrequencyMonths = months;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;
}

/// <summary>
/// Risk faktörü / Risk factor
/// </summary>
public class SupplierRiskFactor : TenantAggregateRoot
{
    public Guid SupplierRiskId { get; private set; }

    public RiskCategory Category { get; private set; }
    public string FactorName { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    public decimal Probability { get; private set; } // 1-10
    public decimal Impact { get; private set; } // 1-10
    public decimal RiskScore => Probability * Impact; // 1-100
    public decimal Weight { get; private set; } = 1;

    public SupplierRiskLevel RiskLevel => RiskScore switch
    {
        >= 80 => SupplierRiskLevel.Critical,
        >= 60 => SupplierRiskLevel.High,
        >= 40 => SupplierRiskLevel.Medium,
        >= 20 => SupplierRiskLevel.Low,
        _ => SupplierRiskLevel.VeryLow
    };

    public bool IsActive { get; private set; } = true;
    public string? Notes { get; private set; }

    public virtual SupplierRisk SupplierRisk { get; private set; } = null!;

    protected SupplierRiskFactor() : base() { }

    public SupplierRiskFactor(
        Guid supplierRiskId,
        RiskCategory category,
        string factorName,
        decimal probability,
        decimal impact,
        string? description = null) : base()
    {
        Id = Guid.NewGuid();
        SupplierRiskId = supplierRiskId;
        Category = category;
        FactorName = factorName;
        Probability = Math.Clamp(probability, 1, 10);
        Impact = Math.Clamp(impact, 1, 10);
        Description = description;
        Weight = 1;
        IsActive = true;
    }

    public void Update(decimal probability, decimal impact)
    {
        Probability = Math.Clamp(probability, 1, 10);
        Impact = Math.Clamp(impact, 1, 10);
    }

    public void SetWeight(decimal weight) => Weight = Math.Clamp(weight, 0.1m, 10m);
    public void SetDescription(string? description) => Description = description;
    public void SetNotes(string? notes) => Notes = notes;
    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}

/// <summary>
/// Risk azaltma aksiyonu / Risk mitigation action
/// </summary>
public class SupplierRiskMitigation : TenantAggregateRoot
{
    public Guid SupplierRiskId { get; private set; }
    public Guid? RiskFactorId { get; private set; }

    public string MitigationAction { get; private set; } = string.Empty;
    public MitigationPriority Priority { get; private set; }
    public MitigationStatus Status { get; private set; }

    public Guid? AssignedToId { get; private set; }
    public string? AssignedToName { get; private set; }

    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }

    public decimal? CostEstimate { get; private set; }
    public decimal? ActualCost { get; private set; }
    public string Currency { get; private set; } = "TRY";

    public decimal? EffectivenessRating { get; private set; }
    public string? EffectivenessNotes { get; private set; }

    public string? Notes { get; private set; }

    public virtual SupplierRisk SupplierRisk { get; private set; } = null!;
    public virtual SupplierRiskFactor? RiskFactor { get; private set; }

    protected SupplierRiskMitigation() : base() { }

    public SupplierRiskMitigation(
        Guid supplierRiskId,
        Guid? riskFactorId,
        string mitigationAction,
        MitigationPriority priority,
        DateTime? dueDate = null) : base()
    {
        Id = Guid.NewGuid();
        SupplierRiskId = supplierRiskId;
        RiskFactorId = riskFactorId;
        MitigationAction = mitigationAction;
        Priority = priority;
        DueDate = dueDate;
        Status = MitigationStatus.Planned;
        Currency = "TRY";
    }

    public void AssignTo(Guid? userId, string? userName)
    {
        AssignedToId = userId;
        AssignedToName = userName;
    }

    public void StartImplementation()
    {
        Status = MitigationStatus.InProgress;
    }

    public void Complete(DateTime? completedDate = null)
    {
        Status = MitigationStatus.Completed;
        CompletedDate = completedDate ?? DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        Status = MitigationStatus.Cancelled;
        Notes = $"İptal nedeni: {reason}. {Notes}";
    }

    public void RateEffectiveness(decimal rating, string? notes)
    {
        EffectivenessRating = Math.Clamp(rating, 1, 10);
        EffectivenessNotes = notes;
    }

    public void SetCost(decimal? estimate, decimal? actual)
    {
        CostEstimate = estimate;
        ActualCost = actual;
    }

    public void SetDueDate(DateTime? date) => DueDate = date;
    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

public enum SupplierRiskLevel
{
    /// <summary>Çok düşük / Very low</summary>
    VeryLow = 1,

    /// <summary>Düşük / Low</summary>
    Low = 2,

    /// <summary>Orta / Medium</summary>
    Medium = 3,

    /// <summary>Yüksek / High</summary>
    High = 4,

    /// <summary>Kritik / Critical</summary>
    Critical = 5
}

public enum RiskAssessmentStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>İncelemede / Under review</summary>
    UnderReview = 2,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 3,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 4,

    /// <summary>Arşivlendi / Archived</summary>
    Archived = 5
}

public enum RiskAssessmentType
{
    /// <summary>İlk değerlendirme / Initial assessment</summary>
    Initial = 1,

    /// <summary>Periyodik değerlendirme / Periodic assessment</summary>
    Periodic = 2,

    /// <summary>Olay sonrası değerlendirme / Post-incident assessment</summary>
    PostIncident = 3,

    /// <summary>Ad-hoc değerlendirme / Ad-hoc assessment</summary>
    AdHoc = 4,

    /// <summary>Yeniden değerlendirme / Re-assessment</summary>
    Reassessment = 5
}

public enum RiskCategory
{
    /// <summary>Finansal / Financial</summary>
    Financial = 1,

    /// <summary>Operasyonel / Operational</summary>
    Operational = 2,

    /// <summary>Kalite / Quality</summary>
    Quality = 3,

    /// <summary>Teslimat / Delivery</summary>
    Delivery = 4,

    /// <summary>Uyumluluk / Compliance</summary>
    Compliance = 5,

    /// <summary>Stratejik / Strategic</summary>
    Strategic = 6,

    /// <summary>Coğrafi / Geographic</summary>
    Geographic = 7,

    /// <summary>Siber güvenlik / Cybersecurity</summary>
    Cybersecurity = 8,

    /// <summary>ESG / ESG</summary>
    ESG = 9,

    /// <summary>İtibar / Reputation</summary>
    Reputation = 10,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum RiskTrend
{
    /// <summary>Hızla azalıyor / Rapidly decreasing</summary>
    RapidlyDecreasing = 1,

    /// <summary>Azalıyor / Decreasing</summary>
    Decreasing = 2,

    /// <summary>Hafif azalıyor / Slightly decreasing</summary>
    SlightlyDecreasing = 3,

    /// <summary>Sabit / Stable</summary>
    Stable = 4,

    /// <summary>Hafif artıyor / Slightly increasing</summary>
    SlightlyIncreasing = 5,

    /// <summary>Artıyor / Increasing</summary>
    Increasing = 6,

    /// <summary>Hızla artıyor / Rapidly increasing</summary>
    RapidlyIncreasing = 7
}

public enum MitigationPriority
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

public enum MitigationStatus
{
    /// <summary>Planlandı / Planned</summary>
    Planned = 1,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 2,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 3,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 4,

    /// <summary>Ertelendi / Deferred</summary>
    Deferred = 5
}

#endregion
