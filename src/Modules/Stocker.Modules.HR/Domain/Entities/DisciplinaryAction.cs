using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Disiplin işlemi entity'si - Disiplin süreci takibi
/// Disciplinary Action entity - Disciplinary process tracking
/// </summary>
public class DisciplinaryAction : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// İşlem kodu / Action code
    /// </summary>
    public string ActionCode { get; private set; } = string.Empty;

    /// <summary>
    /// Disiplin türü / Action type
    /// </summary>
    public DisciplinaryActionType ActionType { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public DisciplinaryStatus Status { get; private set; }

    /// <summary>
    /// Ciddiyet seviyesi / Severity level
    /// </summary>
    public SeverityLevel SeverityLevel { get; private set; }

    #endregion

    #region Olay Bilgileri (Incident Information)

    /// <summary>
    /// Olay tarihi / Incident date
    /// </summary>
    public DateTime IncidentDate { get; private set; }

    /// <summary>
    /// Olay yeri / Incident location
    /// </summary>
    public string? IncidentLocation { get; private set; }

    /// <summary>
    /// Olay açıklaması / Incident description
    /// </summary>
    public string IncidentDescription { get; private set; } = string.Empty;

    /// <summary>
    /// İhlal edilen kural/politika / Violated rule/policy
    /// </summary>
    public string? ViolatedPolicy { get; private set; }

    /// <summary>
    /// Tanıklar / Witnesses
    /// </summary>
    public string? Witnesses { get; private set; }

    /// <summary>
    /// Kanıtlar / Evidence
    /// </summary>
    public string? Evidence { get; private set; }

    #endregion

    #region Soruşturma (Investigation)

    /// <summary>
    /// Soruşturma başlangıç tarihi / Investigation start date
    /// </summary>
    public DateTime? InvestigationStartDate { get; private set; }

    /// <summary>
    /// Soruşturma bitiş tarihi / Investigation end date
    /// </summary>
    public DateTime? InvestigationEndDate { get; private set; }

    /// <summary>
    /// Soruşturmacı ID / Investigator ID
    /// </summary>
    public int? InvestigatorId { get; private set; }

    /// <summary>
    /// Soruşturma notları / Investigation notes
    /// </summary>
    public string? InvestigationNotes { get; private set; }

    /// <summary>
    /// Soruşturma sonucu / Investigation findings
    /// </summary>
    public string? InvestigationFindings { get; private set; }

    #endregion

    #region Savunma (Defense)

    /// <summary>
    /// Savunma istendi mi? / Defense requested?
    /// </summary>
    public bool DefenseRequested { get; private set; }

    /// <summary>
    /// Savunma son tarihi / Defense deadline
    /// </summary>
    public DateTime? DefenseDeadline { get; private set; }

    /// <summary>
    /// Savunma alındı mı? / Defense received?
    /// </summary>
    public bool DefenseReceived { get; private set; }

    /// <summary>
    /// Savunma tarihi / Defense date
    /// </summary>
    public DateTime? DefenseDate { get; private set; }

    /// <summary>
    /// Savunma metni / Defense text
    /// </summary>
    public string? DefenseText { get; private set; }

    #endregion

    #region Karar (Decision)

    /// <summary>
    /// Karar tarihi / Decision date
    /// </summary>
    public DateTime? DecisionDate { get; private set; }

    /// <summary>
    /// Karar veren ID / Decision maker ID
    /// </summary>
    public int? DecisionMakerId { get; private set; }

    /// <summary>
    /// Karar / Decision
    /// </summary>
    public string? Decision { get; private set; }

    /// <summary>
    /// Karar gerekçesi / Decision rationale
    /// </summary>
    public string? DecisionRationale { get; private set; }

    #endregion

    #region Uygulanan Yaptırım (Applied Sanction)

    /// <summary>
    /// Uygulanan yaptırım / Applied sanction
    /// </summary>
    public AppliedSanction? AppliedSanction { get; private set; }

    /// <summary>
    /// Yaptırım detayı / Sanction details
    /// </summary>
    public string? SanctionDetails { get; private set; }

    /// <summary>
    /// Yaptırım başlangıç tarihi / Sanction start date
    /// </summary>
    public DateTime? SanctionStartDate { get; private set; }

    /// <summary>
    /// Yaptırım bitiş tarihi / Sanction end date
    /// </summary>
    public DateTime? SanctionEndDate { get; private set; }

    /// <summary>
    /// Yaptırım süresi (gün) / Sanction duration (days)
    /// </summary>
    public int? SanctionDurationDays { get; private set; }

    /// <summary>
    /// Maaş kesintisi tutarı / Salary deduction amount
    /// </summary>
    public decimal? SalaryDeductionAmount { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    #endregion

    #region Takip (Follow-up)

    /// <summary>
    /// Takip gerekli mi? / Follow-up required?
    /// </summary>
    public bool FollowUpRequired { get; private set; }

    /// <summary>
    /// Takip tarihi / Follow-up date
    /// </summary>
    public DateTime? FollowUpDate { get; private set; }

    /// <summary>
    /// Takip notu / Follow-up notes
    /// </summary>
    public string? FollowUpNotes { get; private set; }

    /// <summary>
    /// Performans iyileştirme planı var mı? / Has PIP?
    /// </summary>
    public bool HasPerformanceImprovementPlan { get; private set; }

    /// <summary>
    /// PIP ID
    /// </summary>
    public int? PerformanceImprovementPlanId { get; private set; }

    #endregion

    #region İtiraz (Appeal)

    /// <summary>
    /// İtiraz edildi mi? / Was appealed?
    /// </summary>
    public bool WasAppealed { get; private set; }

    /// <summary>
    /// İtiraz tarihi / Appeal date
    /// </summary>
    public DateTime? AppealDate { get; private set; }

    /// <summary>
    /// İtiraz sonucu / Appeal outcome
    /// </summary>
    public AppealOutcome? AppealOutcome { get; private set; }

    /// <summary>
    /// İtiraz notları / Appeal notes
    /// </summary>
    public string? AppealNotes { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Raporlayan ID / Reported by ID
    /// </summary>
    public int? ReportedById { get; private set; }

    /// <summary>
    /// HR sorumlusu ID / HR representative ID
    /// </summary>
    public int? HrRepresentativeId { get; private set; }

    /// <summary>
    /// Gizli mi? / Is confidential?
    /// </summary>
    public bool IsConfidential { get; private set; }

    /// <summary>
    /// Önceki uyarı sayısı / Previous warnings count
    /// </summary>
    public int PreviousWarningsCount { get; private set; }

    /// <summary>
    /// İç notlar / Internal notes
    /// </summary>
    public string? InternalNotes { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee? Investigator { get; private set; }
    public virtual Employee? DecisionMaker { get; private set; }
    public virtual Employee? ReportedBy { get; private set; }
    public virtual Employee? HrRepresentative { get; private set; }

    protected DisciplinaryAction() { }

    public DisciplinaryAction(
        int employeeId,
        string actionCode,
        DateTime incidentDate,
        string incidentDescription,
        DisciplinaryActionType actionType,
        SeverityLevel severityLevel)
    {
        EmployeeId = employeeId;
        ActionCode = actionCode;
        IncidentDate = incidentDate;
        IncidentDescription = incidentDescription;
        ActionType = actionType;
        SeverityLevel = severityLevel;
        Status = DisciplinaryStatus.Reported;
        Currency = "TRY";
    }

    public void StartInvestigation(int investigatorId)
    {
        Status = DisciplinaryStatus.UnderInvestigation;
        InvestigationStartDate = DateTime.UtcNow;
        InvestigatorId = investigatorId;
    }

    public void CompleteInvestigation(string findings)
    {
        InvestigationEndDate = DateTime.UtcNow;
        InvestigationFindings = findings;
    }

    public void RequestDefense(DateTime deadline)
    {
        DefenseRequested = true;
        DefenseDeadline = deadline;
        Status = DisciplinaryStatus.PendingDefense;
    }

    public void ReceiveDefense(string defenseText)
    {
        DefenseReceived = true;
        DefenseDate = DateTime.UtcNow;
        DefenseText = defenseText;
        Status = DisciplinaryStatus.PendingDecision;
    }

    public void MakeDecision(int decisionMakerId, string decision, string rationale, AppliedSanction sanction)
    {
        DecisionMakerId = decisionMakerId;
        DecisionDate = DateTime.UtcNow;
        Decision = decision;
        DecisionRationale = rationale;
        AppliedSanction = sanction;
        Status = DisciplinaryStatus.Decided;
    }

    public void ApplySanction(DateTime startDate, DateTime? endDate, int? durationDays, string? details)
    {
        SanctionStartDate = startDate;
        SanctionEndDate = endDate;
        SanctionDurationDays = durationDays;
        SanctionDetails = details;
        Status = DisciplinaryStatus.SanctionApplied;
    }

    public void FileAppeal(string appealNotes)
    {
        WasAppealed = true;
        AppealDate = DateTime.UtcNow;
        AppealNotes = appealNotes;
        Status = DisciplinaryStatus.UnderAppeal;
    }

    public void ResolveAppeal(AppealOutcome outcome, string? notes = null)
    {
        AppealOutcome = outcome;
        if (!string.IsNullOrEmpty(notes))
            AppealNotes = $"{AppealNotes}\n[Sonuç]: {notes}".Trim();

        Status = outcome switch
        {
            Entities.AppealOutcome.Upheld => DisciplinaryStatus.AppealUpheld,
            Entities.AppealOutcome.Overturned => DisciplinaryStatus.AppealOverturned,
            Entities.AppealOutcome.Modified => DisciplinaryStatus.SanctionApplied,
            _ => Status
        };
    }

    public void Close()
    {
        Status = DisciplinaryStatus.Closed;
    }

    public void SetIncidentLocation(string? location) => IncidentLocation = location;
    public void SetViolatedPolicy(string? policy) => ViolatedPolicy = policy;
    public void SetWitnesses(string? witnesses) => Witnesses = witnesses;
    public void SetEvidence(string? evidence) => Evidence = evidence;
    public void SetInvestigationNotes(string? notes) => InvestigationNotes = notes;
    public void SetSalaryDeduction(decimal amount) => SalaryDeductionAmount = amount;
    public void SetFollowUp(DateTime date, string? notes) { FollowUpRequired = true; FollowUpDate = date; FollowUpNotes = notes; }
    public void SetPIP(int pipId) { HasPerformanceImprovementPlan = true; PerformanceImprovementPlanId = pipId; }
    public void SetReportedBy(int? userId) => ReportedById = userId;
    public void SetHrRepresentative(int? userId) => HrRepresentativeId = userId;
    public void SetConfidential(bool isConfidential) => IsConfidential = isConfidential;
    public void SetPreviousWarningsCount(int count) => PreviousWarningsCount = count;
    public void SetInternalNotes(string? notes) => InternalNotes = notes;
}

#region Enums

public enum DisciplinaryActionType
{
    /// <summary>Sözlü uyarı / Verbal warning</summary>
    VerbalWarning = 1,

    /// <summary>Yazılı uyarı / Written warning</summary>
    WrittenWarning = 2,

    /// <summary>Son uyarı / Final warning</summary>
    FinalWarning = 3,

    /// <summary>Uzaklaştırma / Suspension</summary>
    Suspension = 4,

    /// <summary>Rütbe indirimi / Demotion</summary>
    Demotion = 5,

    /// <summary>İş akdi feshi / Termination</summary>
    Termination = 6,

    /// <summary>Performans iyileştirme planı / PIP</summary>
    PerformanceImprovementPlan = 7
}

public enum DisciplinaryStatus
{
    /// <summary>Raporlandı / Reported</summary>
    Reported = 1,

    /// <summary>Soruşturmada / Under investigation</summary>
    UnderInvestigation = 2,

    /// <summary>Savunma bekleniyor / Pending defense</summary>
    PendingDefense = 3,

    /// <summary>Karar bekleniyor / Pending decision</summary>
    PendingDecision = 4,

    /// <summary>Karara bağlandı / Decided</summary>
    Decided = 5,

    /// <summary>Yaptırım uygulandı / Sanction applied</summary>
    SanctionApplied = 6,

    /// <summary>İtirazda / Under appeal</summary>
    UnderAppeal = 7,

    /// <summary>İtiraz kabul edildi / Appeal upheld</summary>
    AppealUpheld = 8,

    /// <summary>İtiraz reddedildi / Appeal overturned</summary>
    AppealOverturned = 9,

    /// <summary>Kapatıldı / Closed</summary>
    Closed = 10
}

public enum SeverityLevel
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

public enum AppliedSanction
{
    /// <summary>İşlem yok / No action</summary>
    NoAction = 1,

    /// <summary>Sözlü uyarı / Verbal warning</summary>
    VerbalWarning = 2,

    /// <summary>Yazılı uyarı / Written warning</summary>
    WrittenWarning = 3,

    /// <summary>Maaş kesintisi / Salary deduction</summary>
    SalaryDeduction = 4,

    /// <summary>Ücretli uzaklaştırma / Paid suspension</summary>
    PaidSuspension = 5,

    /// <summary>Ücretsiz uzaklaştırma / Unpaid suspension</summary>
    UnpaidSuspension = 6,

    /// <summary>Rütbe indirimi / Demotion</summary>
    Demotion = 7,

    /// <summary>Transfer / Transfer</summary>
    Transfer = 8,

    /// <summary>Tazminatsız fesih / Termination with cause</summary>
    TerminationWithCause = 9,

    /// <summary>Tazminatlı fesih / Termination without cause</summary>
    TerminationWithoutCause = 10
}

public enum AppealOutcome
{
    /// <summary>Onaylandı / Upheld</summary>
    Upheld = 1,

    /// <summary>İptal edildi / Overturned</summary>
    Overturned = 2,

    /// <summary>Değiştirildi / Modified</summary>
    Modified = 3
}

#endregion
