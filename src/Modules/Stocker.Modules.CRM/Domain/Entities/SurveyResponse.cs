using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Anket yanıtı entity'si - Müşteri memnuniyeti ve NPS takibi
/// Survey Response entity - Customer satisfaction and NPS tracking
/// </summary>
public class SurveyResponse : TenantEntity
{
    private readonly List<SurveyAnswer> _answers = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Anket türü / Survey type
    /// </summary>
    public SurveyType SurveyType { get; private set; }

    /// <summary>
    /// Anket adı / Survey name
    /// </summary>
    public string SurveyName { get; private set; } = string.Empty;

    /// <summary>
    /// Durum / Status
    /// </summary>
    public SurveyResponseStatus Status { get; private set; }

    #endregion

    #region İlişkiler (Relationships)

    /// <summary>
    /// Müşteri ID / Customer ID
    /// </summary>
    public Guid? CustomerId { get; private set; }

    /// <summary>
    /// Kişi ID / Contact ID
    /// </summary>
    public Guid? ContactId { get; private set; }

    /// <summary>
    /// Lead ID
    /// </summary>
    public Guid? LeadId { get; private set; }

    /// <summary>
    /// Destek talebi ID / Ticket ID
    /// </summary>
    public Guid? TicketId { get; private set; }

    /// <summary>
    /// Sipariş ID / Order ID
    /// </summary>
    public Guid? OrderId { get; private set; }

    /// <summary>
    /// Kampanya ID / Campaign ID
    /// </summary>
    public Guid? CampaignId { get; private set; }

    #endregion

    #region Yanıtlayan Bilgileri (Respondent Information)

    /// <summary>
    /// Yanıtlayan adı / Respondent name
    /// </summary>
    public string? RespondentName { get; private set; }

    /// <summary>
    /// Yanıtlayan e-posta / Respondent email
    /// </summary>
    public string? RespondentEmail { get; private set; }

    /// <summary>
    /// Yanıtlayan telefon / Respondent phone
    /// </summary>
    public string? RespondentPhone { get; private set; }

    /// <summary>
    /// Anonim mi? / Is anonymous?
    /// </summary>
    public bool IsAnonymous { get; private set; }

    #endregion

    #region NPS Bilgileri (NPS Information)

    /// <summary>
    /// NPS puanı (0-10) / NPS score
    /// </summary>
    public int? NpsScore { get; private set; }

    /// <summary>
    /// NPS kategorisi / NPS category
    /// </summary>
    public NpsCategory? NpsCategory { get; private set; }

    #endregion

    #region CSAT Bilgileri (CSAT Information)

    /// <summary>
    /// CSAT puanı (1-5) / CSAT score
    /// </summary>
    public int? CsatScore { get; private set; }

    #endregion

    #region CES Bilgileri (CES Information)

    /// <summary>
    /// CES puanı (1-7) / CES score (Customer Effort Score)
    /// </summary>
    public int? CesScore { get; private set; }

    #endregion

    #region Genel Puanlama (Overall Scoring)

    /// <summary>
    /// Genel memnuniyet puanı (1-5) / Overall satisfaction score
    /// </summary>
    public decimal? OverallSatisfaction { get; private set; }

    /// <summary>
    /// Tavsiye eder mi? / Would recommend?
    /// </summary>
    public bool? WouldRecommend { get; private set; }

    /// <summary>
    /// Tekrar satın alır mı? / Would repurchase?
    /// </summary>
    public bool? WouldRepurchase { get; private set; }

    #endregion

    #region Zaman Bilgileri (Time Information)

    /// <summary>
    /// Gönderim tarihi / Sent date
    /// </summary>
    public DateTime? SentDate { get; private set; }

    /// <summary>
    /// Başlama tarihi / Started date
    /// </summary>
    public DateTime? StartedDate { get; private set; }

    /// <summary>
    /// Tamamlanma tarihi / Completed date
    /// </summary>
    public DateTime? CompletedDate { get; private set; }

    /// <summary>
    /// Tamamlama süresi (saniye) / Completion time (seconds)
    /// </summary>
    public int? CompletionTimeSeconds { get; private set; }

    #endregion

    #region Geri Bildirim (Feedback)

    /// <summary>
    /// Genel yorum / Overall comment
    /// </summary>
    public string? OverallComment { get; private set; }

    /// <summary>
    /// İyileştirme önerisi / Improvement suggestion
    /// </summary>
    public string? ImprovementSuggestion { get; private set; }

    /// <summary>
    /// Övgü / Praise
    /// </summary>
    public string? Praise { get; private set; }

    /// <summary>
    /// Şikayet / Complaint
    /// </summary>
    public string? Complaint { get; private set; }

    #endregion

    #region Takip Bilgileri (Follow-up Information)

    /// <summary>
    /// Takip gerekli mi? / Follow-up required?
    /// </summary>
    public bool FollowUpRequired { get; private set; }

    /// <summary>
    /// Takip yapıldı mı? / Follow-up done?
    /// </summary>
    public bool FollowUpDone { get; private set; }

    /// <summary>
    /// Takip tarihi / Follow-up date
    /// </summary>
    public DateTime? FollowUpDate { get; private set; }

    /// <summary>
    /// Takip notu / Follow-up note
    /// </summary>
    public string? FollowUpNote { get; private set; }

    /// <summary>
    /// Atanan kullanıcı ID / Assigned user ID
    /// </summary>
    public int? AssignedToUserId { get; private set; }

    #endregion

    #region Teknik Bilgiler (Technical Information)

    /// <summary>
    /// Kaynak / Source
    /// </summary>
    public SurveySource Source { get; private set; }

    /// <summary>
    /// Cihaz türü / Device type
    /// </summary>
    public string? DeviceType { get; private set; }

    /// <summary>
    /// IP adresi / IP address
    /// </summary>
    public string? IpAddress { get; private set; }

    /// <summary>
    /// Dil / Language
    /// </summary>
    public string? Language { get; private set; }

    #endregion

    // Navigation
    public virtual Customer? Customer { get; private set; }
    public virtual Contact? Contact { get; private set; }
    public virtual Lead? Lead { get; private set; }
    public virtual Ticket? Ticket { get; private set; }
    public virtual Campaign? Campaign { get; private set; }
    public IReadOnlyList<SurveyAnswer> Answers => _answers.AsReadOnly();

    protected SurveyResponse() : base() { }

    public SurveyResponse(
        Guid tenantId,
        string surveyName,
        SurveyType surveyType) : base(Guid.NewGuid(), tenantId)
    {
        SurveyName = surveyName;
        SurveyType = surveyType;
        Status = SurveyResponseStatus.Pending;
        Source = SurveySource.Email;
    }

    public static SurveyResponse CreateNpsSurvey(Guid tenantId, string surveyName)
    {
        return new SurveyResponse(tenantId, surveyName, SurveyType.NPS);
    }

    public static SurveyResponse CreateCsatSurvey(Guid tenantId, string surveyName)
    {
        return new SurveyResponse(tenantId, surveyName, SurveyType.CSAT);
    }

    public static SurveyResponse CreateCesSurvey(Guid tenantId, string surveyName)
    {
        return new SurveyResponse(tenantId, surveyName, SurveyType.CES);
    }

    public SurveyAnswer AddAnswer(string questionId, string question, string? answer, int? score = null)
    {
        var surveyAnswer = new SurveyAnswer(Id, questionId, question, answer, score);
        _answers.Add(surveyAnswer);
        return surveyAnswer;
    }

    public void Send()
    {
        Status = SurveyResponseStatus.Sent;
        SentDate = DateTime.UtcNow;
    }

    public void Start()
    {
        Status = SurveyResponseStatus.Started;
        StartedDate = DateTime.UtcNow;
    }

    public void Complete()
    {
        Status = SurveyResponseStatus.Completed;
        CompletedDate = DateTime.UtcNow;

        if (StartedDate.HasValue)
        {
            CompletionTimeSeconds = (int)(CompletedDate.Value - StartedDate.Value).TotalSeconds;
        }
    }

    public void SetNpsScore(int score)
    {
        if (score < 0 || score > 10)
            throw new ArgumentException("NPS puanı 0-10 arasında olmalıdır.");

        NpsScore = score;
        NpsCategory = score switch
        {
            >= 9 => Entities.NpsCategory.Promoter,
            >= 7 => Entities.NpsCategory.Passive,
            _ => Entities.NpsCategory.Detractor
        };

        // Check if follow-up needed for detractors
        if (NpsCategory == Entities.NpsCategory.Detractor)
        {
            FollowUpRequired = true;
        }
    }

    public void SetCsatScore(int score)
    {
        if (score < 1 || score > 5)
            throw new ArgumentException("CSAT puanı 1-5 arasında olmalıdır.");

        CsatScore = score;

        // Check if follow-up needed for low scores
        if (score <= 2)
        {
            FollowUpRequired = true;
        }
    }

    public void SetCesScore(int score)
    {
        if (score < 1 || score > 7)
            throw new ArgumentException("CES puanı 1-7 arasında olmalıdır.");

        CesScore = score;

        // Check if follow-up needed for high effort
        if (score >= 5)
        {
            FollowUpRequired = true;
        }
    }

    public void SetOverallSatisfaction(decimal score)
    {
        OverallSatisfaction = Math.Clamp(score, 1, 5);
    }

    public void CompleteFollowUp(string? note = null)
    {
        FollowUpDone = true;
        FollowUpDate = DateTime.UtcNow;
        FollowUpNote = note;
    }

    public void SetRespondent(string? name, string? email, string? phone, bool isAnonymous = false)
    {
        RespondentName = name;
        RespondentEmail = email;
        RespondentPhone = phone;
        IsAnonymous = isAnonymous;
    }

    public void SetFeedback(string? overallComment, string? improvementSuggestion, string? praise, string? complaint)
    {
        OverallComment = overallComment;
        ImprovementSuggestion = improvementSuggestion;
        Praise = praise;
        Complaint = complaint;
    }

    public void RelateToCustomer(Guid customerId) => CustomerId = customerId;
    public void RelateToContact(Guid contactId) => ContactId = contactId;
    public void RelateToLead(Guid leadId) => LeadId = leadId;
    public void RelateToTicket(Guid ticketId) => TicketId = ticketId;
    public void RelateToOrder(Guid orderId) => OrderId = orderId;
    public void RelateToCampaign(Guid campaignId) => CampaignId = campaignId;

    public void SetAssignedTo(int userId) => AssignedToUserId = userId;
    public void SetWouldRecommend(bool? value) => WouldRecommend = value;
    public void SetWouldRepurchase(bool? value) => WouldRepurchase = value;
    public void SetSource(SurveySource source) => Source = source;
    public void SetDeviceType(string? deviceType) => DeviceType = deviceType;
    public void SetIpAddress(string? ip) => IpAddress = ip;
    public void SetLanguage(string? language) => Language = language;
    public void SetFollowUpRequired(bool required) => FollowUpRequired = required;
}

/// <summary>
/// Anket cevabı / Survey answer
/// </summary>
public class SurveyAnswer : TenantEntity
{
    public Guid SurveyResponseId { get; private set; }
    public string QuestionId { get; private set; } = string.Empty;
    public string Question { get; private set; } = string.Empty;
    public string? Answer { get; private set; }
    public int? Score { get; private set; }
    public string? AnswerType { get; private set; }
    public int SortOrder { get; private set; }

    public virtual SurveyResponse SurveyResponse { get; private set; } = null!;

    protected SurveyAnswer() : base() { }

    public SurveyAnswer(
        Guid surveyResponseId,
        string questionId,
        string question,
        string? answer,
        int? score = null) : base(Guid.NewGuid(), Guid.Empty)
    {
        SurveyResponseId = surveyResponseId;
        QuestionId = questionId;
        Question = question;
        Answer = answer;
        Score = score;
    }

    public void SetAnswerType(string? type) => AnswerType = type;
    public void SetSortOrder(int order) => SortOrder = order;
}

#region Enums

public enum SurveyType
{
    /// <summary>NPS (Net Promoter Score)</summary>
    NPS = 1,

    /// <summary>CSAT (Customer Satisfaction)</summary>
    CSAT = 2,

    /// <summary>CES (Customer Effort Score)</summary>
    CES = 3,

    /// <summary>Ürün geri bildirimi / Product feedback</summary>
    ProductFeedback = 4,

    /// <summary>Hizmet geri bildirimi / Service feedback</summary>
    ServiceFeedback = 5,

    /// <summary>Destek geri bildirimi / Support feedback</summary>
    SupportFeedback = 6,

    /// <summary>Onboarding</summary>
    Onboarding = 7,

    /// <summary>Churn (ayrılma) analizi / Churn analysis</summary>
    ChurnAnalysis = 8,

    /// <summary>Genel / General</summary>
    General = 99
}

public enum SurveyResponseStatus
{
    /// <summary>Bekliyor / Pending</summary>
    Pending = 1,

    /// <summary>Gönderildi / Sent</summary>
    Sent = 2,

    /// <summary>Başlandı / Started</summary>
    Started = 3,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 4,

    /// <summary>Süresi doldu / Expired</summary>
    Expired = 5
}

public enum SurveySource
{
    /// <summary>E-posta / Email</summary>
    Email = 1,

    /// <summary>Web / Web</summary>
    Web = 2,

    /// <summary>Mobil uygulama / Mobile app</summary>
    MobileApp = 3,

    /// <summary>SMS</summary>
    SMS = 4,

    /// <summary>Telefon / Phone</summary>
    Phone = 5,

    /// <summary>Uygulama içi / In-app</summary>
    InApp = 6,

    /// <summary>QR kod / QR code</summary>
    QRCode = 7
}

public enum NpsCategory
{
    /// <summary>Destekçi (9-10) / Promoter</summary>
    Promoter = 1,

    /// <summary>Pasif (7-8) / Passive</summary>
    Passive = 2,

    /// <summary>Eleştirmen (0-6) / Detractor</summary>
    Detractor = 3
}

#endregion
