using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Çalışan yeteneği entity'si - Yetenek ve sertifika takibi
/// Employee Skill entity - Skill and certification tracking
/// </summary>
public class EmployeeSkill : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// Yetenek ID / Skill ID
    /// </summary>
    public int? SkillId { get; private set; }

    /// <summary>
    /// Yetenek adı / Skill name
    /// </summary>
    public string SkillName { get; private set; } = string.Empty;

    /// <summary>
    /// Yetenek kategorisi / Skill category
    /// </summary>
    public SkillCategory Category { get; private set; }

    /// <summary>
    /// Yetenek türü / Skill type
    /// </summary>
    public SkillType SkillType { get; private set; }

    #endregion

    #region Yeterlilik (Proficiency)

    /// <summary>
    /// Yeterlilik seviyesi / Proficiency level
    /// </summary>
    public ProficiencyLevel ProficiencyLevel { get; private set; }

    /// <summary>
    /// Deneyim yılı / Years of experience
    /// </summary>
    public decimal? YearsOfExperience { get; private set; }

    /// <summary>
    /// Kendi değerlendirmesi (1-10) / Self assessment
    /// </summary>
    public int? SelfAssessment { get; private set; }

    /// <summary>
    /// Yönetici değerlendirmesi (1-10) / Manager assessment
    /// </summary>
    public int? ManagerAssessment { get; private set; }

    /// <summary>
    /// Son değerlendirme tarihi / Last assessment date
    /// </summary>
    public DateTime? LastAssessmentDate { get; private set; }

    #endregion

    #region Doğrulama (Verification)

    /// <summary>
    /// Doğrulandı mı? / Is verified?
    /// </summary>
    public bool IsVerified { get; private set; }

    /// <summary>
    /// Doğrulama yöntemi / Verification method
    /// </summary>
    public SkillVerificationMethod? VerificationMethod { get; private set; }

    /// <summary>
    /// Doğrulama tarihi / Verification date
    /// </summary>
    public DateTime? VerificationDate { get; private set; }

    /// <summary>
    /// Doğrulayan ID / Verified by user ID
    /// </summary>
    public int? VerifiedByUserId { get; private set; }

    #endregion

    #region Sertifika Bilgileri (Certification Information)

    /// <summary>
    /// Sertifikalı mı? / Is certified?
    /// </summary>
    public bool IsCertified { get; private set; }

    /// <summary>
    /// Sertifika adı / Certification name
    /// </summary>
    public string? CertificationName { get; private set; }

    /// <summary>
    /// Sertifika veren kurum / Certifying authority
    /// </summary>
    public string? CertifyingAuthority { get; private set; }

    /// <summary>
    /// Sertifika numarası / Certification number
    /// </summary>
    public string? CertificationNumber { get; private set; }

    /// <summary>
    /// Sertifika tarihi / Certification date
    /// </summary>
    public DateTime? CertificationDate { get; private set; }

    /// <summary>
    /// Sertifika bitiş tarihi / Certification expiry date
    /// </summary>
    public DateTime? CertificationExpiryDate { get; private set; }

    /// <summary>
    /// Sertifika URL / Certification URL
    /// </summary>
    public string? CertificationUrl { get; private set; }

    #endregion

    #region Kullanım Bilgileri (Usage Information)

    /// <summary>
    /// Birincil yetenek mi? / Is primary skill?
    /// </summary>
    public bool IsPrimary { get; private set; }

    /// <summary>
    /// Aktif kullanımda mı? / Is actively used?
    /// </summary>
    public bool IsActivelyUsed { get; private set; }

    /// <summary>
    /// Son kullanım tarihi / Last used date
    /// </summary>
    public DateTime? LastUsedDate { get; private set; }

    /// <summary>
    /// Kullanım sıklığı / Usage frequency
    /// </summary>
    public UsageFrequency? UsageFrequency { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Öğrenme kaynağı / Learning source
    /// </summary>
    public string? LearningSource { get; private set; }

    /// <summary>
    /// İlgili projeler / Related projects
    /// </summary>
    public string? RelatedProjects { get; private set; }

    /// <summary>
    /// Mentorluk yapabilir mi? / Can mentor?
    /// </summary>
    public bool CanMentor { get; private set; }

    /// <summary>
    /// Eğitim verebilir mi? / Can train?
    /// </summary>
    public bool CanTrain { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Skill? Skill { get; private set; }

    protected EmployeeSkill() { }

    public EmployeeSkill(
        int employeeId,
        string skillName,
        SkillCategory category,
        ProficiencyLevel proficiencyLevel,
        SkillType skillType = SkillType.Technical)
    {
        EmployeeId = employeeId;
        SkillName = skillName;
        Category = category;
        ProficiencyLevel = proficiencyLevel;
        SkillType = skillType;
        IsActivelyUsed = true;
    }

    public void UpdateProficiency(ProficiencyLevel level, decimal? yearsOfExperience = null)
    {
        ProficiencyLevel = level;
        YearsOfExperience = yearsOfExperience;
    }

    public void SelfAssess(int score)
    {
        SelfAssessment = Math.Clamp(score, 1, 10);
        LastAssessmentDate = DateTime.UtcNow;
    }

    public void ManagerAssess(int score)
    {
        ManagerAssessment = Math.Clamp(score, 1, 10);
        LastAssessmentDate = DateTime.UtcNow;
    }

    public void Verify(SkillVerificationMethod method, int verifiedByUserId)
    {
        IsVerified = true;
        VerificationMethod = method;
        VerificationDate = DateTime.UtcNow;
        VerifiedByUserId = verifiedByUserId;
    }

    public void AddCertification(
        string certificationName,
        string? certifyingAuthority,
        string? certificationNumber,
        DateTime certificationDate,
        DateTime? expiryDate = null)
    {
        IsCertified = true;
        CertificationName = certificationName;
        CertifyingAuthority = certifyingAuthority;
        CertificationNumber = certificationNumber;
        CertificationDate = certificationDate;
        CertificationExpiryDate = expiryDate;
    }

    public void RenewCertification(DateTime newExpiryDate)
    {
        CertificationExpiryDate = newExpiryDate;
    }

    public void RecordUsage()
    {
        LastUsedDate = DateTime.UtcNow;
        IsActivelyUsed = true;
    }

    public void SetPrimary(bool isPrimary) => IsPrimary = isPrimary;
    public void SetActivelyUsed(bool isActive) => IsActivelyUsed = isActive;
    public void SetUsageFrequency(UsageFrequency frequency) => UsageFrequency = frequency;
    public void SetSkillId(int? skillId) => SkillId = skillId;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetLearningSource(string? source) => LearningSource = source;
    public void SetRelatedProjects(string? projects) => RelatedProjects = projects;
    public void SetCanMentor(bool canMentor) => CanMentor = canMentor;
    public void SetCanTrain(bool canTrain) => CanTrain = canTrain;
    public void SetCertificationUrl(string? url) => CertificationUrl = url;

    public bool IsCertificationExpired() => CertificationExpiryDate.HasValue && CertificationExpiryDate.Value < DateTime.UtcNow;
    public bool IsCertificationExpiringSoon(int daysThreshold = 30) =>
        CertificationExpiryDate.HasValue &&
        CertificationExpiryDate.Value <= DateTime.UtcNow.AddDays(daysThreshold);
}

/// <summary>
/// Yetenek entity'si / Skill entity
/// </summary>
public class Skill : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public SkillCategory Category { get; private set; }
    public SkillType SkillType { get; private set; }
    public bool IsActive { get; private set; }
    public string? ParentSkillName { get; private set; }
    public int? ParentSkillId { get; private set; }

    public virtual Skill? ParentSkill { get; private set; }
    public virtual ICollection<Skill> ChildSkills { get; private set; } = new List<Skill>();
    public virtual ICollection<EmployeeSkill> EmployeeSkills { get; private set; } = new List<EmployeeSkill>();

    protected Skill() { }

    public Skill(string name, SkillCategory category, SkillType skillType = SkillType.Technical)
    {
        Name = name;
        Category = category;
        SkillType = skillType;
        IsActive = true;
    }

    public void SetDescription(string? description) => Description = description;
    public void SetParent(int? parentId) => ParentSkillId = parentId;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

#region Enums

public enum SkillCategory
{
    /// <summary>Programlama / Programming</summary>
    Programming = 1,

    /// <summary>Veritabanı / Database</summary>
    Database = 2,

    /// <summary>DevOps</summary>
    DevOps = 3,

    /// <summary>Cloud</summary>
    Cloud = 4,

    /// <summary>Proje yönetimi / Project management</summary>
    ProjectManagement = 5,

    /// <summary>İletişim / Communication</summary>
    Communication = 6,

    /// <summary>Liderlik / Leadership</summary>
    Leadership = 7,

    /// <summary>Analitik / Analytics</summary>
    Analytics = 8,

    /// <summary>Tasarım / Design</summary>
    Design = 9,

    /// <summary>Pazarlama / Marketing</summary>
    Marketing = 10,

    /// <summary>Finans / Finance</summary>
    Finance = 11,

    /// <summary>Satış / Sales</summary>
    Sales = 12,

    /// <summary>Dil / Language</summary>
    Language = 13,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum SkillType
{
    /// <summary>Teknik / Technical</summary>
    Technical = 1,

    /// <summary>Soft skill</summary>
    Soft = 2,

    /// <summary>Domain bilgisi / Domain knowledge</summary>
    Domain = 3,

    /// <summary>Araç / Tool</summary>
    Tool = 4,

    /// <summary>Metodoloji / Methodology</summary>
    Methodology = 5
}

public enum ProficiencyLevel
{
    /// <summary>Başlangıç / Beginner</summary>
    Beginner = 1,

    /// <summary>Temel / Basic</summary>
    Basic = 2,

    /// <summary>Orta / Intermediate</summary>
    Intermediate = 3,

    /// <summary>İleri / Advanced</summary>
    Advanced = 4,

    /// <summary>Uzman / Expert</summary>
    Expert = 5
}

public enum SkillVerificationMethod
{
    /// <summary>Test / Test</summary>
    Test = 1,

    /// <summary>Mülakat / Interview</summary>
    Interview = 2,

    /// <summary>Proje incelemesi / Project review</summary>
    ProjectReview = 3,

    /// <summary>Sertifika / Certification</summary>
    Certification = 4,

    /// <summary>Referans / Reference</summary>
    Reference = 5,

    /// <summary>Yönetici onayı / Manager approval</summary>
    ManagerApproval = 6
}

public enum UsageFrequency
{
    /// <summary>Günlük / Daily</summary>
    Daily = 1,

    /// <summary>Haftalık / Weekly</summary>
    Weekly = 2,

    /// <summary>Aylık / Monthly</summary>
    Monthly = 3,

    /// <summary>Nadiren / Rarely</summary>
    Rarely = 4,

    /// <summary>Hiç / Never</summary>
    Never = 5
}

#endregion
