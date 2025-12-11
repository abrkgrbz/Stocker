using Stocker.SharedKernel.MultiTenancy;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Toplantı entity'si - Toplantı yönetimi ve takibi
/// Meeting entity - Meeting management and tracking
/// </summary>
public class Meeting : TenantEntity
{
    private readonly List<MeetingAttendee> _attendees = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Toplantı başlığı / Meeting title
    /// </summary>
    public string Title { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Toplantı türü / Meeting type
    /// </summary>
    public MeetingType MeetingType { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public MeetingStatus Status { get; private set; }

    /// <summary>
    /// Öncelik / Priority
    /// </summary>
    public MeetingPriority Priority { get; private set; }

    #endregion

    #region Zaman Bilgileri (Time Information)

    /// <summary>
    /// Başlangıç zamanı / Start time
    /// </summary>
    public DateTime StartTime { get; private set; }

    /// <summary>
    /// Bitiş zamanı / End time
    /// </summary>
    public DateTime EndTime { get; private set; }

    /// <summary>
    /// Tüm gün mü? / Is all day?
    /// </summary>
    public bool IsAllDay { get; private set; }

    /// <summary>
    /// Saat dilimi / Timezone
    /// </summary>
    public string? Timezone { get; private set; }

    /// <summary>
    /// Gerçek başlangıç zamanı / Actual start time
    /// </summary>
    public DateTime? ActualStartTime { get; private set; }

    /// <summary>
    /// Gerçek bitiş zamanı / Actual end time
    /// </summary>
    public DateTime? ActualEndTime { get; private set; }

    #endregion

    #region Konum Bilgileri (Location Information)

    /// <summary>
    /// Konum türü / Location type
    /// </summary>
    public MeetingLocationType LocationType { get; private set; }

    /// <summary>
    /// Konum / Location
    /// </summary>
    public string? Location { get; private set; }

    /// <summary>
    /// Toplantı odası / Meeting room
    /// </summary>
    public string? MeetingRoom { get; private set; }

    /// <summary>
    /// Online toplantı linki / Online meeting link
    /// </summary>
    public string? OnlineMeetingLink { get; private set; }

    /// <summary>
    /// Online toplantı platformu / Online meeting platform
    /// </summary>
    public string? OnlineMeetingPlatform { get; private set; }

    /// <summary>
    /// Toplantı şifresi / Meeting password
    /// </summary>
    public string? MeetingPassword { get; private set; }

    /// <summary>
    /// Telefon dial-in numarası / Phone dial-in
    /// </summary>
    public string? DialInNumber { get; private set; }

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
    /// Anlaşma ID / Deal ID
    /// </summary>
    public Guid? DealId { get; private set; }

    /// <summary>
    /// Kampanya ID / Campaign ID
    /// </summary>
    public Guid? CampaignId { get; private set; }

    #endregion

    #region Organizatör Bilgileri (Organizer Information)

    /// <summary>
    /// Organizatör kullanıcı ID / Organizer user ID
    /// </summary>
    public int OrganizerId { get; private set; }

    /// <summary>
    /// Organizatör adı / Organizer name
    /// </summary>
    public string? OrganizerName { get; private set; }

    /// <summary>
    /// Organizatör e-postası / Organizer email
    /// </summary>
    public string? OrganizerEmail { get; private set; }

    #endregion

    #region İçerik Bilgileri (Content Information)

    /// <summary>
    /// Gündem / Agenda
    /// </summary>
    public string? Agenda { get; private set; }

    /// <summary>
    /// Toplantı notları / Meeting notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Sonuç / Outcome
    /// </summary>
    public string? Outcome { get; private set; }

    /// <summary>
    /// Eylem kalemleri / Action items
    /// </summary>
    public string? ActionItems { get; private set; }

    #endregion

    #region Hatırlatma Bilgileri (Reminder Information)

    /// <summary>
    /// Hatırlatma var mı? / Has reminder?
    /// </summary>
    public bool HasReminder { get; private set; }

    /// <summary>
    /// Hatırlatma süresi (dakika önce) / Reminder minutes before
    /// </summary>
    public int? ReminderMinutesBefore { get; private set; }

    /// <summary>
    /// Hatırlatma gönderildi mi? / Reminder sent?
    /// </summary>
    public bool ReminderSent { get; private set; }

    #endregion

    #region Tekrarlama Bilgileri (Recurrence Information)

    /// <summary>
    /// Tekrarlı mı? / Is recurring?
    /// </summary>
    public bool IsRecurring { get; private set; }

    /// <summary>
    /// Tekrarlama deseni / Recurrence pattern
    /// </summary>
    public string? RecurrencePattern { get; private set; }

    /// <summary>
    /// Ana toplantı ID / Parent meeting ID
    /// </summary>
    public Guid? ParentMeetingId { get; private set; }

    /// <summary>
    /// Tekrarlama bitiş tarihi / Recurrence end date
    /// </summary>
    public DateTime? RecurrenceEndDate { get; private set; }

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

    #endregion

    // Navigation
    public virtual Customer? Customer { get; private set; }
    public virtual Contact? Contact { get; private set; }
    public virtual Lead? Lead { get; private set; }
    public virtual Opportunity? Opportunity { get; private set; }
    public virtual Deal? Deal { get; private set; }
    public virtual Campaign? Campaign { get; private set; }
    public virtual Meeting? ParentMeeting { get; private set; }
    public IReadOnlyList<MeetingAttendee> Attendees => _attendees.AsReadOnly();

    protected Meeting() : base() { }

    public Meeting(
        Guid tenantId,
        string title,
        DateTime startTime,
        DateTime endTime,
        int organizerId,
        MeetingType meetingType = MeetingType.General) : base(Guid.NewGuid(), tenantId)
    {
        Title = title;
        StartTime = startTime;
        EndTime = endTime;
        OrganizerId = organizerId;
        MeetingType = meetingType;
        Status = MeetingStatus.Scheduled;
        Priority = MeetingPriority.Normal;
        LocationType = MeetingLocationType.InPerson;
    }

    public static Meeting CreateOnlineMeeting(
        Guid tenantId,
        string title,
        DateTime startTime,
        DateTime endTime,
        int organizerId,
        string meetingLink,
        string platform)
    {
        var meeting = new Meeting(tenantId, title, startTime, endTime, organizerId);
        meeting.LocationType = MeetingLocationType.Online;
        meeting.OnlineMeetingLink = meetingLink;
        meeting.OnlineMeetingPlatform = platform;
        return meeting;
    }

    public MeetingAttendee AddAttendee(string email, string? name = null, AttendeeType type = AttendeeType.Required)
    {
        if (_attendees.Any(a => a.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Bu katılımcı zaten eklenmiş.");

        var attendee = new MeetingAttendee(Id, email, name, type);
        _attendees.Add(attendee);
        return attendee;
    }

    public void RemoveAttendee(string email)
    {
        var attendee = _attendees.FirstOrDefault(a => a.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        if (attendee != null)
            _attendees.Remove(attendee);
    }

    public void Start()
    {
        if (Status != MeetingStatus.Scheduled && Status != MeetingStatus.Confirmed)
            throw new InvalidOperationException("Toplantı başlatılamaz.");

        Status = MeetingStatus.InProgress;
        ActualStartTime = DateTime.UtcNow;
    }

    public void Complete(string? outcome = null, string? actionItems = null)
    {
        Status = MeetingStatus.Completed;
        ActualEndTime = DateTime.UtcNow;
        Outcome = outcome;
        ActionItems = actionItems;
    }

    public void Cancel(string? reason = null)
    {
        if (Status == MeetingStatus.Completed)
            throw new InvalidOperationException("Tamamlanmış toplantılar iptal edilemez.");

        Status = MeetingStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes)
            ? $"İptal nedeni: {reason}"
            : $"{Notes}\nİptal nedeni: {reason}";
    }

    public void Reschedule(DateTime newStartTime, DateTime newEndTime, string? reason = null)
    {
        if (Status == MeetingStatus.Completed || Status == MeetingStatus.Cancelled)
            throw new InvalidOperationException("Toplantı yeniden planlanamaz.");

        StartTime = newStartTime;
        EndTime = newEndTime;
        Status = MeetingStatus.Rescheduled;

        if (!string.IsNullOrEmpty(reason))
        {
            Notes = string.IsNullOrEmpty(Notes)
                ? $"Yeniden planlama nedeni: {reason}"
                : $"{Notes}\nYeniden planlama nedeni: {reason}";
        }
    }

    public void Confirm()
    {
        if (Status != MeetingStatus.Scheduled && Status != MeetingStatus.Rescheduled)
            throw new InvalidOperationException("Toplantı onaylanamaz.");

        Status = MeetingStatus.Confirmed;
    }

    public void MarkNoShow()
    {
        Status = MeetingStatus.NoShow;
    }

    public void SetOnlineDetails(string link, string platform, string? password = null, string? dialIn = null)
    {
        LocationType = MeetingLocationType.Online;
        OnlineMeetingLink = link;
        OnlineMeetingPlatform = platform;
        MeetingPassword = password;
        DialInNumber = dialIn;
    }

    public void SetPhysicalLocation(string location, string? room = null)
    {
        LocationType = MeetingLocationType.InPerson;
        Location = location;
        MeetingRoom = room;
        OnlineMeetingLink = null;
        OnlineMeetingPlatform = null;
    }

    public void SetHybridLocation(string physicalLocation, string onlineLink, string platform)
    {
        LocationType = MeetingLocationType.Hybrid;
        Location = physicalLocation;
        OnlineMeetingLink = onlineLink;
        OnlineMeetingPlatform = platform;
    }

    public void SetReminder(int minutesBefore)
    {
        HasReminder = true;
        ReminderMinutesBefore = minutesBefore;
        ReminderSent = false;
    }

    public void MarkReminderSent()
    {
        ReminderSent = true;
    }

    public void SetRecurrence(string pattern, DateTime? endDate = null)
    {
        IsRecurring = true;
        RecurrencePattern = pattern;
        RecurrenceEndDate = endDate;
    }

    public void SetRecording(string recordingUrl)
    {
        HasRecording = true;
        RecordingUrl = recordingUrl;
    }

    public void RelateToCustomer(Guid customerId) => CustomerId = customerId;
    public void RelateToContact(Guid contactId) => ContactId = contactId;
    public void RelateToLead(Guid leadId) => LeadId = leadId;
    public void RelateToOpportunity(Guid opportunityId) => OpportunityId = opportunityId;
    public void RelateToDeal(Guid dealId) => DealId = dealId;
    public void RelateToCampaign(Guid campaignId) => CampaignId = campaignId;

    public void UpdateDetails(string title, string? description)
    {
        Title = title;
        Description = description;
    }

    public void SetAgenda(string? agenda) => Agenda = agenda;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetPriority(MeetingPriority priority) => Priority = priority;
    public void SetMeetingType(MeetingType type) => MeetingType = type;
    public void SetTimezone(string? timezone) => Timezone = timezone;
    public void SetAllDay(bool isAllDay) => IsAllDay = isAllDay;
    public void SetOrganizerInfo(string? name, string? email)
    {
        OrganizerName = name;
        OrganizerEmail = email;
    }

    public TimeSpan GetDuration() => EndTime - StartTime;

    public bool IsUpcoming() => Status == MeetingStatus.Scheduled && StartTime > DateTime.UtcNow;

    public bool IsOverdue() => Status == MeetingStatus.Scheduled && EndTime < DateTime.UtcNow;
}

/// <summary>
/// Toplantı katılımcısı / Meeting attendee
/// </summary>
public class MeetingAttendee : TenantEntity
{
    public Guid MeetingId { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string? Name { get; private set; }
    public AttendeeType Type { get; private set; }
    public AttendeeResponse Response { get; private set; }
    public DateTime? ResponseDate { get; private set; }
    public string? ResponseNote { get; private set; }
    public bool IsOrganizer { get; private set; }
    public bool Attended { get; private set; }
    public DateTime? CheckInTime { get; private set; }

    // Related CRM entities
    public Guid? ContactId { get; private set; }
    public int? UserId { get; private set; }

    public virtual Meeting Meeting { get; private set; } = null!;
    public virtual Contact? Contact { get; private set; }

    protected MeetingAttendee() : base() { }

    public MeetingAttendee(
        Guid meetingId,
        string email,
        string? name = null,
        AttendeeType type = AttendeeType.Required) : base(Guid.NewGuid(), Guid.Empty)
    {
        MeetingId = meetingId;
        Email = email;
        Name = name;
        Type = type;
        Response = AttendeeResponse.NotResponded;
    }

    public void Respond(AttendeeResponse response, string? note = null)
    {
        Response = response;
        ResponseDate = DateTime.UtcNow;
        ResponseNote = note;
    }

    public void Accept(string? note = null) => Respond(AttendeeResponse.Accepted, note);
    public void Decline(string? note = null) => Respond(AttendeeResponse.Declined, note);
    public void Tentative(string? note = null) => Respond(AttendeeResponse.Tentative, note);

    public void MarkAttended()
    {
        Attended = true;
        CheckInTime = DateTime.UtcNow;
    }

    public void SetAsOrganizer() => IsOrganizer = true;
    public void SetContact(Guid contactId) => ContactId = contactId;
    public void SetUser(int userId) => UserId = userId;
}

#region Enums

public enum MeetingType
{
    /// <summary>Genel / General</summary>
    General = 1,

    /// <summary>Satış / Sales</summary>
    Sales = 2,

    /// <summary>Demo / Demo</summary>
    Demo = 3,

    /// <summary>Sunum / Presentation</summary>
    Presentation = 4,

    /// <summary>Müzakere / Negotiation</summary>
    Negotiation = 5,

    /// <summary>Sözleşme / Contract</summary>
    Contract = 6,

    /// <summary>Kick-off</summary>
    Kickoff = 7,

    /// <summary>İnceleme / Review</summary>
    Review = 8,

    /// <summary>Planlama / Planning</summary>
    Planning = 9,

    /// <summary>Eğitim / Training</summary>
    Training = 10,

    /// <summary>Workshop</summary>
    Workshop = 11,

    /// <summary>Webinar</summary>
    Webinar = 12,

    /// <summary>Konferans / Conference</summary>
    Conference = 13,

    /// <summary>Birebir / One-on-one</summary>
    OneOnOne = 14,

    /// <summary>Ekip toplantısı / Team meeting</summary>
    TeamMeeting = 15,

    /// <summary>İş yemeği / Business lunch</summary>
    BusinessLunch = 16,

    /// <summary>Saha ziyareti / Site visit</summary>
    SiteVisit = 17
}

public enum MeetingStatus
{
    /// <summary>Planlandı / Scheduled</summary>
    Scheduled = 1,

    /// <summary>Onaylandı / Confirmed</summary>
    Confirmed = 2,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 3,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 4,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 5,

    /// <summary>Yeniden planlandı / Rescheduled</summary>
    Rescheduled = 6,

    /// <summary>Katılım olmadı / No show</summary>
    NoShow = 7
}

public enum MeetingPriority
{
    /// <summary>Düşük / Low</summary>
    Low = 1,

    /// <summary>Normal / Normal</summary>
    Normal = 2,

    /// <summary>Yüksek / High</summary>
    High = 3,

    /// <summary>Acil / Urgent</summary>
    Urgent = 4
}

public enum MeetingLocationType
{
    /// <summary>Yüz yüze / In person</summary>
    InPerson = 1,

    /// <summary>Online / Online</summary>
    Online = 2,

    /// <summary>Hibrit / Hybrid</summary>
    Hybrid = 3,

    /// <summary>Telefon / Phone</summary>
    Phone = 4
}

public enum AttendeeType
{
    /// <summary>Zorunlu / Required</summary>
    Required = 1,

    /// <summary>Opsiyonel / Optional</summary>
    Optional = 2,

    /// <summary>Kaynak / Resource</summary>
    Resource = 3
}

public enum AttendeeResponse
{
    /// <summary>Cevap verilmedi / Not responded</summary>
    NotResponded = 0,

    /// <summary>Kabul edildi / Accepted</summary>
    Accepted = 1,

    /// <summary>Reddedildi / Declined</summary>
    Declined = 2,

    /// <summary>Belirsiz / Tentative</summary>
    Tentative = 3
}

#endregion
