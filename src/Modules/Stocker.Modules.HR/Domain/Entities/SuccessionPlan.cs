using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Yedekleme planı entity'si - Kritik pozisyon yedekleme takibi
/// Succession Plan entity - Critical position succession tracking
/// </summary>
public class SuccessionPlan : BaseEntity
{
    private readonly List<SuccessionCandidate> _candidates = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Plan adı / Plan name
    /// </summary>
    public string PlanName { get; private set; } = string.Empty;

    /// <summary>
    /// Durum / Status
    /// </summary>
    public SuccessionPlanStatus Status { get; private set; }

    /// <summary>
    /// Öncelik / Priority
    /// </summary>
    public SuccessionPriority Priority { get; private set; }

    #endregion

    #region Pozisyon Bilgileri (Position Information)

    /// <summary>
    /// Pozisyon ID / Position ID
    /// </summary>
    public int PositionId { get; private set; }

    /// <summary>
    /// Departman ID / Department ID
    /// </summary>
    public int DepartmentId { get; private set; }

    /// <summary>
    /// Mevcut sahip ID / Current incumbent ID
    /// </summary>
    public int? CurrentIncumbentId { get; private set; }

    /// <summary>
    /// Pozisyon kritik mi? / Is position critical?
    /// </summary>
    public bool IsCriticalPosition { get; private set; }

    /// <summary>
    /// Risk seviyesi / Risk level
    /// </summary>
    public RiskLevel RiskLevel { get; private set; }

    #endregion

    #region Zaman Çizelgesi (Timeline)

    /// <summary>
    /// Plan başlangıç tarihi / Plan start date
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Hedef tarih / Target date
    /// </summary>
    public DateTime? TargetDate { get; private set; }

    /// <summary>
    /// Son gözden geçirme tarihi / Last review date
    /// </summary>
    public DateTime? LastReviewDate { get; private set; }

    /// <summary>
    /// Sonraki gözden geçirme tarihi / Next review date
    /// </summary>
    public DateTime? NextReviewDate { get; private set; }

    /// <summary>
    /// Tahmini boşalma tarihi / Expected vacancy date
    /// </summary>
    public DateTime? ExpectedVacancyDate { get; private set; }

    /// <summary>
    /// Boşalma nedeni / Vacancy reason
    /// </summary>
    public VacancyReason? VacancyReason { get; private set; }

    #endregion

    #region İlerleme (Progress)

    /// <summary>
    /// Tamamlanma yüzdesi / Completion percentage
    /// </summary>
    public decimal CompletionPercentage { get; private set; }

    /// <summary>
    /// Hazır aday var mı? / Has ready candidate?
    /// </summary>
    public bool HasReadyCandidate { get; private set; }

    /// <summary>
    /// Acil yedek var mı? / Has emergency backup?
    /// </summary>
    public bool HasEmergencyBackup { get; private set; }

    #endregion

    #region Pozisyon Gereksinimleri (Position Requirements)

    /// <summary>
    /// Gerekli yetkinlikler / Required competencies
    /// </summary>
    public string? RequiredCompetencies { get; private set; }

    /// <summary>
    /// Gerekli deneyim (yıl) / Required experience (years)
    /// </summary>
    public int? RequiredExperienceYears { get; private set; }

    /// <summary>
    /// Gerekli sertifikalar / Required certifications
    /// </summary>
    public string? RequiredCertifications { get; private set; }

    /// <summary>
    /// Gerekli eğitim seviyesi / Required education level
    /// </summary>
    public string? RequiredEducation { get; private set; }

    /// <summary>
    /// Kritik başarı faktörleri / Critical success factors
    /// </summary>
    public string? CriticalSuccessFactors { get; private set; }

    #endregion

    #region Sahiplik (Ownership)

    /// <summary>
    /// Plan sahibi ID / Plan owner ID
    /// </summary>
    public int? PlanOwnerId { get; private set; }

    /// <summary>
    /// HR sorumlusu ID / HR responsible ID
    /// </summary>
    public int? HrResponsibleId { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Dış işe alım gerekli mi? / External hiring needed?
    /// </summary>
    public bool ExternalHiringNeeded { get; private set; }

    /// <summary>
    /// Bütçe / Budget
    /// </summary>
    public decimal? Budget { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    #endregion

    // Navigation Properties
    public virtual Position Position { get; private set; } = null!;
    public virtual Department Department { get; private set; } = null!;
    public virtual Employee? CurrentIncumbent { get; private set; }
    public virtual Employee? PlanOwner { get; private set; }
    public virtual Employee? HrResponsible { get; private set; }
    public IReadOnlyList<SuccessionCandidate> Candidates => _candidates.AsReadOnly();

    protected SuccessionPlan() { }

    public SuccessionPlan(
        string planName,
        int positionId,
        int departmentId,
        bool isCriticalPosition = false,
        SuccessionPriority priority = SuccessionPriority.Medium)
    {
        PlanName = planName;
        PositionId = positionId;
        DepartmentId = departmentId;
        IsCriticalPosition = isCriticalPosition;
        Priority = priority;
        Status = SuccessionPlanStatus.Draft;
        RiskLevel = RiskLevel.Medium;
        StartDate = DateTime.UtcNow;
        Currency = "TRY";
    }

    public SuccessionCandidate AddCandidate(int employeeId, ReadinessLevel readinessLevel, int sortOrder = 0)
    {
        var candidate = new SuccessionCandidate(Id, employeeId, readinessLevel, sortOrder);
        _candidates.Add(candidate);
        UpdateCandidateStatus();
        return candidate;
    }

    public void RemoveCandidate(int candidateId)
    {
        var candidate = _candidates.FirstOrDefault(c => c.Id == candidateId);
        if (candidate != null)
        {
            _candidates.Remove(candidate);
            UpdateCandidateStatus();
        }
    }

    private void UpdateCandidateStatus()
    {
        HasReadyCandidate = _candidates.Any(c => c.ReadinessLevel == ReadinessLevel.ReadyNow);
        HasEmergencyBackup = _candidates.Any(c => c.IsEmergencyBackup);

        // Update completion based on candidates
        if (_candidates.Count == 0)
            CompletionPercentage = 0;
        else if (HasReadyCandidate && HasEmergencyBackup)
            CompletionPercentage = 100;
        else if (HasReadyCandidate || HasEmergencyBackup)
            CompletionPercentage = 75;
        else if (_candidates.Any(c => c.ReadinessLevel == ReadinessLevel.ReadyIn1Year))
            CompletionPercentage = 50;
        else
            CompletionPercentage = 25;
    }

    public void Activate()
    {
        Status = SuccessionPlanStatus.Active;
    }

    public void PutOnHold()
    {
        Status = SuccessionPlanStatus.OnHold;
    }

    public void Complete()
    {
        Status = SuccessionPlanStatus.Completed;
    }

    public void Cancel()
    {
        Status = SuccessionPlanStatus.Cancelled;
    }

    public void Review()
    {
        LastReviewDate = DateTime.UtcNow;
        NextReviewDate = DateTime.UtcNow.AddMonths(6); // Default 6 months review cycle
    }

    public void SetExpectedVacancy(DateTime? date, VacancyReason? reason)
    {
        ExpectedVacancyDate = date;
        VacancyReason = reason;

        // Update priority based on timeline
        if (date.HasValue)
        {
            var monthsUntilVacancy = (date.Value - DateTime.UtcNow).TotalDays / 30;
            Priority = monthsUntilVacancy switch
            {
                <= 6 => SuccessionPriority.Critical,
                <= 12 => SuccessionPriority.High,
                <= 24 => SuccessionPriority.Medium,
                _ => SuccessionPriority.Low
            };
        }
    }

    public void AssessRisk()
    {
        // Risk assessment based on multiple factors
        var riskScore = 0;

        if (IsCriticalPosition) riskScore += 2;
        if (!HasReadyCandidate) riskScore += 2;
        if (!HasEmergencyBackup) riskScore += 1;
        if (_candidates.Count < 2) riskScore += 1;
        if (ExpectedVacancyDate.HasValue && ExpectedVacancyDate.Value < DateTime.UtcNow.AddMonths(12)) riskScore += 2;

        RiskLevel = riskScore switch
        {
            >= 6 => RiskLevel.Critical,
            >= 4 => RiskLevel.High,
            >= 2 => RiskLevel.Medium,
            _ => RiskLevel.Low
        };
    }

    public void SetCurrentIncumbent(int? incumbentId) => CurrentIncumbentId = incumbentId;
    public void SetPlanOwner(int? ownerId) => PlanOwnerId = ownerId;
    public void SetHrResponsible(int? hrId) => HrResponsibleId = hrId;
    public void SetTargetDate(DateTime? date) => TargetDate = date;
    public void SetNextReviewDate(DateTime? date) => NextReviewDate = date;
    public void SetRequiredCompetencies(string? competencies) => RequiredCompetencies = competencies;
    public void SetRequiredExperience(int? years) => RequiredExperienceYears = years;
    public void SetRequiredCertifications(string? certifications) => RequiredCertifications = certifications;
    public void SetRequiredEducation(string? education) => RequiredEducation = education;
    public void SetCriticalSuccessFactors(string? factors) => CriticalSuccessFactors = factors;
    public void SetDescription(string? description) => Description = description;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetExternalHiringNeeded(bool needed) => ExternalHiringNeeded = needed;
    public void SetBudget(decimal? budget) => Budget = budget;
    public void SetPriority(SuccessionPriority priority) => Priority = priority;
    public void SetCriticalPosition(bool isCritical) => IsCriticalPosition = isCritical;
}

/// <summary>
/// Yedek aday / Succession candidate
/// </summary>
public class SuccessionCandidate : BaseEntity
{
    public int SuccessionPlanId { get; private set; }
    public int EmployeeId { get; private set; }
    public ReadinessLevel ReadinessLevel { get; private set; }
    public int SortOrder { get; private set; }

    public int? ReadinessScore { get; private set; }
    public int? PerformanceRating { get; private set; }
    public int? PotentialRating { get; private set; }

    public bool IsEmergencyBackup { get; private set; }
    public bool IsPreferred { get; private set; }

    public string? DevelopmentNeeds { get; private set; }
    public string? DevelopmentPlan { get; private set; }
    public string? Strengths { get; private set; }
    public string? Gaps { get; private set; }
    public string? Notes { get; private set; }

    public DateTime? LastAssessmentDate { get; private set; }
    public DateTime? ExpectedReadyDate { get; private set; }

    public virtual SuccessionPlan SuccessionPlan { get; private set; } = null!;
    public virtual Employee Employee { get; private set; } = null!;

    protected SuccessionCandidate() { }

    public SuccessionCandidate(
        int successionPlanId,
        int employeeId,
        ReadinessLevel readinessLevel,
        int sortOrder = 0)
    {
        SuccessionPlanId = successionPlanId;
        EmployeeId = employeeId;
        ReadinessLevel = readinessLevel;
        SortOrder = sortOrder;
    }

    public void UpdateReadiness(ReadinessLevel level, int? score = null)
    {
        ReadinessLevel = level;
        ReadinessScore = score;
        LastAssessmentDate = DateTime.UtcNow;
    }

    public void SetRatings(int? performance, int? potential)
    {
        PerformanceRating = performance;
        PotentialRating = potential;
    }

    public void SetAsEmergencyBackup(bool isBackup) => IsEmergencyBackup = isBackup;
    public void SetAsPreferred(bool isPreferred) => IsPreferred = isPreferred;
    public void SetDevelopmentNeeds(string? needs) => DevelopmentNeeds = needs;
    public void SetDevelopmentPlan(string? plan) => DevelopmentPlan = plan;
    public void SetStrengths(string? strengths) => Strengths = strengths;
    public void SetGaps(string? gaps) => Gaps = gaps;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetExpectedReadyDate(DateTime? date) => ExpectedReadyDate = date;
}

#region Enums

public enum SuccessionPlanStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>Aktif / Active</summary>
    Active = 2,

    /// <summary>Beklemede / On hold</summary>
    OnHold = 3,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 4,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 5
}

public enum SuccessionPriority
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

public enum RiskLevel
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

public enum ReadinessLevel
{
    /// <summary>Şimdi hazır / Ready now</summary>
    ReadyNow = 1,

    /// <summary>1 yıl içinde hazır / Ready in 1 year</summary>
    ReadyIn1Year = 2,

    /// <summary>2 yıl içinde hazır / Ready in 2 years</summary>
    ReadyIn2Years = 3,

    /// <summary>3+ yıl içinde hazır / Ready in 3+ years</summary>
    ReadyIn3PlusYears = 4,

    /// <summary>Geliştirilmeli / Needs development</summary>
    NeedsDevelopment = 5
}

public enum VacancyReason
{
    /// <summary>Emeklilik / Retirement</summary>
    Retirement = 1,

    /// <summary>Terfi / Promotion</summary>
    Promotion = 2,

    /// <summary>Transfer / Transfer</summary>
    Transfer = 3,

    /// <summary>İstifa / Resignation</summary>
    Resignation = 4,

    /// <summary>Yeni pozisyon / New position</summary>
    NewPosition = 5,

    /// <summary>Planlı ayrılık / Planned departure</summary>
    PlannedDeparture = 6,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
