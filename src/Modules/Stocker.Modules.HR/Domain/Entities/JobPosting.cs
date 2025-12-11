using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// İş ilanı entity'si - Açık pozisyon yönetimi
/// Job Posting entity - Open position management
/// </summary>
public class JobPosting : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// İlan başlığı / Job title
    /// </summary>
    public string Title { get; private set; } = string.Empty;

    /// <summary>
    /// İlan kodu / Posting code
    /// </summary>
    public string PostingCode { get; private set; } = string.Empty;

    /// <summary>
    /// Durum / Status
    /// </summary>
    public JobPostingStatus Status { get; private set; }

    /// <summary>
    /// İş türü / Employment type
    /// </summary>
    public JobEmploymentType EmploymentType { get; private set; }

    /// <summary>
    /// Deneyim seviyesi / Experience level
    /// </summary>
    public ExperienceLevel ExperienceLevel { get; private set; }

    #endregion

    #region Departman ve Pozisyon (Department & Position)

    /// <summary>
    /// Departman ID / Department ID
    /// </summary>
    public int DepartmentId { get; private set; }

    /// <summary>
    /// Pozisyon ID / Position ID
    /// </summary>
    public int? PositionId { get; private set; }

    /// <summary>
    /// İşe alım yöneticisi ID / Hiring manager ID
    /// </summary>
    public int? HiringManagerId { get; private set; }

    /// <summary>
    /// Açık pozisyon sayısı / Number of openings
    /// </summary>
    public int NumberOfOpenings { get; private set; } = 1;

    #endregion

    #region Lokasyon (Location)

    /// <summary>
    /// Çalışma lokasyonu ID / Work location ID
    /// </summary>
    public int? WorkLocationId { get; private set; }

    /// <summary>
    /// Uzaktan çalışma türü / Remote work type
    /// </summary>
    public RemoteWorkType RemoteWorkType { get; private set; }

    /// <summary>
    /// Şehir / City
    /// </summary>
    public string? City { get; private set; }

    /// <summary>
    /// Ülke / Country
    /// </summary>
    public string? Country { get; private set; }

    #endregion

    #region İş Tanımı (Job Description)

    /// <summary>
    /// İş tanımı / Job description
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Gereksinimler / Requirements
    /// </summary>
    public string? Requirements { get; private set; }

    /// <summary>
    /// Sorumluluklar / Responsibilities
    /// </summary>
    public string? Responsibilities { get; private set; }

    /// <summary>
    /// Aranan nitelikler / Qualifications
    /// </summary>
    public string? Qualifications { get; private set; }

    /// <summary>
    /// Tercih edilen nitelikler / Preferred qualifications
    /// </summary>
    public string? PreferredQualifications { get; private set; }

    /// <summary>
    /// Yan haklar / Benefits
    /// </summary>
    public string? Benefits { get; private set; }

    #endregion

    #region Maaş Bilgileri (Salary Information)

    /// <summary>
    /// Minimum maaş / Minimum salary
    /// </summary>
    public decimal? SalaryMin { get; private set; }

    /// <summary>
    /// Maksimum maaş / Maximum salary
    /// </summary>
    public decimal? SalaryMax { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Maaş gösterilsin mi? / Show salary?
    /// </summary>
    public bool ShowSalary { get; private set; }

    /// <summary>
    /// Maaş periyodu / Salary period
    /// </summary>
    public SalaryPeriod SalaryPeriod { get; private set; }

    #endregion

    #region Tarihler (Dates)

    /// <summary>
    /// Yayın tarihi / Posted date
    /// </summary>
    public DateTime? PostedDate { get; private set; }

    /// <summary>
    /// Son başvuru tarihi / Application deadline
    /// </summary>
    public DateTime? ApplicationDeadline { get; private set; }

    /// <summary>
    /// Tahmini başlangıç tarihi / Expected start date
    /// </summary>
    public DateTime? ExpectedStartDate { get; private set; }

    /// <summary>
    /// Kapanış tarihi / Closed date
    /// </summary>
    public DateTime? ClosedDate { get; private set; }

    #endregion

    #region İstatistikler (Statistics)

    /// <summary>
    /// Toplam başvuru sayısı / Total applications
    /// </summary>
    public int TotalApplications { get; private set; }

    /// <summary>
    /// Görüntülenme sayısı / Views count
    /// </summary>
    public int ViewsCount { get; private set; }

    /// <summary>
    /// İşe alınan sayısı / Hired count
    /// </summary>
    public int HiredCount { get; private set; }

    #endregion

    #region Yayın Bilgileri (Publishing Information)

    /// <summary>
    /// İç ilan mı? / Internal posting?
    /// </summary>
    public bool IsInternal { get; private set; }

    /// <summary>
    /// Öne çıkan mı? / Is featured?
    /// </summary>
    public bool IsFeatured { get; private set; }

    /// <summary>
    /// Acil mi? / Is urgent?
    /// </summary>
    public bool IsUrgent { get; private set; }

    /// <summary>
    /// Yayınlayan kişi ID / Posted by user ID
    /// </summary>
    public int? PostedByUserId { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Anahtar kelimeler / Keywords
    /// </summary>
    public string? Keywords { get; private set; }

    /// <summary>
    /// Dahili notlar / Internal notes
    /// </summary>
    public string? InternalNotes { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Department Department { get; private set; } = null!;
    public virtual Position? Position { get; private set; }
    public virtual Employee? HiringManager { get; private set; }
    public virtual WorkLocation? WorkLocation { get; private set; }
    public virtual ICollection<JobApplication> Applications { get; private set; } = new List<JobApplication>();

    protected JobPosting() { }

    public JobPosting(
        string title,
        string postingCode,
        int departmentId,
        string description,
        JobEmploymentType employmentType = JobEmploymentType.FullTime,
        ExperienceLevel experienceLevel = ExperienceLevel.MidLevel)
    {
        Title = title;
        PostingCode = postingCode;
        DepartmentId = departmentId;
        Description = description;
        EmploymentType = employmentType;
        ExperienceLevel = experienceLevel;
        Status = JobPostingStatus.Draft;
        Currency = "TRY";
        SalaryPeriod = SalaryPeriod.Monthly;
        RemoteWorkType = RemoteWorkType.OnSite;
        NumberOfOpenings = 1;
    }

    public void Publish()
    {
        if (Status != JobPostingStatus.Draft && Status != JobPostingStatus.OnHold)
            throw new InvalidOperationException("Sadece taslak veya beklemede olan ilanlar yayınlanabilir.");

        Status = JobPostingStatus.Open;
        PostedDate = DateTime.UtcNow;
    }

    public void PutOnHold()
    {
        Status = JobPostingStatus.OnHold;
    }

    public void Close(string? reason = null)
    {
        Status = JobPostingStatus.Closed;
        ClosedDate = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(reason))
            InternalNotes = $"{InternalNotes}\nKapanış nedeni: {reason}".Trim();
    }

    public void Cancel()
    {
        Status = JobPostingStatus.Cancelled;
        ClosedDate = DateTime.UtcNow;
    }

    public void MarkAsFilled()
    {
        Status = JobPostingStatus.Filled;
        ClosedDate = DateTime.UtcNow;
    }

    public void IncrementViews()
    {
        ViewsCount++;
    }

    public void IncrementApplications()
    {
        TotalApplications++;
    }

    public void IncrementHired()
    {
        HiredCount++;
        if (HiredCount >= NumberOfOpenings)
            MarkAsFilled();
    }

    public void UpdateBasicInfo(string title, string description, int numberOfOpenings)
    {
        Title = title;
        Description = description;
        NumberOfOpenings = numberOfOpenings;
    }

    public void UpdateRequirements(string? requirements, string? responsibilities, string? qualifications, string? preferredQualifications)
    {
        Requirements = requirements;
        Responsibilities = responsibilities;
        Qualifications = qualifications;
        PreferredQualifications = preferredQualifications;
    }

    public void UpdateSalaryRange(decimal? min, decimal? max, string currency, bool showSalary, SalaryPeriod period)
    {
        SalaryMin = min;
        SalaryMax = max;
        Currency = currency;
        ShowSalary = showSalary;
        SalaryPeriod = period;
    }

    public void UpdateLocation(int? workLocationId, string? city, string? country, RemoteWorkType remoteWorkType)
    {
        WorkLocationId = workLocationId;
        City = city;
        Country = country;
        RemoteWorkType = remoteWorkType;
    }

    public void SetHiringManager(int? managerId) => HiringManagerId = managerId;
    public void SetPosition(int? positionId) => PositionId = positionId;
    public void SetDeadline(DateTime? deadline) => ApplicationDeadline = deadline;
    public void SetExpectedStartDate(DateTime? date) => ExpectedStartDate = date;
    public void SetBenefits(string? benefits) => Benefits = benefits;
    public void SetInternal(bool isInternal) => IsInternal = isInternal;
    public void SetFeatured(bool isFeatured) => IsFeatured = isFeatured;
    public void SetUrgent(bool isUrgent) => IsUrgent = isUrgent;
    public void SetTags(string? tags) => Tags = tags;
    public void SetKeywords(string? keywords) => Keywords = keywords;
    public void SetInternalNotes(string? notes) => InternalNotes = notes;

    public bool IsExpired() => ApplicationDeadline.HasValue && ApplicationDeadline.Value < DateTime.UtcNow;
}

#region Enums

public enum JobPostingStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>Açık / Open</summary>
    Open = 2,

    /// <summary>Beklemede / On hold</summary>
    OnHold = 3,

    /// <summary>Kapalı / Closed</summary>
    Closed = 4,

    /// <summary>Dolduruldu / Filled</summary>
    Filled = 5,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 6
}

public enum JobEmploymentType
{
    /// <summary>Tam zamanlı / Full-time</summary>
    FullTime = 1,

    /// <summary>Yarı zamanlı / Part-time</summary>
    PartTime = 2,

    /// <summary>Sözleşmeli / Contract</summary>
    Contract = 3,

    /// <summary>Stajyer / Intern</summary>
    Intern = 4,

    /// <summary>Geçici / Temporary</summary>
    Temporary = 5,

    /// <summary>Freelance</summary>
    Freelance = 6,

    /// <summary>Dönemsel / Seasonal</summary>
    Seasonal = 7
}

public enum ExperienceLevel
{
    /// <summary>Giriş seviyesi / Entry level</summary>
    EntryLevel = 1,

    /// <summary>Orta seviye / Mid level</summary>
    MidLevel = 2,

    /// <summary>Kıdemli / Senior</summary>
    Senior = 3,

    /// <summary>Yönetici / Manager</summary>
    Manager = 4,

    /// <summary>Direktör / Director</summary>
    Director = 5,

    /// <summary>Üst düzey yönetici / Executive</summary>
    Executive = 6
}

public enum RemoteWorkType
{
    /// <summary>Ofiste / On-site</summary>
    OnSite = 1,

    /// <summary>Uzaktan / Remote</summary>
    Remote = 2,

    /// <summary>Hibrit / Hybrid</summary>
    Hybrid = 3
}

public enum SalaryPeriod
{
    /// <summary>Saatlik / Hourly</summary>
    Hourly = 1,

    /// <summary>Günlük / Daily</summary>
    Daily = 2,

    /// <summary>Haftalık / Weekly</summary>
    Weekly = 3,

    /// <summary>Aylık / Monthly</summary>
    Monthly = 4,

    /// <summary>Yıllık / Yearly</summary>
    Yearly = 5
}

#endregion
