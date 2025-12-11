using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Sertifika entity'si - Çalışan sertifika ve lisans takibi
/// Certification entity - Employee certification and license tracking
/// </summary>
public class Certification : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// Sertifika adı / Certification name
    /// </summary>
    public string CertificationName { get; private set; } = string.Empty;

    /// <summary>
    /// Sertifika türü / Certification type
    /// </summary>
    public CertificationType CertificationType { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public CertificationStatus Status { get; private set; }

    #endregion

    #region Veren Kurum (Issuing Authority)

    /// <summary>
    /// Veren kurum / Issuing authority
    /// </summary>
    public string IssuingAuthority { get; private set; } = string.Empty;

    /// <summary>
    /// Veren kurum ülkesi / Issuing country
    /// </summary>
    public string? IssuingCountry { get; private set; }

    /// <summary>
    /// Akreditasyon kurumu / Accreditation body
    /// </summary>
    public string? AccreditationBody { get; private set; }

    #endregion

    #region Sertifika Detayları (Certification Details)

    /// <summary>
    /// Sertifika numarası / Certification number
    /// </summary>
    public string? CertificationNumber { get; private set; }

    /// <summary>
    /// Sertifika ID / Credential ID
    /// </summary>
    public string? CredentialId { get; private set; }

    /// <summary>
    /// Doğrulama URL / Verification URL
    /// </summary>
    public string? VerificationUrl { get; private set; }

    /// <summary>
    /// Sertifika seviyesi / Certification level
    /// </summary>
    public string? CertificationLevel { get; private set; }

    /// <summary>
    /// Uzmanlık alanı / Specialization
    /// </summary>
    public string? Specialization { get; private set; }

    #endregion

    #region Tarihler (Dates)

    /// <summary>
    /// Alınma tarihi / Issue date
    /// </summary>
    public DateTime IssueDate { get; private set; }

    /// <summary>
    /// Bitiş tarihi / Expiry date
    /// </summary>
    public DateTime? ExpiryDate { get; private set; }

    /// <summary>
    /// Son yenileme tarihi / Last renewal date
    /// </summary>
    public DateTime? LastRenewalDate { get; private set; }

    /// <summary>
    /// Sonraki yenileme tarihi / Next renewal date
    /// </summary>
    public DateTime? NextRenewalDate { get; private set; }

    #endregion

    #region Eğitim Bilgileri (Training Information)

    /// <summary>
    /// Eğitim gerekli mi? / Training required?
    /// </summary>
    public bool TrainingRequired { get; private set; }

    /// <summary>
    /// Toplam eğitim saati / Total training hours
    /// </summary>
    public int? TotalTrainingHours { get; private set; }

    /// <summary>
    /// Tamamlanan eğitim saati / Completed training hours
    /// </summary>
    public int? CompletedTrainingHours { get; private set; }

    /// <summary>
    /// Eğitim sağlayıcı / Training provider
    /// </summary>
    public string? TrainingProvider { get; private set; }

    /// <summary>
    /// Eğitim tamamlanma tarihi / Training completion date
    /// </summary>
    public DateTime? TrainingCompletionDate { get; private set; }

    #endregion

    #region Sınav Bilgileri (Exam Information)

    /// <summary>
    /// Sınav gerekli mi? / Exam required?
    /// </summary>
    public bool ExamRequired { get; private set; }

    /// <summary>
    /// Sınav tarihi / Exam date
    /// </summary>
    public DateTime? ExamDate { get; private set; }

    /// <summary>
    /// Sınav puanı / Exam score
    /// </summary>
    public decimal? ExamScore { get; private set; }

    /// <summary>
    /// Geçme puanı / Passing score
    /// </summary>
    public decimal? PassingScore { get; private set; }

    /// <summary>
    /// Deneme sayısı / Attempt number
    /// </summary>
    public int AttemptNumber { get; private set; } = 1;

    #endregion

    #region Maliyet Bilgileri (Cost Information)

    /// <summary>
    /// Sertifika maliyeti / Certification cost
    /// </summary>
    public decimal? CertificationCost { get; private set; }

    /// <summary>
    /// Yenileme maliyeti / Renewal cost
    /// </summary>
    public decimal? RenewalCost { get; private set; }

    /// <summary>
    /// Şirket tarafından karşılandı mı? / Company sponsored?
    /// </summary>
    public bool CompanySponsored { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    #endregion

    #region CPE/CEU Bilgileri (Continuing Education)

    /// <summary>
    /// CPE/CEU gerekli mi? / CPE/CEU required?
    /// </summary>
    public bool CpeRequired { get; private set; }

    /// <summary>
    /// Gerekli CPE/CEU / Required CPE/CEU
    /// </summary>
    public int? RequiredCpeUnits { get; private set; }

    /// <summary>
    /// Kazanılan CPE/CEU / Earned CPE/CEU
    /// </summary>
    public int? EarnedCpeUnits { get; private set; }

    /// <summary>
    /// CPE periyodu başlangıç / CPE period start
    /// </summary>
    public DateTime? CpePeriodStart { get; private set; }

    /// <summary>
    /// CPE periyodu bitiş / CPE period end
    /// </summary>
    public DateTime? CpePeriodEnd { get; private set; }

    #endregion

    #region Belge Bilgileri (Document Information)

    /// <summary>
    /// Sertifika dosya URL / Certificate file URL
    /// </summary>
    public string? CertificateFileUrl { get; private set; }

    /// <summary>
    /// Badge URL / Badge URL
    /// </summary>
    public string? BadgeUrl { get; private set; }

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
    /// İş için zorunlu mu? / Required for job?
    /// </summary>
    public bool RequiredForJob { get; private set; }

    /// <summary>
    /// Hatırlatıcı gönderildi mi? / Reminder sent?
    /// </summary>
    public bool ReminderSent { get; private set; }

    /// <summary>
    /// Hatırlatıcı tarihi / Reminder date
    /// </summary>
    public DateTime? ReminderDate { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;

    protected Certification() { }

    public Certification(
        int employeeId,
        string certificationName,
        string issuingAuthority,
        DateTime issueDate,
        CertificationType certificationType = CertificationType.Professional)
    {
        EmployeeId = employeeId;
        CertificationName = certificationName;
        IssuingAuthority = issuingAuthority;
        IssueDate = issueDate;
        CertificationType = certificationType;
        Status = CertificationStatus.Active;
        Currency = "TRY";
    }

    public void Renew(DateTime newExpiryDate, decimal? cost = null)
    {
        LastRenewalDate = DateTime.UtcNow;
        ExpiryDate = newExpiryDate;
        NextRenewalDate = newExpiryDate.AddMonths(-3); // Reminder 3 months before
        if (cost.HasValue)
            RenewalCost = cost;
        Status = CertificationStatus.Active;
        ReminderSent = false;
    }

    public void Expire()
    {
        Status = CertificationStatus.Expired;
    }

    public void Suspend()
    {
        Status = CertificationStatus.Suspended;
    }

    public void Revoke()
    {
        Status = CertificationStatus.Revoked;
    }

    public void MarkAsPending()
    {
        Status = CertificationStatus.Pending;
    }

    public void RecordExamAttempt(DateTime examDate, decimal score, bool passed)
    {
        ExamDate = examDate;
        ExamScore = score;
        AttemptNumber++;

        if (passed)
        {
            Status = CertificationStatus.Active;
        }
    }

    public void AddCpeUnits(int units)
    {
        EarnedCpeUnits = (EarnedCpeUnits ?? 0) + units;
    }

    public void ResetCpePeriod(DateTime periodStart, DateTime periodEnd, int requiredUnits)
    {
        CpePeriodStart = periodStart;
        CpePeriodEnd = periodEnd;
        RequiredCpeUnits = requiredUnits;
        EarnedCpeUnits = 0;
    }

    public void SendReminder()
    {
        ReminderSent = true;
        ReminderDate = DateTime.UtcNow;
    }

    public void SetCertificationNumber(string? number) => CertificationNumber = number;
    public void SetCredentialId(string? id) => CredentialId = id;
    public void SetVerificationUrl(string? url) => VerificationUrl = url;
    public void SetCertificationLevel(string? level) => CertificationLevel = level;
    public void SetSpecialization(string? specialization) => Specialization = specialization;
    public void SetExpiryDate(DateTime? date) => ExpiryDate = date;
    public void SetIssuingCountry(string? country) => IssuingCountry = country;
    public void SetAccreditationBody(string? body) => AccreditationBody = body;

    public void SetTrainingInfo(bool required, int? totalHours, string? provider)
    {
        TrainingRequired = required;
        TotalTrainingHours = totalHours;
        TrainingProvider = provider;
    }

    public void CompleteTraining(int hours, DateTime completionDate)
    {
        CompletedTrainingHours = hours;
        TrainingCompletionDate = completionDate;
    }

    public void SetExamInfo(bool required, decimal? passingScore)
    {
        ExamRequired = required;
        PassingScore = passingScore;
    }

    public void SetCost(decimal? certificationCost, decimal? renewalCost, bool companySponsored)
    {
        CertificationCost = certificationCost;
        RenewalCost = renewalCost;
        CompanySponsored = companySponsored;
    }

    public void SetCpeRequirement(bool required, int? requiredUnits)
    {
        CpeRequired = required;
        RequiredCpeUnits = requiredUnits;
    }

    public void SetCertificateFileUrl(string? url) => CertificateFileUrl = url;
    public void SetBadgeUrl(string? url) => BadgeUrl = url;
    public void SetDescription(string? description) => Description = description;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetRequiredForJob(bool required) => RequiredForJob = required;

    public bool IsExpired() => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
    public bool IsExpiringSoon(int daysThreshold = 90) =>
        ExpiryDate.HasValue && ExpiryDate.Value <= DateTime.UtcNow.AddDays(daysThreshold);
    public bool IsCpeCompliant() => !CpeRequired || (EarnedCpeUnits >= RequiredCpeUnits);
}

#region Enums

public enum CertificationType
{
    /// <summary>Profesyonel / Professional</summary>
    Professional = 1,

    /// <summary>Teknik / Technical</summary>
    Technical = 2,

    /// <summary>Endüstri / Industry</summary>
    Industry = 3,

    /// <summary>Devlet/Resmi / Government</summary>
    Government = 4,

    /// <summary>Akademik / Academic</summary>
    Academic = 5,

    /// <summary>Ürün/Satıcı / Vendor</summary>
    Vendor = 6,

    /// <summary>Güvenlik / Security</summary>
    Security = 7,

    /// <summary>Sağlık / Healthcare</summary>
    Healthcare = 8,

    /// <summary>Finans / Finance</summary>
    Finance = 9,

    /// <summary>Proje yönetimi / Project management</summary>
    ProjectManagement = 10,

    /// <summary>Dil / Language</summary>
    Language = 11,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum CertificationStatus
{
    /// <summary>Beklemede / Pending</summary>
    Pending = 1,

    /// <summary>Aktif / Active</summary>
    Active = 2,

    /// <summary>Süresi doldu / Expired</summary>
    Expired = 3,

    /// <summary>Askıda / Suspended</summary>
    Suspended = 4,

    /// <summary>İptal edildi / Revoked</summary>
    Revoked = 5,

    /// <summary>Yenileniyor / Renewing</summary>
    Renewing = 6
}

#endregion
