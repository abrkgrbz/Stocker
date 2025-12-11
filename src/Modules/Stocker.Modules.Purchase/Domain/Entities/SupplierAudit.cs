using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Tedarikçi denetimi entity'si - Tedarikçi kalite ve uyumluluk denetimleri
/// Supplier Audit entity - Supplier quality and compliance audits
/// </summary>
public class SupplierAudit : TenantAggregateRoot
{
    private readonly List<SupplierAuditFinding> _findings = new();
    private readonly List<SupplierAuditChecklistItem> _checklistItems = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Denetim numarası / Audit number
    /// </summary>
    public string AuditNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Tedarikçi ID / Supplier ID
    /// </summary>
    public Guid SupplierId { get; private set; }

    /// <summary>
    /// Denetim tipi / Audit type
    /// </summary>
    public SupplierAuditType AuditType { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public SupplierAuditStatus Status { get; private set; }

    /// <summary>
    /// Denetim amacı / Audit purpose
    /// </summary>
    public string? Purpose { get; private set; }

    #endregion

    #region Planlama Bilgileri (Planning Information)

    /// <summary>
    /// Planlanan başlangıç tarihi / Planned start date
    /// </summary>
    public DateTime PlannedStartDate { get; private set; }

    /// <summary>
    /// Planlanan bitiş tarihi / Planned end date
    /// </summary>
    public DateTime PlannedEndDate { get; private set; }

    /// <summary>
    /// Gerçek başlangıç tarihi / Actual start date
    /// </summary>
    public DateTime? ActualStartDate { get; private set; }

    /// <summary>
    /// Gerçek bitiş tarihi / Actual end date
    /// </summary>
    public DateTime? ActualEndDate { get; private set; }

    /// <summary>
    /// Sonraki denetim tarihi / Next audit date
    /// </summary>
    public DateTime? NextAuditDate { get; private set; }

    #endregion

    #region Denetim Ekibi (Audit Team)

    /// <summary>
    /// Baş denetçi ID / Lead auditor ID
    /// </summary>
    public Guid? LeadAuditorId { get; private set; }

    /// <summary>
    /// Baş denetçi adı / Lead auditor name
    /// </summary>
    public string? LeadAuditorName { get; private set; }

    /// <summary>
    /// Denetim ekibi / Audit team
    /// </summary>
    public string? AuditTeam { get; private set; }

    /// <summary>
    /// Harici denetçi / External auditor
    /// </summary>
    public string? ExternalAuditor { get; private set; }

    /// <summary>
    /// Harici denetçi firma / External auditor company
    /// </summary>
    public string? ExternalAuditorCompany { get; private set; }

    #endregion

    #region Kapsam Bilgileri (Scope Information)

    /// <summary>
    /// Denetim kapsamı / Audit scope
    /// </summary>
    public string? Scope { get; private set; }

    /// <summary>
    /// Denetlenen alanlar / Audited areas
    /// </summary>
    public string? AuditedAreas { get; private set; }

    /// <summary>
    /// Denetlenen prosesler / Audited processes
    /// </summary>
    public string? AuditedProcesses { get; private set; }

    /// <summary>
    /// Referans standartlar / Reference standards
    /// </summary>
    public string? ReferenceStandards { get; private set; }

    /// <summary>
    /// Önceki denetim ID / Previous audit ID
    /// </summary>
    public Guid? PreviousAuditId { get; private set; }

    #endregion

    #region Lokasyon Bilgileri (Location Information)

    /// <summary>
    /// Denetim lokasyonu / Audit location
    /// </summary>
    public string? AuditLocation { get; private set; }

    /// <summary>
    /// Adres / Address
    /// </summary>
    public string? Address { get; private set; }

    /// <summary>
    /// Şehir / City
    /// </summary>
    public string? City { get; private set; }

    /// <summary>
    /// Ülke / Country
    /// </summary>
    public string? Country { get; private set; }

    /// <summary>
    /// Uzaktan denetim mi? / Is remote audit?
    /// </summary>
    public bool IsRemoteAudit { get; private set; }

    #endregion

    #region Sonuç Bilgileri (Result Information)

    /// <summary>
    /// Genel sonuç / Overall result
    /// </summary>
    public AuditResult? OverallResult { get; private set; }

    /// <summary>
    /// Genel puan / Overall score
    /// </summary>
    public decimal? OverallScore { get; private set; }

    /// <summary>
    /// Puan yüzdesi (%) / Score percentage (%)
    /// </summary>
    public decimal? ScorePercentage { get; private set; }

    /// <summary>
    /// Risk değerlendirmesi / Risk assessment
    /// </summary>
    public AuditRiskLevel? RiskLevel { get; private set; }

    /// <summary>
    /// Özet / Summary
    /// </summary>
    public string? Summary { get; private set; }

    /// <summary>
    /// Sonuç ve öneriler / Conclusions and recommendations
    /// </summary>
    public string? Conclusions { get; private set; }

    #endregion

    #region Bulgu İstatistikleri (Finding Statistics)

    /// <summary>
    /// Toplam bulgu sayısı / Total findings count
    /// </summary>
    public int TotalFindingsCount { get; private set; }

    /// <summary>
    /// Kritik bulgu sayısı / Critical findings count
    /// </summary>
    public int CriticalFindingsCount { get; private set; }

    /// <summary>
    /// Major bulgu sayısı / Major findings count
    /// </summary>
    public int MajorFindingsCount { get; private set; }

    /// <summary>
    /// Minor bulgu sayısı / Minor findings count
    /// </summary>
    public int MinorFindingsCount { get; private set; }

    /// <summary>
    /// Kapatılan bulgu sayısı / Closed findings count
    /// </summary>
    public int ClosedFindingsCount { get; private set; }

    #endregion

    #region Onay Bilgileri (Approval Information)

    /// <summary>
    /// Onaylayan ID / Approved by ID
    /// </summary>
    public Guid? ApprovedById { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Rapor onaylandı mı? / Report approved?
    /// </summary>
    public bool IsReportApproved { get; private set; }

    #endregion

    #region Belge Bilgileri (Document Information)

    /// <summary>
    /// Rapor URL / Report URL
    /// </summary>
    public string? ReportUrl { get; private set; }

    /// <summary>
    /// Rapor tarihi / Report date
    /// </summary>
    public DateTime? ReportDate { get; private set; }

    /// <summary>
    /// Ekler / Attachments
    /// </summary>
    public string? AttachmentsJson { get; private set; }

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
    public virtual SupplierAudit? PreviousAudit { get; private set; }
    public virtual IReadOnlyCollection<SupplierAuditFinding> Findings => _findings.AsReadOnly();
    public virtual IReadOnlyCollection<SupplierAuditChecklistItem> ChecklistItems => _checklistItems.AsReadOnly();

    protected SupplierAudit() : base() { }

    public static SupplierAudit Create(
        string auditNumber,
        Guid supplierId,
        SupplierAuditType auditType,
        DateTime plannedStartDate,
        DateTime plannedEndDate,
        Guid tenantId)
    {
        var audit = new SupplierAudit();
        audit.Id = Guid.NewGuid();
        audit.SetTenantId(tenantId);
        audit.AuditNumber = auditNumber;
        audit.SupplierId = supplierId;
        audit.AuditType = auditType;
        audit.PlannedStartDate = plannedStartDate;
        audit.PlannedEndDate = plannedEndDate;
        audit.Status = SupplierAuditStatus.Planned;
        audit.CreatedAt = DateTime.UtcNow;
        return audit;
    }

    public SupplierAuditFinding AddFinding(
        FindingSeverity severity,
        string title,
        string description,
        string? area = null)
    {
        var finding = new SupplierAuditFinding(Id, severity, title, description, area);
        _findings.Add(finding);
        UpdateFindingStatistics();
        return finding;
    }

    public void RemoveFinding(Guid findingId)
    {
        var finding = _findings.FirstOrDefault(f => f.Id == findingId);
        if (finding != null)
        {
            _findings.Remove(finding);
            UpdateFindingStatistics();
        }
    }

    public SupplierAuditChecklistItem AddChecklistItem(
        string category,
        string question,
        int sortOrder = 0)
    {
        var item = new SupplierAuditChecklistItem(Id, category, question, sortOrder);
        _checklistItems.Add(item);
        return item;
    }

    private void UpdateFindingStatistics()
    {
        TotalFindingsCount = _findings.Count;
        CriticalFindingsCount = _findings.Count(f => f.Severity == FindingSeverity.Critical);
        MajorFindingsCount = _findings.Count(f => f.Severity == FindingSeverity.Major);
        MinorFindingsCount = _findings.Count(f => f.Severity == FindingSeverity.Minor);
        ClosedFindingsCount = _findings.Count(f => f.Status == FindingStatus.Closed);
        UpdatedAt = DateTime.UtcNow;
    }

    public void Start()
    {
        if (Status != SupplierAuditStatus.Planned)
            throw new InvalidOperationException("Only planned audits can be started");

        Status = SupplierAuditStatus.InProgress;
        ActualStartDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete(AuditResult result, decimal? score, string? summary)
    {
        Status = SupplierAuditStatus.Completed;
        ActualEndDate = DateTime.UtcNow;
        OverallResult = result;
        OverallScore = score;
        Summary = summary;

        // Calculate risk level based on findings
        if (CriticalFindingsCount > 0)
            RiskLevel = AuditRiskLevel.Critical;
        else if (MajorFindingsCount > 2)
            RiskLevel = AuditRiskLevel.High;
        else if (MajorFindingsCount > 0 || MinorFindingsCount > 5)
            RiskLevel = AuditRiskLevel.Medium;
        else
            RiskLevel = AuditRiskLevel.Low;

        UpdatedAt = DateTime.UtcNow;
    }

    public void ApproveReport(Guid approvedById)
    {
        IsReportApproved = true;
        ApprovedById = approvedById;
        ApprovalDate = DateTime.UtcNow;
        Status = SupplierAuditStatus.ReportApproved;
        UpdatedAt = DateTime.UtcNow;
    }

    public void CloseAudit()
    {
        if (_findings.Any(f => f.Status != FindingStatus.Closed && f.Severity >= FindingSeverity.Major))
            throw new InvalidOperationException("Cannot close audit with open major findings");

        Status = SupplierAuditStatus.Closed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        Status = SupplierAuditStatus.Cancelled;
        Notes = $"İptal nedeni: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void Postpone(DateTime newStartDate, DateTime newEndDate, string reason)
    {
        PlannedStartDate = newStartDate;
        PlannedEndDate = newEndDate;
        Status = SupplierAuditStatus.Postponed;
        Notes = $"Erteleme nedeni: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAuditTeam(Guid? leadAuditorId, string? leadName, string? team, string? external, string? externalCompany)
    {
        LeadAuditorId = leadAuditorId;
        LeadAuditorName = leadName;
        AuditTeam = team;
        ExternalAuditor = external;
        ExternalAuditorCompany = externalCompany;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetScope(string? scope, string? areas, string? processes, string? standards)
    {
        Scope = scope;
        AuditedAreas = areas;
        AuditedProcesses = processes;
        ReferenceStandards = standards;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetLocation(string? location, string? address, string? city, string? country, bool isRemote)
    {
        AuditLocation = location;
        Address = address;
        City = city;
        Country = country;
        IsRemoteAudit = isRemote;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetReport(string url, DateTime? reportDate)
    {
        ReportUrl = url;
        ReportDate = reportDate ?? DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetConclusions(string? conclusions) => Conclusions = conclusions;
    public void SetNextAuditDate(DateTime? date) => NextAuditDate = date;
    public void SetPreviousAudit(Guid? auditId) => PreviousAuditId = auditId;
    public void SetPurpose(string? purpose) => Purpose = purpose;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;
}

/// <summary>
/// Denetim bulgusu / Audit finding
/// </summary>
public class SupplierAuditFinding : TenantAggregateRoot
{
    public Guid SupplierAuditId { get; private set; }

    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? Area { get; private set; }
    public string? Clause { get; private set; }

    public FindingSeverity Severity { get; private set; }
    public FindingStatus Status { get; private set; }
    public FindingCategory? Category { get; private set; }

    public string? RootCause { get; private set; }
    public string? CorrectiveAction { get; private set; }
    public string? PreventiveAction { get; private set; }

    public DateTime? DueDate { get; private set; }
    public DateTime? ClosedDate { get; private set; }
    public Guid? ClosedById { get; private set; }

    public string? Evidence { get; private set; }
    public string? Notes { get; private set; }

    public virtual SupplierAudit SupplierAudit { get; private set; } = null!;

    protected SupplierAuditFinding() : base() { }

    public SupplierAuditFinding(
        Guid supplierAuditId,
        FindingSeverity severity,
        string title,
        string description,
        string? area = null) : base()
    {
        Id = Guid.NewGuid();
        SupplierAuditId = supplierAuditId;
        Severity = severity;
        Title = title;
        Description = description;
        Area = area;
        Status = FindingStatus.Open;
    }

    public void SetCorrectiveAction(string? rootCause, string? corrective, string? preventive, DateTime? dueDate)
    {
        RootCause = rootCause;
        CorrectiveAction = corrective;
        PreventiveAction = preventive;
        DueDate = dueDate;
        Status = FindingStatus.ActionPlanned;
    }

    public void StartImplementation()
    {
        Status = FindingStatus.InProgress;
    }

    public void SubmitForVerification()
    {
        Status = FindingStatus.PendingVerification;
    }

    public void Close(Guid closedById)
    {
        Status = FindingStatus.Closed;
        ClosedDate = DateTime.UtcNow;
        ClosedById = closedById;
    }

    public void Reopen()
    {
        Status = FindingStatus.Open;
        ClosedDate = null;
        ClosedById = null;
    }

    public void SetCategory(FindingCategory category) => Category = category;
    public void SetClause(string? clause) => Clause = clause;
    public void SetEvidence(string? evidence) => Evidence = evidence;
    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Denetim kontrol listesi kalemi / Audit checklist item
/// </summary>
public class SupplierAuditChecklistItem : TenantAggregateRoot
{
    public Guid SupplierAuditId { get; private set; }

    public string Category { get; private set; } = string.Empty;
    public string Question { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }

    public ChecklistAnswer? Answer { get; private set; }
    public int? Score { get; private set; }
    public int? MaxScore { get; private set; }

    public string? Observation { get; private set; }
    public string? Evidence { get; private set; }
    public string? Notes { get; private set; }

    public bool IsCompleted { get; private set; }

    public virtual SupplierAudit SupplierAudit { get; private set; } = null!;

    protected SupplierAuditChecklistItem() : base() { }

    public SupplierAuditChecklistItem(
        Guid supplierAuditId,
        string category,
        string question,
        int sortOrder = 0) : base()
    {
        Id = Guid.NewGuid();
        SupplierAuditId = supplierAuditId;
        Category = category;
        Question = question;
        SortOrder = sortOrder;
        MaxScore = 10;
    }

    public void RecordAnswer(ChecklistAnswer answer, int? score, string? observation)
    {
        Answer = answer;
        Score = score;
        Observation = observation;
        IsCompleted = true;
    }

    public void SetEvidence(string? evidence) => Evidence = evidence;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetMaxScore(int maxScore) => MaxScore = maxScore;
}

#region Enums

public enum SupplierAuditType
{
    /// <summary>İlk denetim / Initial audit</summary>
    Initial = 1,

    /// <summary>Yıllık denetim / Annual audit</summary>
    Annual = 2,

    /// <summary>Gözetim denetimi / Surveillance audit</summary>
    Surveillance = 3,

    /// <summary>Takip denetimi / Follow-up audit</summary>
    FollowUp = 4,

    /// <summary>Yeniden sertifikasyon / Re-certification</summary>
    ReCertification = 5,

    /// <summary>Özel denetim / Special audit</summary>
    Special = 6,

    /// <summary>Belge denetimi / Document audit</summary>
    DocumentReview = 7,

    /// <summary>Proses denetimi / Process audit</summary>
    ProcessAudit = 8
}

public enum SupplierAuditStatus
{
    /// <summary>Planlandı / Planned</summary>
    Planned = 1,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 2,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 3,

    /// <summary>Rapor onaylandı / Report approved</summary>
    ReportApproved = 4,

    /// <summary>Kapatıldı / Closed</summary>
    Closed = 5,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 6,

    /// <summary>Ertelendi / Postponed</summary>
    Postponed = 7
}

public enum AuditResult
{
    /// <summary>Başarılı / Pass</summary>
    Pass = 1,

    /// <summary>Şartlı başarılı / Conditional pass</summary>
    ConditionalPass = 2,

    /// <summary>Başarısız / Fail</summary>
    Fail = 3,

    /// <summary>İyileştirme gerekli / Improvement needed</summary>
    ImprovementNeeded = 4
}

public enum AuditRiskLevel
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

public enum FindingSeverity
{
    /// <summary>Gözlem / Observation</summary>
    Observation = 1,

    /// <summary>Minör / Minor</summary>
    Minor = 2,

    /// <summary>Major / Major</summary>
    Major = 3,

    /// <summary>Kritik / Critical</summary>
    Critical = 4
}

public enum FindingStatus
{
    /// <summary>Açık / Open</summary>
    Open = 1,

    /// <summary>Aksiyon planlandı / Action planned</summary>
    ActionPlanned = 2,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 3,

    /// <summary>Doğrulama bekliyor / Pending verification</summary>
    PendingVerification = 4,

    /// <summary>Kapatıldı / Closed</summary>
    Closed = 5
}

public enum FindingCategory
{
    /// <summary>Kalite / Quality</summary>
    Quality = 1,

    /// <summary>Çevre / Environmental</summary>
    Environmental = 2,

    /// <summary>İş güvenliği / Safety</summary>
    Safety = 3,

    /// <summary>Sosyal uyum / Social compliance</summary>
    SocialCompliance = 4,

    /// <summary>Dokümantasyon / Documentation</summary>
    Documentation = 5,

    /// <summary>Proses / Process</summary>
    Process = 6,

    /// <summary>Eğitim / Training</summary>
    Training = 7,

    /// <summary>Altyapı / Infrastructure</summary>
    Infrastructure = 8,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum ChecklistAnswer
{
    /// <summary>Uygun / Compliant</summary>
    Compliant = 1,

    /// <summary>Kısmen uygun / Partially compliant</summary>
    PartiallyCompliant = 2,

    /// <summary>Uygun değil / Non-compliant</summary>
    NonCompliant = 3,

    /// <summary>Uygulanamaz / Not applicable</summary>
    NotApplicable = 4,

    /// <summary>Gözlemlenmedi / Not observed</summary>
    NotObserved = 5
}

#endregion
