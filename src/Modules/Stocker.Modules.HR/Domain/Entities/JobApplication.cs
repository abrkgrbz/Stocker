using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// İş başvurusu entity'si - Aday takibi
/// Job Application entity - Candidate tracking
/// </summary>
public class JobApplication : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Başvuru kodu / Application code
    /// </summary>
    public string ApplicationCode { get; private set; } = string.Empty;

    /// <summary>
    /// Durum / Status
    /// </summary>
    public ApplicationStatus Status { get; private set; }

    /// <summary>
    /// Başvuru tarihi / Application date
    /// </summary>
    public DateTime ApplicationDate { get; private set; }

    #endregion

    #region İlan Bilgileri (Job Posting Info)

    /// <summary>
    /// İş ilanı ID / Job posting ID
    /// </summary>
    public int JobPostingId { get; private set; }

    #endregion

    #region Aday Bilgileri (Candidate Information)

    /// <summary>
    /// Ad / First name
    /// </summary>
    public string FirstName { get; private set; } = string.Empty;

    /// <summary>
    /// Soyad / Last name
    /// </summary>
    public string LastName { get; private set; } = string.Empty;

    /// <summary>
    /// Tam ad / Full name
    /// </summary>
    public string FullName => $"{FirstName} {LastName}";

    /// <summary>
    /// E-posta / Email
    /// </summary>
    public string Email { get; private set; } = string.Empty;

    /// <summary>
    /// Telefon / Phone
    /// </summary>
    public string? Phone { get; private set; }

    /// <summary>
    /// Cep telefonu / Mobile phone
    /// </summary>
    public string? MobilePhone { get; private set; }

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
    /// LinkedIn profili / LinkedIn profile
    /// </summary>
    public string? LinkedInUrl { get; private set; }

    /// <summary>
    /// Portfolio / Website
    /// </summary>
    public string? PortfolioUrl { get; private set; }

    #endregion

    #region Deneyim Bilgileri (Experience Information)

    /// <summary>
    /// Toplam deneyim (yıl) / Total experience (years)
    /// </summary>
    public int? TotalExperienceYears { get; private set; }

    /// <summary>
    /// Mevcut şirket / Current company
    /// </summary>
    public string? CurrentCompany { get; private set; }

    /// <summary>
    /// Mevcut pozisyon / Current position
    /// </summary>
    public string? CurrentPosition { get; private set; }

    /// <summary>
    /// Mevcut maaş / Current salary
    /// </summary>
    public decimal? CurrentSalary { get; private set; }

    /// <summary>
    /// Beklenen maaş / Expected salary
    /// </summary>
    public decimal? ExpectedSalary { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// İhbar süresi (gün) / Notice period (days)
    /// </summary>
    public int? NoticePeriodDays { get; private set; }

    /// <summary>
    /// Başlayabilme tarihi / Available start date
    /// </summary>
    public DateTime? AvailableStartDate { get; private set; }

    #endregion

    #region Eğitim Bilgileri (Education Information)

    /// <summary>
    /// En yüksek eğitim seviyesi / Highest education level
    /// </summary>
    public EducationLevel? HighestEducation { get; private set; }

    /// <summary>
    /// Üniversite / University
    /// </summary>
    public string? University { get; private set; }

    /// <summary>
    /// Bölüm / Major
    /// </summary>
    public string? Major { get; private set; }

    /// <summary>
    /// Mezuniyet yılı / Graduation year
    /// </summary>
    public int? GraduationYear { get; private set; }

    #endregion

    #region Belgeler (Documents)

    /// <summary>
    /// CV dosya URL / Resume file URL
    /// </summary>
    public string? ResumeUrl { get; private set; }

    /// <summary>
    /// Ön yazı / Cover letter
    /// </summary>
    public string? CoverLetter { get; private set; }

    /// <summary>
    /// Ek belgeler / Additional documents
    /// </summary>
    public string? AdditionalDocumentsJson { get; private set; }

    #endregion

    #region Değerlendirme (Evaluation)

    /// <summary>
    /// Genel puan (1-10) / Overall rating
    /// </summary>
    public int? OverallRating { get; private set; }

    /// <summary>
    /// Teknik puan / Technical score
    /// </summary>
    public int? TechnicalScore { get; private set; }

    /// <summary>
    /// Kültürel uyum puanı / Cultural fit score
    /// </summary>
    public int? CulturalFitScore { get; private set; }

    /// <summary>
    /// Değerlendirme notları / Evaluation notes
    /// </summary>
    public string? EvaluationNotes { get; private set; }

    /// <summary>
    /// Değerlendiren ID / Evaluated by user ID
    /// </summary>
    public int? EvaluatedByUserId { get; private set; }

    /// <summary>
    /// Değerlendirme tarihi / Evaluation date
    /// </summary>
    public DateTime? EvaluationDate { get; private set; }

    #endregion

    #region Kaynak Bilgileri (Source Information)

    /// <summary>
    /// Başvuru kaynağı / Application source
    /// </summary>
    public ApplicationSource Source { get; private set; }

    /// <summary>
    /// Referans veren çalışan ID / Referred by employee ID
    /// </summary>
    public int? ReferredByEmployeeId { get; private set; }

    /// <summary>
    /// Kaynak detayı / Source detail
    /// </summary>
    public string? SourceDetail { get; private set; }

    #endregion

    #region Süreç Bilgileri (Process Information)

    /// <summary>
    /// Mevcut aşama / Current stage
    /// </summary>
    public ApplicationStage CurrentStage { get; private set; }

    /// <summary>
    /// Son aşama değişiklik tarihi / Last stage change date
    /// </summary>
    public DateTime? LastStageChangeDate { get; private set; }

    /// <summary>
    /// Red nedeni / Rejection reason
    /// </summary>
    public string? RejectionReason { get; private set; }

    /// <summary>
    /// Red kategorisi / Rejection category
    /// </summary>
    public RejectionCategory? RejectionCategory { get; private set; }

    /// <summary>
    /// Geri çekilme nedeni / Withdrawal reason
    /// </summary>
    public string? WithdrawalReason { get; private set; }

    /// <summary>
    /// Teklif yapıldı mı? / Offer extended?
    /// </summary>
    public bool OfferExtended { get; private set; }

    /// <summary>
    /// Teklif tarihi / Offer date
    /// </summary>
    public DateTime? OfferDate { get; private set; }

    /// <summary>
    /// Teklif edilen maaş / Offered salary
    /// </summary>
    public decimal? OfferedSalary { get; private set; }

    /// <summary>
    /// İşe alım tarihi / Hire date
    /// </summary>
    public DateTime? HireDate { get; private set; }

    /// <summary>
    /// Oluşturulan çalışan ID / Created employee ID
    /// </summary>
    public int? CreatedEmployeeId { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Yetenekler / Skills
    /// </summary>
    public string? Skills { get; private set; }

    /// <summary>
    /// Diller / Languages
    /// </summary>
    public string? Languages { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Yetenek havuzunda mı? / In talent pool?
    /// </summary>
    public bool InTalentPool { get; private set; }

    #endregion

    // Navigation Properties
    public virtual JobPosting JobPosting { get; private set; } = null!;
    public virtual Employee? ReferredByEmployee { get; private set; }
    public virtual Employee? CreatedEmployee { get; private set; }
    public virtual ICollection<Interview> Interviews { get; private set; } = new List<Interview>();

    protected JobApplication() { }

    public JobApplication(
        string applicationCode,
        int jobPostingId,
        string firstName,
        string lastName,
        string email,
        ApplicationSource source = ApplicationSource.Website)
    {
        ApplicationCode = applicationCode;
        JobPostingId = jobPostingId;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Source = source;
        Status = ApplicationStatus.New;
        CurrentStage = ApplicationStage.Applied;
        ApplicationDate = DateTime.UtcNow;
        Currency = "TRY";
    }

    public void MoveToStage(ApplicationStage stage)
    {
        CurrentStage = stage;
        LastStageChangeDate = DateTime.UtcNow;

        Status = stage switch
        {
            ApplicationStage.Applied => ApplicationStatus.New,
            ApplicationStage.Screening => ApplicationStatus.UnderReview,
            ApplicationStage.Interview => ApplicationStatus.UnderReview,
            ApplicationStage.Assessment => ApplicationStatus.UnderReview,
            ApplicationStage.Reference => ApplicationStatus.UnderReview,
            ApplicationStage.Offer => ApplicationStatus.UnderReview,
            ApplicationStage.Hired => ApplicationStatus.Hired,
            ApplicationStage.Rejected => ApplicationStatus.Rejected,
            ApplicationStage.Withdrawn => ApplicationStatus.Withdrawn,
            _ => Status
        };
    }

    public void MarkAsReviewing()
    {
        Status = ApplicationStatus.UnderReview;
    }

    public void ShortList()
    {
        Status = ApplicationStatus.Shortlisted;
        CurrentStage = ApplicationStage.Screening;
        LastStageChangeDate = DateTime.UtcNow;
    }

    public void Reject(string reason, RejectionCategory category)
    {
        Status = ApplicationStatus.Rejected;
        CurrentStage = ApplicationStage.Rejected;
        RejectionReason = reason;
        RejectionCategory = category;
        LastStageChangeDate = DateTime.UtcNow;
    }

    public void Withdraw(string? reason = null)
    {
        Status = ApplicationStatus.Withdrawn;
        CurrentStage = ApplicationStage.Withdrawn;
        WithdrawalReason = reason;
        LastStageChangeDate = DateTime.UtcNow;
    }

    public void ExtendOffer(decimal salary, DateTime? expectedStartDate = null)
    {
        OfferExtended = true;
        OfferDate = DateTime.UtcNow;
        OfferedSalary = salary;
        CurrentStage = ApplicationStage.Offer;
        LastStageChangeDate = DateTime.UtcNow;

        if (expectedStartDate.HasValue)
            AvailableStartDate = expectedStartDate;
    }

    public void AcceptOffer(DateTime hireDate)
    {
        Status = ApplicationStatus.Hired;
        CurrentStage = ApplicationStage.Hired;
        HireDate = hireDate;
        LastStageChangeDate = DateTime.UtcNow;
    }

    public void DeclineOffer(string? reason = null)
    {
        Status = ApplicationStatus.OfferDeclined;
        RejectionReason = reason;
        LastStageChangeDate = DateTime.UtcNow;
    }

    public void LinkToEmployee(int employeeId)
    {
        CreatedEmployeeId = employeeId;
    }

    public void Evaluate(int overallRating, int? technicalScore, int? culturalFitScore, string? notes, int evaluatorUserId)
    {
        OverallRating = overallRating;
        TechnicalScore = technicalScore;
        CulturalFitScore = culturalFitScore;
        EvaluationNotes = notes;
        EvaluatedByUserId = evaluatorUserId;
        EvaluationDate = DateTime.UtcNow;
    }

    public void AddToTalentPool()
    {
        InTalentPool = true;
    }

    public void RemoveFromTalentPool()
    {
        InTalentPool = false;
    }

    public void UpdateContactInfo(string? phone, string? mobilePhone, string? address, string? city, string? country)
    {
        Phone = phone;
        MobilePhone = mobilePhone;
        Address = address;
        City = city;
        Country = country;
    }

    public void UpdateExperience(int? years, string? currentCompany, string? currentPosition, decimal? currentSalary, decimal? expectedSalary, int? noticePeriod)
    {
        TotalExperienceYears = years;
        CurrentCompany = currentCompany;
        CurrentPosition = currentPosition;
        CurrentSalary = currentSalary;
        ExpectedSalary = expectedSalary;
        NoticePeriodDays = noticePeriod;
    }

    public void UpdateEducation(EducationLevel? level, string? university, string? major, int? graduationYear)
    {
        HighestEducation = level;
        University = university;
        Major = major;
        GraduationYear = graduationYear;
    }

    public void SetResumeUrl(string? url) => ResumeUrl = url;
    public void SetCoverLetter(string? letter) => CoverLetter = letter;
    public void SetLinkedInUrl(string? url) => LinkedInUrl = url;
    public void SetPortfolioUrl(string? url) => PortfolioUrl = url;
    public void SetSkills(string? skills) => Skills = skills;
    public void SetLanguages(string? languages) => Languages = languages;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;
    public void SetReferredBy(int? employeeId) => ReferredByEmployeeId = employeeId;
    public void SetSourceDetail(string? detail) => SourceDetail = detail;
    public void SetAvailableStartDate(DateTime? date) => AvailableStartDate = date;
    public void SetNoticePeriodDays(int? days) => NoticePeriodDays = days;
    public void SetCurrency(string? currency) => Currency = currency;
    public void SetHighestEducation(string? education)
    {
        if (!string.IsNullOrEmpty(education) && Enum.TryParse<EducationLevel>(education, true, out var level))
            HighestEducation = level;
    }
    public void SetFirstName(string firstName) => FirstName = firstName;
    public void SetLastName(string lastName) => LastName = lastName;
    public void SetEmail(string email) => Email = email;
}

#region Enums

public enum ApplicationStatus
{
    /// <summary>Yeni / New</summary>
    New = 1,

    /// <summary>İnceleniyor / Under review</summary>
    UnderReview = 2,

    /// <summary>Kısa listeye alındı / Shortlisted</summary>
    Shortlisted = 3,

    /// <summary>İşe alındı / Hired</summary>
    Hired = 4,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 5,

    /// <summary>Geri çekildi / Withdrawn</summary>
    Withdrawn = 6,

    /// <summary>Teklif reddedildi / Offer declined</summary>
    OfferDeclined = 7
}

public enum ApplicationStage
{
    /// <summary>Başvuruldu / Applied</summary>
    Applied = 1,

    /// <summary>Ön eleme / Screening</summary>
    Screening = 2,

    /// <summary>Mülakat / Interview</summary>
    Interview = 3,

    /// <summary>Değerlendirme / Assessment</summary>
    Assessment = 4,

    /// <summary>Referans kontrolü / Reference check</summary>
    Reference = 5,

    /// <summary>Teklif / Offer</summary>
    Offer = 6,

    /// <summary>İşe alındı / Hired</summary>
    Hired = 7,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 8,

    /// <summary>Geri çekildi / Withdrawn</summary>
    Withdrawn = 9
}

public enum ApplicationSource
{
    /// <summary>Şirket web sitesi / Company website</summary>
    Website = 1,

    /// <summary>LinkedIn</summary>
    LinkedIn = 2,

    /// <summary>İş ilanı sitesi / Job board</summary>
    JobBoard = 3,

    /// <summary>Çalışan referansı / Employee referral</summary>
    EmployeeReferral = 4,

    /// <summary>Kariyer fuarı / Career fair</summary>
    CareerFair = 5,

    /// <summary>Ajans / Agency</summary>
    Agency = 6,

    /// <summary>Direkt başvuru / Direct application</summary>
    Direct = 7,

    /// <summary>Sosyal medya / Social media</summary>
    SocialMedia = 8,

    /// <summary>Üniversite / University</summary>
    University = 9,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum EducationLevel
{
    /// <summary>Lise / High school</summary>
    HighSchool = 1,

    /// <summary>Ön lisans / Associate</summary>
    Associate = 2,

    /// <summary>Lisans / Bachelor's</summary>
    Bachelor = 3,

    /// <summary>Yüksek lisans / Master's</summary>
    Master = 4,

    /// <summary>Doktora / Doctorate</summary>
    Doctorate = 5,

    /// <summary>MBA</summary>
    MBA = 6
}

public enum RejectionCategory
{
    /// <summary>Yetersiz deneyim / Insufficient experience</summary>
    InsufficientExperience = 1,

    /// <summary>Yetersiz nitelik / Insufficient qualifications</summary>
    InsufficientQualifications = 2,

    /// <summary>Kültürel uyumsuzluk / Cultural mismatch</summary>
    CulturalMismatch = 3,

    /// <summary>Maaş beklentisi / Salary expectations</summary>
    SalaryExpectations = 4,

    /// <summary>Başka aday seçildi / Another candidate selected</summary>
    AnotherCandidateSelected = 5,

    /// <summary>Pozisyon iptal edildi / Position cancelled</summary>
    PositionCancelled = 6,

    /// <summary>İletişim kurulamadı / No response</summary>
    NoResponse = 7,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
