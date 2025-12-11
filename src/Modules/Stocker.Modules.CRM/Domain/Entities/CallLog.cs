using Stocker.SharedKernel.MultiTenancy;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Telefon görüşme kaydı entity'si
/// Call Log entity - Phone call tracking and analytics
/// </summary>
public class CallLog : TenantEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Görüşme numarası / Call number
    /// </summary>
    public string CallNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Görüşme yönü / Call direction
    /// </summary>
    public CallDirection Direction { get; private set; }

    /// <summary>
    /// Görüşme türü / Call type
    /// </summary>
    public CallType CallType { get; private set; }

    /// <summary>
    /// Görüşme durumu / Call status
    /// </summary>
    public CallStatus Status { get; private set; }

    #endregion

    #region Zaman Bilgileri (Time Information)

    /// <summary>
    /// Başlangıç zamanı / Start time
    /// </summary>
    public DateTime StartTime { get; private set; }

    /// <summary>
    /// Bitiş zamanı / End time
    /// </summary>
    public DateTime? EndTime { get; private set; }

    /// <summary>
    /// Görüşme süresi (saniye) / Duration in seconds
    /// </summary>
    public int DurationSeconds { get; private set; }

    /// <summary>
    /// Bekleme süresi (saniye) / Wait time in seconds
    /// </summary>
    public int? WaitTimeSeconds { get; private set; }

    /// <summary>
    /// Çalma süresi (saniye) / Ring time in seconds
    /// </summary>
    public int? RingTimeSeconds { get; private set; }

    #endregion

    #region İletişim Bilgileri (Communication Details)

    /// <summary>
    /// Arayan numara / Caller number
    /// </summary>
    public string CallerNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Aranan numara / Called number
    /// </summary>
    public string CalledNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Dahili numara / Extension
    /// </summary>
    public string? Extension { get; private set; }

    /// <summary>
    /// Yönlendirilen numara / Forwarded to
    /// </summary>
    public string? ForwardedTo { get; private set; }

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
    /// Fırsat ID / Opportunity ID
    /// </summary>
    public Guid? OpportunityId { get; private set; }

    /// <summary>
    /// Destek talebi ID / Ticket ID
    /// </summary>
    public Guid? TicketId { get; private set; }

    #endregion

    #region Temsilci Bilgileri (Agent Information)

    /// <summary>
    /// Temsilci kullanıcı ID / Agent user ID
    /// </summary>
    public int? AgentUserId { get; private set; }

    /// <summary>
    /// Temsilci adı / Agent name
    /// </summary>
    public string? AgentName { get; private set; }

    /// <summary>
    /// Kuyruk adı / Queue name
    /// </summary>
    public string? QueueName { get; private set; }

    #endregion

    #region Sonuç Bilgileri (Outcome Information)

    /// <summary>
    /// Görüşme sonucu / Call outcome
    /// </summary>
    public CallOutcome? Outcome { get; private set; }

    /// <summary>
    /// Sonuç açıklaması / Outcome description
    /// </summary>
    public string? OutcomeDescription { get; private set; }

    /// <summary>
    /// Takip gerekli mi? / Follow-up required?
    /// </summary>
    public bool FollowUpRequired { get; private set; }

    /// <summary>
    /// Takip tarihi / Follow-up date
    /// </summary>
    public DateTime? FollowUpDate { get; private set; }

    /// <summary>
    /// Takip notu / Follow-up note
    /// </summary>
    public string? FollowUpNote { get; private set; }

    #endregion

    #region Kayıt Bilgileri (Recording Information)

    /// <summary>
    /// Kayıt var mı? / Has recording?
    /// </summary>
    public bool HasRecording { get; private set; }

    /// <summary>
    /// Kayıt URL / Recording URL
    /// </summary>
    public string? RecordingUrl { get; private set; }

    /// <summary>
    /// Kayıt dosya boyutu / Recording file size
    /// </summary>
    public long? RecordingFileSize { get; private set; }

    /// <summary>
    /// Transkript / Transcript
    /// </summary>
    public string? Transcript { get; private set; }

    #endregion

    #region Kalite Bilgileri (Quality Information)

    /// <summary>
    /// Kalite puanı (1-5) / Quality score
    /// </summary>
    public int? QualityScore { get; private set; }

    /// <summary>
    /// Müşteri memnuniyeti (1-5) / Customer satisfaction
    /// </summary>
    public int? CustomerSatisfaction { get; private set; }

    /// <summary>
    /// Kalite notları / Quality notes
    /// </summary>
    public string? QualityNotes { get; private set; }

    #endregion

    #region Notlar (Notes)

    /// <summary>
    /// Görüşme notları / Call notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Özet / Summary
    /// </summary>
    public string? Summary { get; private set; }

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    #endregion

    #region Sistem Bilgileri (System Information)

    /// <summary>
    /// Harici görüşme ID / External call ID
    /// </summary>
    public string? ExternalCallId { get; private set; }

    /// <summary>
    /// PBX/Santral tipi / PBX type
    /// </summary>
    public string? PbxType { get; private set; }

    /// <summary>
    /// Kampanya ID / Campaign ID
    /// </summary>
    public Guid? CampaignId { get; private set; }

    #endregion

    // Navigation
    public virtual Customer? Customer { get; private set; }
    public virtual Contact? Contact { get; private set; }
    public virtual Lead? Lead { get; private set; }
    public virtual Opportunity? Opportunity { get; private set; }
    public virtual Ticket? Ticket { get; private set; }
    public virtual Campaign? Campaign { get; private set; }

    protected CallLog() : base() { }

    public CallLog(
        Guid tenantId,
        string callNumber,
        CallDirection direction,
        string callerNumber,
        string calledNumber,
        DateTime startTime) : base(Guid.NewGuid(), tenantId)
    {
        CallNumber = callNumber;
        Direction = direction;
        CallerNumber = callerNumber;
        CalledNumber = calledNumber;
        StartTime = startTime;
        Status = CallStatus.Ringing;
        CallType = CallType.Standard;
    }

    public static CallLog CreateOutbound(
        Guid tenantId,
        string callNumber,
        string callerNumber,
        string calledNumber,
        int agentUserId)
    {
        var call = new CallLog(tenantId, callNumber, CallDirection.Outbound, callerNumber, calledNumber, DateTime.UtcNow);
        call.AgentUserId = agentUserId;
        return call;
    }

    public static CallLog CreateInbound(
        Guid tenantId,
        string callNumber,
        string callerNumber,
        string calledNumber)
    {
        return new CallLog(tenantId, callNumber, CallDirection.Inbound, callerNumber, calledNumber, DateTime.UtcNow);
    }

    public void Answer(int? agentUserId = null, string? agentName = null)
    {
        if (Status != CallStatus.Ringing)
            throw new InvalidOperationException("Sadece çalan aramalar cevaplanabilir.");

        Status = CallStatus.InProgress;
        WaitTimeSeconds = (int)(DateTime.UtcNow - StartTime).TotalSeconds;
        AgentUserId = agentUserId;
        AgentName = agentName;
    }

    public void Complete(CallOutcome outcome, string? outcomeDescription = null)
    {
        EndTime = DateTime.UtcNow;
        DurationSeconds = (int)(EndTime.Value - StartTime).TotalSeconds;
        Status = CallStatus.Completed;
        Outcome = outcome;
        OutcomeDescription = outcomeDescription;
    }

    public void Miss()
    {
        EndTime = DateTime.UtcNow;
        RingTimeSeconds = (int)(EndTime.Value - StartTime).TotalSeconds;
        Status = CallStatus.Missed;
        Outcome = CallOutcome.NoAnswer;
    }

    public void Abandon()
    {
        EndTime = DateTime.UtcNow;
        WaitTimeSeconds = (int)(EndTime.Value - StartTime).TotalSeconds;
        Status = CallStatus.Abandoned;
        Outcome = CallOutcome.Abandoned;
    }

    public void Transfer(string forwardedTo)
    {
        ForwardedTo = forwardedTo;
        Status = CallStatus.Transferred;
    }

    public void Hold()
    {
        if (Status != CallStatus.InProgress)
            throw new InvalidOperationException("Sadece devam eden aramalar bekletmeye alınabilir.");

        Status = CallStatus.OnHold;
    }

    public void Resume()
    {
        if (Status != CallStatus.OnHold)
            throw new InvalidOperationException("Sadece beklemede olan aramalar devam ettirilebilir.");

        Status = CallStatus.InProgress;
    }

    public void SetRecording(string recordingUrl, long? fileSize = null)
    {
        HasRecording = true;
        RecordingUrl = recordingUrl;
        RecordingFileSize = fileSize;
    }

    public void SetTranscript(string transcript)
    {
        Transcript = transcript;
    }

    public void SetQualityScore(int score, int? customerSatisfaction = null, string? notes = null)
    {
        if (score < 1 || score > 5)
            throw new ArgumentException("Kalite puanı 1-5 arasında olmalıdır.");

        QualityScore = score;
        CustomerSatisfaction = customerSatisfaction;
        QualityNotes = notes;
    }

    public void SetFollowUp(DateTime followUpDate, string? note = null)
    {
        FollowUpRequired = true;
        FollowUpDate = followUpDate;
        FollowUpNote = note;
    }

    public void ClearFollowUp()
    {
        FollowUpRequired = false;
        FollowUpDate = null;
        FollowUpNote = null;
    }

    public void RelateToCustomer(Guid customerId) => CustomerId = customerId;
    public void RelateToContact(Guid contactId) => ContactId = contactId;
    public void RelateToLead(Guid leadId) => LeadId = leadId;
    public void RelateToOpportunity(Guid opportunityId) => OpportunityId = opportunityId;
    public void RelateToTicket(Guid ticketId) => TicketId = ticketId;
    public void RelateToCampaign(Guid campaignId) => CampaignId = campaignId;

    public void SetAgent(int userId, string? name = null)
    {
        AgentUserId = userId;
        AgentName = name;
    }

    public void SetQueue(string queueName) => QueueName = queueName;
    public void SetExtension(string extension) => Extension = extension;
    public void SetExternalCallId(string externalId) => ExternalCallId = externalId;
    public void SetPbxType(string pbxType) => PbxType = pbxType;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetSummary(string? summary) => Summary = summary;
    public void SetTags(string? tags) => Tags = tags;
    public void SetCallType(CallType callType) => CallType = callType;
}

#region Enums

public enum CallDirection
{
    /// <summary>Gelen / Inbound</summary>
    Inbound = 1,

    /// <summary>Giden / Outbound</summary>
    Outbound = 2,

    /// <summary>Dahili / Internal</summary>
    Internal = 3
}

public enum CallType
{
    /// <summary>Standart / Standard</summary>
    Standard = 1,

    /// <summary>Satış / Sales</summary>
    Sales = 2,

    /// <summary>Destek / Support</summary>
    Support = 3,

    /// <summary>Takip / Follow-up</summary>
    FollowUp = 4,

    /// <summary>Kampanya / Campaign</summary>
    Campaign = 5,

    /// <summary>Konferans / Conference</summary>
    Conference = 6,

    /// <summary>Geri arama / Callback</summary>
    Callback = 7
}

public enum CallStatus
{
    /// <summary>Çalıyor / Ringing</summary>
    Ringing = 1,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 2,

    /// <summary>Beklemede / On hold</summary>
    OnHold = 3,

    /// <summary>Aktarıldı / Transferred</summary>
    Transferred = 4,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 5,

    /// <summary>Cevapsız / Missed</summary>
    Missed = 6,

    /// <summary>Terk edildi / Abandoned</summary>
    Abandoned = 7,

    /// <summary>Meşgul / Busy</summary>
    Busy = 8,

    /// <summary>Başarısız / Failed</summary>
    Failed = 9
}

public enum CallOutcome
{
    /// <summary>Başarılı / Successful</summary>
    Successful = 1,

    /// <summary>Mesaj bırakıldı / Left voicemail</summary>
    LeftVoicemail = 2,

    /// <summary>Cevap yok / No answer</summary>
    NoAnswer = 3,

    /// <summary>Meşgul / Busy</summary>
    Busy = 4,

    /// <summary>Yanlış numara / Wrong number</summary>
    WrongNumber = 5,

    /// <summary>Geri arama talep edildi / Callback requested</summary>
    CallbackRequested = 6,

    /// <summary>İlgi yok / Not interested</summary>
    NotInterested = 7,

    /// <summary>Bilgi verildi / Information provided</summary>
    InformationProvided = 8,

    /// <summary>Randevu alındı / Appointment scheduled</summary>
    AppointmentScheduled = 9,

    /// <summary>Satış yapıldı / Sale made</summary>
    SaleMade = 10,

    /// <summary>Şikayet alındı / Complaint received</summary>
    ComplaintReceived = 11,

    /// <summary>Sorun çözüldü / Issue resolved</summary>
    IssueResolved = 12,

    /// <summary>Terk edildi / Abandoned</summary>
    Abandoned = 13,

    /// <summary>Aktarıldı / Transferred</summary>
    Transferred = 14
}

#endregion
