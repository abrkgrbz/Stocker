using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Şikayet/İtiraz entity'si - Çalışan şikayet yönetimi
/// Grievance entity - Employee complaint management
/// </summary>
public class Grievance : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Şikayet kodu / Grievance code
    /// </summary>
    public string GrievanceCode { get; private set; } = string.Empty;

    /// <summary>
    /// Şikayetçi çalışan ID / Complainant employee ID
    /// </summary>
    public int ComplainantId { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public GrievanceStatus Status { get; private set; }

    /// <summary>
    /// Şikayet türü / Grievance type
    /// </summary>
    public GrievanceType GrievanceType { get; private set; }

    /// <summary>
    /// Öncelik / Priority
    /// </summary>
    public GrievancePriority Priority { get; private set; }

    #endregion

    #region Şikayet Detayları (Grievance Details)

    /// <summary>
    /// Konu / Subject
    /// </summary>
    public string Subject { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Olay tarihi / Incident date
    /// </summary>
    public DateTime? IncidentDate { get; private set; }

    /// <summary>
    /// Olay yeri / Incident location
    /// </summary>
    public string? IncidentLocation { get; private set; }

    /// <summary>
    /// Şikayet edilen kişi ID / Accused person ID
    /// </summary>
    public int? AccusedPersonId { get; private set; }

    /// <summary>
    /// Şikayet edilen kişi açıklaması / Accused person description
    /// </summary>
    public string? AccusedPersonDescription { get; private set; }

    /// <summary>
    /// Tanıklar / Witnesses
    /// </summary>
    public string? Witnesses { get; private set; }

    /// <summary>
    /// Kanıtlar/Belgeler / Evidence/Documents
    /// </summary>
    public string? Evidence { get; private set; }

    #endregion

    #region Gizlilik (Confidentiality)

    /// <summary>
    /// Anonim mi? / Is anonymous?
    /// </summary>
    public bool IsAnonymous { get; private set; }

    /// <summary>
    /// Gizli mi? / Is confidential?
    /// </summary>
    public bool IsConfidential { get; private set; }

    /// <summary>
    /// Misilleme koruması isteniyor mu? / Retaliation protection requested?
    /// </summary>
    public bool RetaliationProtectionRequested { get; private set; }

    #endregion

    #region Atama (Assignment)

    /// <summary>
    /// Atanan kişi ID / Assigned to ID
    /// </summary>
    public int? AssignedToId { get; private set; }

    /// <summary>
    /// HR sorumlusu ID / HR representative ID
    /// </summary>
    public int? HrRepresentativeId { get; private set; }

    /// <summary>
    /// Atama tarihi / Assignment date
    /// </summary>
    public DateTime? AssignedDate { get; private set; }

    #endregion

    #region Tarihler (Dates)

    /// <summary>
    /// Şikayet tarihi / Filed date
    /// </summary>
    public DateTime FiledDate { get; private set; }

    /// <summary>
    /// Alındı onay tarihi / Acknowledged date
    /// </summary>
    public DateTime? AcknowledgedDate { get; private set; }

    /// <summary>
    /// Hedef çözüm tarihi / Target resolution date
    /// </summary>
    public DateTime? TargetResolutionDate { get; private set; }

    /// <summary>
    /// Çözüm tarihi / Resolution date
    /// </summary>
    public DateTime? ResolutionDate { get; private set; }

    /// <summary>
    /// Kapanış tarihi / Closed date
    /// </summary>
    public DateTime? ClosedDate { get; private set; }

    #endregion

    #region Soruşturma (Investigation)

    /// <summary>
    /// Soruşturma gerekli mi? / Investigation required?
    /// </summary>
    public bool InvestigationRequired { get; private set; }

    /// <summary>
    /// Soruşturma başlangıç tarihi / Investigation start date
    /// </summary>
    public DateTime? InvestigationStartDate { get; private set; }

    /// <summary>
    /// Soruşturma bitiş tarihi / Investigation end date
    /// </summary>
    public DateTime? InvestigationEndDate { get; private set; }

    /// <summary>
    /// Soruşturma notları / Investigation notes
    /// </summary>
    public string? InvestigationNotes { get; private set; }

    /// <summary>
    /// Soruşturma bulguları / Investigation findings
    /// </summary>
    public string? InvestigationFindings { get; private set; }

    #endregion

    #region Çözüm (Resolution)

    /// <summary>
    /// Çözüm açıklaması / Resolution description
    /// </summary>
    public string? Resolution { get; private set; }

    /// <summary>
    /// Çözüm türü / Resolution type
    /// </summary>
    public ResolutionType? ResolutionType { get; private set; }

    /// <summary>
    /// Alınan aksiyonlar / Actions taken
    /// </summary>
    public string? ActionsTaken { get; private set; }

    /// <summary>
    /// Önleyici tedbirler / Preventive measures
    /// </summary>
    public string? PreventiveMeasures { get; private set; }

    #endregion

    #region Memnuniyet (Satisfaction)

    /// <summary>
    /// Şikayetçi memnun mu? / Complainant satisfied?
    /// </summary>
    public bool? ComplainantSatisfied { get; private set; }

    /// <summary>
    /// Memnuniyet geri bildirimi / Satisfaction feedback
    /// </summary>
    public string? SatisfactionFeedback { get; private set; }

    /// <summary>
    /// Memnuniyet puanı (1-5) / Satisfaction rating
    /// </summary>
    public int? SatisfactionRating { get; private set; }

    #endregion

    #region Eskalasyon (Escalation)

    /// <summary>
    /// Eskalasyon yapıldı mı? / Was escalated?
    /// </summary>
    public bool WasEscalated { get; private set; }

    /// <summary>
    /// Eskalasyon tarihi / Escalation date
    /// </summary>
    public DateTime? EscalationDate { get; private set; }

    /// <summary>
    /// Eskalasyon nedeni / Escalation reason
    /// </summary>
    public string? EscalationReason { get; private set; }

    /// <summary>
    /// Eskalasyon seviyesi / Escalation level
    /// </summary>
    public int EscalationLevel { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// İç notlar / Internal notes
    /// </summary>
    public string? InternalNotes { get; private set; }

    /// <summary>
    /// Kategori / Category
    /// </summary>
    public string? Category { get; private set; }

    /// <summary>
    /// Alt kategori / Subcategory
    /// </summary>
    public string? Subcategory { get; private set; }

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Complainant { get; private set; } = null!;
    public virtual Employee? AccusedPerson { get; private set; }
    public virtual Employee? AssignedTo { get; private set; }
    public virtual Employee? HrRepresentative { get; private set; }

    protected Grievance() { }

    public Grievance(
        int complainantId,
        string grievanceCode,
        string subject,
        string description,
        GrievanceType grievanceType,
        GrievancePriority priority = GrievancePriority.Medium)
    {
        ComplainantId = complainantId;
        GrievanceCode = grievanceCode;
        Subject = subject;
        Description = description;
        GrievanceType = grievanceType;
        Priority = priority;
        Status = GrievanceStatus.Submitted;
        FiledDate = DateTime.UtcNow;
    }

    public void Acknowledge()
    {
        Status = GrievanceStatus.Acknowledged;
        AcknowledgedDate = DateTime.UtcNow;
    }

    public void AssignTo(int assigneeId, int? hrRepresentativeId = null)
    {
        AssignedToId = assigneeId;
        HrRepresentativeId = hrRepresentativeId;
        AssignedDate = DateTime.UtcNow;
        Status = GrievanceStatus.UnderReview;
    }

    public void StartInvestigation()
    {
        InvestigationRequired = true;
        InvestigationStartDate = DateTime.UtcNow;
        Status = GrievanceStatus.UnderInvestigation;
    }

    public void CompleteInvestigation(string findings)
    {
        InvestigationEndDate = DateTime.UtcNow;
        InvestigationFindings = findings;
        Status = GrievanceStatus.PendingResolution;
    }

    public void Resolve(string resolution, ResolutionType resolutionType, string? actionsTaken = null)
    {
        Resolution = resolution;
        ResolutionType = resolutionType;
        ActionsTaken = actionsTaken;
        ResolutionDate = DateTime.UtcNow;
        Status = GrievanceStatus.Resolved;
    }

    public void Close()
    {
        Status = GrievanceStatus.Closed;
        ClosedDate = DateTime.UtcNow;
    }

    public void Reopen(string reason)
    {
        Status = GrievanceStatus.Reopened;
        InternalNotes = $"{InternalNotes}\n[Yeniden açıldı]: {reason}".Trim();
    }

    public void Withdraw(string? reason = null)
    {
        Status = GrievanceStatus.Withdrawn;
        if (!string.IsNullOrEmpty(reason))
            InternalNotes = $"{InternalNotes}\n[Geri çekildi]: {reason}".Trim();
    }

    public void Escalate(string reason)
    {
        WasEscalated = true;
        EscalationDate = DateTime.UtcNow;
        EscalationReason = reason;
        EscalationLevel++;
        Status = GrievanceStatus.Escalated;
    }

    public void RecordSatisfaction(bool satisfied, int? rating, string? feedback)
    {
        ComplainantSatisfied = satisfied;
        SatisfactionRating = rating;
        SatisfactionFeedback = feedback;
    }

    public void SetIncidentDetails(DateTime? incidentDate, string? location)
    {
        IncidentDate = incidentDate;
        IncidentLocation = location;
    }

    public void SetAccusedPerson(int? personId, string? description)
    {
        AccusedPersonId = personId;
        AccusedPersonDescription = description;
    }

    public void SetConfidentiality(bool isAnonymous, bool isConfidential, bool retaliationProtection)
    {
        IsAnonymous = isAnonymous;
        IsConfidential = isConfidential;
        RetaliationProtectionRequested = retaliationProtection;
    }

    public void SetTargetResolutionDate(DateTime date) => TargetResolutionDate = date;
    public void SetWitnesses(string? witnesses) => Witnesses = witnesses;
    public void SetEvidence(string? evidence) => Evidence = evidence;
    public void SetInvestigationNotes(string? notes) => InvestigationNotes = notes;
    public void SetPreventiveMeasures(string? measures) => PreventiveMeasures = measures;
    public void SetInternalNotes(string? notes) => InternalNotes = notes;
    public void SetCategory(string? category, string? subcategory) { Category = category; Subcategory = subcategory; }
    public void SetTags(string? tags) => Tags = tags;
    public void SetPriority(GrievancePriority priority) => Priority = priority;
}

#region Enums

public enum GrievanceType
{
    /// <summary>İşyeri tacizi / Workplace harassment</summary>
    WorkplaceHarassment = 1,

    /// <summary>Ayrımcılık / Discrimination</summary>
    Discrimination = 2,

    /// <summary>Zorbalık / Bullying</summary>
    Bullying = 3,

    /// <summary>Adaletsiz muamele / Unfair treatment</summary>
    UnfairTreatment = 4,

    /// <summary>Çalışma koşulları / Working conditions</summary>
    WorkingConditions = 5,

    /// <summary>Maaş/Yan haklar / Salary/Benefits</summary>
    SalaryBenefits = 6,

    /// <summary>İş yükü / Workload</summary>
    Workload = 7,

    /// <summary>Yönetim / Management</summary>
    Management = 8,

    /// <summary>Politika ihlali / Policy violation</summary>
    PolicyViolation = 9,

    /// <summary>Güvenlik / Safety</summary>
    Safety = 10,

    /// <summary>Etik ihlali / Ethics violation</summary>
    EthicsViolation = 11,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum GrievanceStatus
{
    /// <summary>Gönderildi / Submitted</summary>
    Submitted = 1,

    /// <summary>Alındı / Acknowledged</summary>
    Acknowledged = 2,

    /// <summary>İnceleniyor / Under review</summary>
    UnderReview = 3,

    /// <summary>Soruşturmada / Under investigation</summary>
    UnderInvestigation = 4,

    /// <summary>Çözüm bekleniyor / Pending resolution</summary>
    PendingResolution = 5,

    /// <summary>Çözüldü / Resolved</summary>
    Resolved = 6,

    /// <summary>Kapatıldı / Closed</summary>
    Closed = 7,

    /// <summary>Yeniden açıldı / Reopened</summary>
    Reopened = 8,

    /// <summary>Eskalasyon / Escalated</summary>
    Escalated = 9,

    /// <summary>Geri çekildi / Withdrawn</summary>
    Withdrawn = 10
}

public enum GrievancePriority
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

public enum ResolutionType
{
    /// <summary>Arabuluculuk / Mediation</summary>
    Mediation = 1,

    /// <summary>Disiplin cezası / Disciplinary action</summary>
    DisciplinaryAction = 2,

    /// <summary>Politika değişikliği / Policy change</summary>
    PolicyChange = 3,

    /// <summary>Eğitim / Training</summary>
    Training = 4,

    /// <summary>Transfer / Transfer</summary>
    Transfer = 5,

    /// <summary>Tazminat / Compensation</summary>
    Compensation = 6,

    /// <summary>Özür / Apology</summary>
    Apology = 7,

    /// <summary>İşlem yapılmadı / No action</summary>
    NoAction = 8,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
