using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Kariyer yolu entity'si - Çalışan kariyer planlama ve terfi takibi
/// Career Path entity - Employee career planning and promotion tracking
/// </summary>
public class CareerPath : BaseEntity
{
    private readonly List<CareerMilestone> _milestones = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// Kariyer yolu adı / Career path name
    /// </summary>
    public string PathName { get; private set; } = string.Empty;

    /// <summary>
    /// Durum / Status
    /// </summary>
    public CareerPathStatus Status { get; private set; }

    /// <summary>
    /// Kariyer türü / Career track
    /// </summary>
    public CareerTrack CareerTrack { get; private set; }

    #endregion

    #region Mevcut Durum (Current State)

    /// <summary>
    /// Mevcut pozisyon ID / Current position ID
    /// </summary>
    public int CurrentPositionId { get; private set; }

    /// <summary>
    /// Mevcut seviye / Current level
    /// </summary>
    public int CurrentLevel { get; private set; }

    /// <summary>
    /// Mevcut pozisyon başlangıç tarihi / Current position start date
    /// </summary>
    public DateTime CurrentPositionStartDate { get; private set; }

    #endregion

    #region Hedef Bilgileri (Target Information)

    /// <summary>
    /// Hedef pozisyon ID / Target position ID
    /// </summary>
    public int? TargetPositionId { get; private set; }

    /// <summary>
    /// Hedef pozisyon adı / Target position name
    /// </summary>
    public string? TargetPositionName { get; private set; }

    /// <summary>
    /// Hedef seviye / Target level
    /// </summary>
    public int? TargetLevel { get; private set; }

    /// <summary>
    /// Tahmini hedef tarihi / Expected target date
    /// </summary>
    public DateTime? ExpectedTargetDate { get; private set; }

    /// <summary>
    /// Hedef zaman çizelgesi (ay) / Target timeline (months)
    /// </summary>
    public int? TargetTimelineMonths { get; private set; }

    #endregion

    #region İlerleme (Progress)

    /// <summary>
    /// İlerleme yüzdesi / Progress percentage
    /// </summary>
    public decimal ProgressPercentage { get; private set; }

    /// <summary>
    /// Hazırlık puanı (0-100) / Readiness score
    /// </summary>
    public int? ReadinessScore { get; private set; }

    /// <summary>
    /// Terfi için hazır mı? / Ready for promotion?
    /// </summary>
    public bool ReadyForPromotion { get; private set; }

    /// <summary>
    /// Son değerlendirme tarihi / Last assessment date
    /// </summary>
    public DateTime? LastAssessmentDate { get; private set; }

    #endregion

    #region Geliştirme Planı (Development Plan)

    /// <summary>
    /// Geliştirme alanları / Development areas
    /// </summary>
    public string? DevelopmentAreas { get; private set; }

    /// <summary>
    /// Gerekli yetkinlikler / Required competencies
    /// </summary>
    public string? RequiredCompetencies { get; private set; }

    /// <summary>
    /// Gerekli sertifikalar / Required certifications
    /// </summary>
    public string? RequiredCertifications { get; private set; }

    /// <summary>
    /// Gerekli eğitimler / Required training
    /// </summary>
    public string? RequiredTraining { get; private set; }

    /// <summary>
    /// Gerekli deneyim (yıl) / Required experience (years)
    /// </summary>
    public int? RequiredExperienceYears { get; private set; }

    #endregion

    #region Mentor Bilgileri (Mentorship)

    /// <summary>
    /// Mentor ID / Mentor ID
    /// </summary>
    public int? MentorId { get; private set; }

    /// <summary>
    /// Mentor atama tarihi / Mentor assignment date
    /// </summary>
    public DateTime? MentorAssignmentDate { get; private set; }

    /// <summary>
    /// Mentorluk notları / Mentorship notes
    /// </summary>
    public string? MentorshipNotes { get; private set; }

    #endregion

    #region Yönetici Değerlendirmesi (Manager Assessment)

    /// <summary>
    /// Yönetici değerlendirmesi / Manager assessment
    /// </summary>
    public string? ManagerAssessment { get; private set; }

    /// <summary>
    /// Yönetici önerisi / Manager recommendation
    /// </summary>
    public ManagerRecommendation? ManagerRecommendation { get; private set; }

    /// <summary>
    /// Son yönetici görüşme tarihi / Last manager meeting date
    /// </summary>
    public DateTime? LastManagerMeetingDate { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Başlangıç tarihi / Start date
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Bitiş tarihi / End date
    /// </summary>
    public DateTime? EndDate { get; private set; }

    /// <summary>
    /// Sonraki gözden geçirme tarihi / Next review date
    /// </summary>
    public DateTime? NextReviewDate { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Position CurrentPosition { get; private set; } = null!;
    public virtual Position? TargetPosition { get; private set; }
    public virtual Employee? Mentor { get; private set; }
    public IReadOnlyList<CareerMilestone> Milestones => _milestones.AsReadOnly();

    protected CareerPath() { }

    public CareerPath(
        int employeeId,
        string pathName,
        int currentPositionId,
        int currentLevel,
        CareerTrack careerTrack = CareerTrack.Individual)
    {
        EmployeeId = employeeId;
        PathName = pathName;
        CurrentPositionId = currentPositionId;
        CurrentLevel = currentLevel;
        CareerTrack = careerTrack;
        Status = CareerPathStatus.Active;
        StartDate = DateTime.UtcNow;
        CurrentPositionStartDate = DateTime.UtcNow;
    }

    public CareerMilestone AddMilestone(string title, string? description, DateTime targetDate, int sortOrder = 0)
    {
        var milestone = new CareerMilestone(Id, title, description, targetDate, sortOrder);
        _milestones.Add(milestone);
        UpdateProgress();
        return milestone;
    }

    public void CompleteMilestone(int milestoneId, string? notes = null)
    {
        var milestone = _milestones.FirstOrDefault(m => m.Id == milestoneId);
        if (milestone != null)
        {
            milestone.Complete(notes);
            UpdateProgress();
        }
    }

    private void UpdateProgress()
    {
        if (_milestones.Count == 0)
        {
            ProgressPercentage = 0;
            return;
        }

        var completedCount = _milestones.Count(m => m.Status == MilestoneStatus.Completed);
        ProgressPercentage = Math.Round((decimal)completedCount / _milestones.Count * 100, 2);
    }

    public void SetTarget(int positionId, string positionName, int level, DateTime? expectedDate, int? timelineMonths)
    {
        TargetPositionId = positionId;
        TargetPositionName = positionName;
        TargetLevel = level;
        ExpectedTargetDate = expectedDate;
        TargetTimelineMonths = timelineMonths;
    }

    public void UpdateReadiness(int score, bool readyForPromotion)
    {
        ReadinessScore = Math.Clamp(score, 0, 100);
        ReadyForPromotion = readyForPromotion;
        LastAssessmentDate = DateTime.UtcNow;
    }

    public void AssignMentor(int mentorId)
    {
        MentorId = mentorId;
        MentorAssignmentDate = DateTime.UtcNow;
    }

    public void RemoveMentor()
    {
        MentorId = null;
        MentorAssignmentDate = null;
    }

    public void RecordManagerMeeting(string assessment, ManagerRecommendation recommendation)
    {
        ManagerAssessment = assessment;
        ManagerRecommendation = recommendation;
        LastManagerMeetingDate = DateTime.UtcNow;
    }

    public void Promote(int newPositionId, int newLevel)
    {
        CurrentPositionId = newPositionId;
        CurrentLevel = newLevel;
        CurrentPositionStartDate = DateTime.UtcNow;

        // Check if target reached
        if (TargetPositionId == newPositionId && TargetLevel == newLevel)
        {
            Status = CareerPathStatus.Completed;
            EndDate = DateTime.UtcNow;
        }
    }

    public void PutOnHold()
    {
        Status = CareerPathStatus.OnHold;
    }

    public void Resume()
    {
        Status = CareerPathStatus.Active;
    }

    public void Cancel()
    {
        Status = CareerPathStatus.Cancelled;
        EndDate = DateTime.UtcNow;
    }

    public void Complete()
    {
        Status = CareerPathStatus.Completed;
        EndDate = DateTime.UtcNow;
        ProgressPercentage = 100;
    }

    public void SetDevelopmentAreas(string? areas) => DevelopmentAreas = areas;
    public void SetRequiredCompetencies(string? competencies) => RequiredCompetencies = competencies;
    public void SetRequiredCertifications(string? certifications) => RequiredCertifications = certifications;
    public void SetRequiredTraining(string? training) => RequiredTraining = training;
    public void SetRequiredExperience(int? years) => RequiredExperienceYears = years;
    public void SetMentorshipNotes(string? notes) => MentorshipNotes = notes;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetNextReviewDate(DateTime? date) => NextReviewDate = date;
}

/// <summary>
/// Kariyer dönüm noktası / Career milestone
/// </summary>
public class CareerMilestone : BaseEntity
{
    public int CareerPathId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DateTime TargetDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public MilestoneStatus Status { get; private set; }
    public int SortOrder { get; private set; }
    public string? Notes { get; private set; }
    public string? Evidence { get; private set; }

    public virtual CareerPath CareerPath { get; private set; } = null!;

    protected CareerMilestone() { }

    public CareerMilestone(
        int careerPathId,
        string title,
        string? description,
        DateTime targetDate,
        int sortOrder = 0)
    {
        CareerPathId = careerPathId;
        Title = title;
        Description = description;
        TargetDate = targetDate;
        SortOrder = sortOrder;
        Status = MilestoneStatus.NotStarted;
    }

    public void Start() => Status = MilestoneStatus.InProgress;

    public void Complete(string? notes = null)
    {
        Status = MilestoneStatus.Completed;
        CompletedDate = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(notes))
            Notes = notes;
    }

    public void Skip() => Status = MilestoneStatus.Skipped;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetEvidence(string? evidence) => Evidence = evidence;
}

#region Enums

public enum CareerPathStatus
{
    /// <summary>Aktif / Active</summary>
    Active = 1,

    /// <summary>Beklemede / On hold</summary>
    OnHold = 2,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 3,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 4
}

public enum CareerTrack
{
    /// <summary>Bireysel katkı / Individual contributor</summary>
    Individual = 1,

    /// <summary>Yönetim / Management</summary>
    Management = 2,

    /// <summary>Teknik liderlik / Technical leadership</summary>
    TechnicalLeadership = 3,

    /// <summary>Uzman / Specialist</summary>
    Specialist = 4,

    /// <summary>Girişimci / Entrepreneurial</summary>
    Entrepreneurial = 5
}

public enum MilestoneStatus
{
    /// <summary>Başlamadı / Not started</summary>
    NotStarted = 1,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 2,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 3,

    /// <summary>Atlandı / Skipped</summary>
    Skipped = 4
}

public enum ManagerRecommendation
{
    /// <summary>Kesinlikle terfi / Strongly promote</summary>
    StronglyPromote = 1,

    /// <summary>Terfi / Promote</summary>
    Promote = 2,

    /// <summary>Geliştirmeye devam / Continue development</summary>
    ContinueDevelopment = 3,

    /// <summary>Henüz hazır değil / Not ready yet</summary>
    NotReadyYet = 4,

    /// <summary>Farklı yol düşün / Consider different path</summary>
    ConsiderDifferentPath = 5
}

#endregion
