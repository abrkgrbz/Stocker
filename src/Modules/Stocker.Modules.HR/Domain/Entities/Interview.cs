using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Mülakat entity'si - Mülakat planlama ve değerlendirme
/// Interview entity - Interview scheduling and evaluation
/// </summary>
public class Interview : BaseEntity
{
    private readonly List<InterviewFeedback> _feedbacks = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Mülakat türü / Interview type
    /// </summary>
    public InterviewType InterviewType { get; private set; }

    /// <summary>
    /// Mülakat turu / Interview round
    /// </summary>
    public int Round { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public InterviewStatus Status { get; private set; }

    #endregion

    #region İlişkiler (Relationships)

    /// <summary>
    /// İş başvurusu ID / Job application ID
    /// </summary>
    public int JobApplicationId { get; private set; }

    /// <summary>
    /// Mülakat yapan ID / Interviewer ID
    /// </summary>
    public int InterviewerId { get; private set; }

    #endregion

    #region Zamanlama (Scheduling)

    /// <summary>
    /// Planlanan tarih ve saat / Scheduled date time
    /// </summary>
    public DateTime ScheduledDateTime { get; private set; }

    /// <summary>
    /// Süre (dakika) / Duration (minutes)
    /// </summary>
    public int DurationMinutes { get; private set; }

    /// <summary>
    /// Saat dilimi / Timezone
    /// </summary>
    public string? Timezone { get; private set; }

    /// <summary>
    /// Gerçekleşen tarih ve saat / Actual date time
    /// </summary>
    public DateTime? ActualDateTime { get; private set; }

    /// <summary>
    /// Gerçekleşen süre (dakika) / Actual duration (minutes)
    /// </summary>
    public int? ActualDurationMinutes { get; private set; }

    #endregion

    #region Lokasyon Bilgileri (Location Information)

    /// <summary>
    /// Mülakat formatı / Interview format
    /// </summary>
    public InterviewFormat Format { get; private set; }

    /// <summary>
    /// Lokasyon / Location
    /// </summary>
    public string? Location { get; private set; }

    /// <summary>
    /// Toplantı odası / Meeting room
    /// </summary>
    public string? MeetingRoom { get; private set; }

    /// <summary>
    /// Video konferans linki / Video conference link
    /// </summary>
    public string? VideoConferenceLink { get; private set; }

    /// <summary>
    /// Video konferans platformu / Video conference platform
    /// </summary>
    public string? VideoConferencePlatform { get; private set; }

    /// <summary>
    /// Telefon numarası / Phone number
    /// </summary>
    public string? PhoneNumber { get; private set; }

    #endregion

    #region Hazırlık (Preparation)

    /// <summary>
    /// Mülakat konuları / Interview topics
    /// </summary>
    public string? Topics { get; private set; }

    /// <summary>
    /// Sorulacak sorular / Questions to ask
    /// </summary>
    public string? QuestionsToAsk { get; private set; }

    /// <summary>
    /// Mülakat yapan için notlar / Notes for interviewer
    /// </summary>
    public string? InterviewerNotes { get; private set; }

    /// <summary>
    /// Aday için talimatlar / Instructions for candidate
    /// </summary>
    public string? CandidateInstructions { get; private set; }

    #endregion

    #region Değerlendirme (Evaluation)

    /// <summary>
    /// Genel puan (1-10) / Overall rating
    /// </summary>
    public int? OverallRating { get; private set; }

    /// <summary>
    /// Teknik yeterlilik (1-10) / Technical competency
    /// </summary>
    public int? TechnicalCompetency { get; private set; }

    /// <summary>
    /// İletişim becerileri (1-10) / Communication skills
    /// </summary>
    public int? CommunicationSkills { get; private set; }

    /// <summary>
    /// Problem çözme (1-10) / Problem solving
    /// </summary>
    public int? ProblemSolving { get; private set; }

    /// <summary>
    /// Kültürel uyum (1-10) / Cultural fit
    /// </summary>
    public int? CulturalFit { get; private set; }

    /// <summary>
    /// Liderlik potansiyeli (1-10) / Leadership potential
    /// </summary>
    public int? LeadershipPotential { get; private set; }

    /// <summary>
    /// Tavsiye / Recommendation
    /// </summary>
    public InterviewRecommendation? Recommendation { get; private set; }

    /// <summary>
    /// Değerlendirme özeti / Evaluation summary
    /// </summary>
    public string? EvaluationSummary { get; private set; }

    /// <summary>
    /// Güçlü yönler / Strengths
    /// </summary>
    public string? Strengths { get; private set; }

    /// <summary>
    /// Gelişim alanları / Areas of improvement
    /// </summary>
    public string? AreasOfImprovement { get; private set; }

    #endregion

    #region Bildirim Bilgileri (Notification Information)

    /// <summary>
    /// Adaya davet gönderildi mi? / Invitation sent to candidate?
    /// </summary>
    public bool InvitationSentToCandidate { get; private set; }

    /// <summary>
    /// Davet gönderim tarihi / Invitation sent date
    /// </summary>
    public DateTime? InvitationSentDate { get; private set; }

    /// <summary>
    /// Aday onayladı mı? / Candidate confirmed?
    /// </summary>
    public bool CandidateConfirmed { get; private set; }

    /// <summary>
    /// Hatırlatıcı gönderildi mi? / Reminder sent?
    /// </summary>
    public bool ReminderSent { get; private set; }

    #endregion

    #region İptal/Erteleme (Cancellation/Reschedule)

    /// <summary>
    /// İptal nedeni / Cancellation reason
    /// </summary>
    public string? CancellationReason { get; private set; }

    /// <summary>
    /// İptal eden / Cancelled by
    /// </summary>
    public string? CancelledBy { get; private set; }

    /// <summary>
    /// Yeniden planlandı mı? / Was rescheduled?
    /// </summary>
    public bool WasRescheduled { get; private set; }

    /// <summary>
    /// Önceki tarih / Previous date
    /// </summary>
    public DateTime? PreviousDateTime { get; private set; }

    #endregion

    // Navigation Properties
    public virtual JobApplication JobApplication { get; private set; } = null!;
    public virtual Employee Interviewer { get; private set; } = null!;
    public IReadOnlyList<InterviewFeedback> Feedbacks => _feedbacks.AsReadOnly();

    protected Interview() { }

    public Interview(
        int jobApplicationId,
        int interviewerId,
        InterviewType interviewType,
        DateTime scheduledDateTime,
        int durationMinutes = 60,
        int round = 1)
    {
        JobApplicationId = jobApplicationId;
        InterviewerId = interviewerId;
        InterviewType = interviewType;
        ScheduledDateTime = scheduledDateTime;
        DurationMinutes = durationMinutes;
        Round = round;
        Status = InterviewStatus.Scheduled;
        Format = InterviewFormat.InPerson;
    }

    public InterviewFeedback AddFeedback(int reviewerId, string comments, int rating, InterviewRecommendation recommendation)
    {
        var feedback = new InterviewFeedback(Id, reviewerId, comments, rating, recommendation);
        _feedbacks.Add(feedback);
        return feedback;
    }

    public void Schedule(DateTime dateTime, int durationMinutes)
    {
        ScheduledDateTime = dateTime;
        DurationMinutes = durationMinutes;
        Status = InterviewStatus.Scheduled;
    }

    public void Reschedule(DateTime newDateTime, string? reason = null)
    {
        PreviousDateTime = ScheduledDateTime;
        ScheduledDateTime = newDateTime;
        WasRescheduled = true;
        Status = InterviewStatus.Rescheduled;
    }

    public void Confirm()
    {
        Status = InterviewStatus.Confirmed;
        CandidateConfirmed = true;
    }

    public void Start()
    {
        Status = InterviewStatus.InProgress;
        ActualDateTime = DateTime.UtcNow;
    }

    public void Complete(int? actualDurationMinutes = null)
    {
        Status = InterviewStatus.Completed;
        ActualDurationMinutes = actualDurationMinutes;
    }

    public void Cancel(string reason, string cancelledBy)
    {
        Status = InterviewStatus.Cancelled;
        CancellationReason = reason;
        CancelledBy = cancelledBy;
    }

    public void MarkNoShow()
    {
        Status = InterviewStatus.NoShow;
    }

    public void SubmitEvaluation(
        int overallRating,
        int? technicalCompetency,
        int? communicationSkills,
        int? problemSolving,
        int? culturalFit,
        InterviewRecommendation recommendation,
        string? summary = null)
    {
        OverallRating = overallRating;
        TechnicalCompetency = technicalCompetency;
        CommunicationSkills = communicationSkills;
        ProblemSolving = problemSolving;
        CulturalFit = culturalFit;
        Recommendation = recommendation;
        EvaluationSummary = summary;
    }

    public void SendInvitation()
    {
        InvitationSentToCandidate = true;
        InvitationSentDate = DateTime.UtcNow;
    }

    public void SendReminder()
    {
        ReminderSent = true;
    }

    public void SetLocation(string? location, string? meetingRoom)
    {
        Location = location;
        MeetingRoom = meetingRoom;
        Format = InterviewFormat.InPerson;
    }

    public void SetVideoConference(string link, string platform)
    {
        VideoConferenceLink = link;
        VideoConferencePlatform = platform;
        Format = InterviewFormat.Video;
    }

    public void SetPhoneInterview(string phoneNumber)
    {
        PhoneNumber = phoneNumber;
        Format = InterviewFormat.Phone;
    }

    public void SetFormat(InterviewFormat format) => Format = format;
    public void SetTopics(string? topics) => Topics = topics;
    public void SetQuestionsToAsk(string? questions) => QuestionsToAsk = questions;
    public void SetInterviewerNotes(string? notes) => InterviewerNotes = notes;
    public void SetCandidateInstructions(string? instructions) => CandidateInstructions = instructions;
    public void SetStrengths(string? strengths) => Strengths = strengths;
    public void SetAreasOfImprovement(string? areas) => AreasOfImprovement = areas;
    public void SetLeadershipPotential(int? score) => LeadershipPotential = score;
    public void SetTimezone(string? timezone) => Timezone = timezone;
}

/// <summary>
/// Mülakat geri bildirimi / Interview feedback
/// </summary>
public class InterviewFeedback : BaseEntity
{
    public int InterviewId { get; private set; }
    public int ReviewerId { get; private set; }
    public string Comments { get; private set; } = string.Empty;
    public int Rating { get; private set; }
    public InterviewRecommendation Recommendation { get; private set; }
    public DateTime SubmittedDate { get; private set; }

    public virtual Interview Interview { get; private set; } = null!;
    public virtual Employee Reviewer { get; private set; } = null!;

    protected InterviewFeedback() { }

    public InterviewFeedback(
        int interviewId,
        int reviewerId,
        string comments,
        int rating,
        InterviewRecommendation recommendation)
    {
        InterviewId = interviewId;
        ReviewerId = reviewerId;
        Comments = comments;
        Rating = rating;
        Recommendation = recommendation;
        SubmittedDate = DateTime.UtcNow;
    }
}

#region Enums

public enum InterviewType
{
    /// <summary>Telefon ön eleme / Phone screening</summary>
    PhoneScreening = 1,

    /// <summary>Teknik mülakat / Technical interview</summary>
    Technical = 2,

    /// <summary>Davranışsal mülakat / Behavioral interview</summary>
    Behavioral = 3,

    /// <summary>Panel mülakatı / Panel interview</summary>
    Panel = 4,

    /// <summary>Vaka çalışması / Case study</summary>
    CaseStudy = 5,

    /// <summary>Kodlama testi / Coding test</summary>
    CodingTest = 6,

    /// <summary>Kültürel uyum / Cultural fit</summary>
    CulturalFit = 7,

    /// <summary>HR mülakatı / HR interview</summary>
    HR = 8,

    /// <summary>Final mülakatı / Final interview</summary>
    Final = 9,

    /// <summary>Yönetici mülakatı / Manager interview</summary>
    Manager = 10
}

public enum InterviewStatus
{
    /// <summary>Planlandı / Scheduled</summary>
    Scheduled = 1,

    /// <summary>Yeniden planlandı / Rescheduled</summary>
    Rescheduled = 2,

    /// <summary>Onaylandı / Confirmed</summary>
    Confirmed = 3,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 4,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 5,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 6,

    /// <summary>Gelmedi / No show</summary>
    NoShow = 7
}

public enum InterviewFormat
{
    /// <summary>Yüz yüze / In person</summary>
    InPerson = 1,

    /// <summary>Video / Video</summary>
    Video = 2,

    /// <summary>Telefon / Phone</summary>
    Phone = 3,

    /// <summary>Hibrit / Hybrid</summary>
    Hybrid = 4
}

public enum InterviewRecommendation
{
    /// <summary>Kesinlikle işe al / Strongly hire</summary>
    StronglyHire = 1,

    /// <summary>İşe al / Hire</summary>
    Hire = 2,

    /// <summary>Kararsız / Undecided</summary>
    Undecided = 3,

    /// <summary>İşe alma / No hire</summary>
    NoHire = 4,

    /// <summary>Kesinlikle işe alma / Strongly no hire</summary>
    StronglyNoHire = 5
}

#endregion
