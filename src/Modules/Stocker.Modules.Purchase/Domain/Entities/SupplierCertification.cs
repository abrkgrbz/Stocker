using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Tedarikçi sertifikası entity'si - Tedarikçi kalite ve uyumluluk sertifikaları
/// Supplier Certification entity - Supplier quality and compliance certifications
/// </summary>
public class SupplierCertification : TenantAggregateRoot
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Tedarikçi ID / Supplier ID
    /// </summary>
    public Guid SupplierId { get; private set; }

    /// <summary>
    /// Sertifika tipi / Certification type
    /// </summary>
    public SupplierCertificationType CertificationType { get; private set; }

    /// <summary>
    /// Sertifika adı / Certification name
    /// </summary>
    public string CertificationName { get; private set; } = string.Empty;

    /// <summary>
    /// Sertifika numarası / Certification number
    /// </summary>
    public string? CertificationNumber { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public SupplierCertificationStatus Status { get; private set; }

    #endregion

    #region Veren Kurum (Issuing Authority)

    /// <summary>
    /// Veren kurum / Issuing authority
    /// </summary>
    public string? IssuingAuthority { get; private set; }

    /// <summary>
    /// Veren kurum ülkesi / Issuing country
    /// </summary>
    public string? IssuingCountry { get; private set; }

    /// <summary>
    /// Akreditasyon kurumu / Accreditation body
    /// </summary>
    public string? AccreditationBody { get; private set; }

    #endregion

    #region Tarih Bilgileri (Date Information)

    /// <summary>
    /// Düzenleme tarihi / Issue date
    /// </summary>
    public DateTime IssueDate { get; private set; }

    /// <summary>
    /// Geçerlilik başlangıç tarihi / Valid from date
    /// </summary>
    public DateTime ValidFromDate { get; private set; }

    /// <summary>
    /// Geçerlilik bitiş tarihi / Expiry date
    /// </summary>
    public DateTime? ExpiryDate { get; private set; }

    /// <summary>
    /// Son yenileme tarihi / Last renewal date
    /// </summary>
    public DateTime? LastRenewalDate { get; private set; }

    /// <summary>
    /// Sonraki denetim tarihi / Next audit date
    /// </summary>
    public DateTime? NextAuditDate { get; private set; }

    #endregion

    #region Kapsam Bilgileri (Scope Information)

    /// <summary>
    /// Sertifika kapsamı / Certification scope
    /// </summary>
    public string? Scope { get; private set; }

    /// <summary>
    /// Kapsanan ürünler/hizmetler / Covered products/services
    /// </summary>
    public string? CoveredProducts { get; private set; }

    /// <summary>
    /// Kapsanan lokasyonlar / Covered locations
    /// </summary>
    public string? CoveredLocations { get; private set; }

    /// <summary>
    /// Standart versiyonu / Standard version
    /// </summary>
    public string? StandardVersion { get; private set; }

    #endregion

    #region Doğrulama Bilgileri (Verification Information)

    /// <summary>
    /// Doğrulandı mı? / Is verified?
    /// </summary>
    public bool IsVerified { get; private set; }

    /// <summary>
    /// Doğrulama tarihi / Verification date
    /// </summary>
    public DateTime? VerificationDate { get; private set; }

    /// <summary>
    /// Doğrulayan ID / Verified by ID
    /// </summary>
    public Guid? VerifiedById { get; private set; }

    /// <summary>
    /// Doğrulama yöntemi / Verification method
    /// </summary>
    public CertificationVerificationMethod? VerificationMethod { get; private set; }

    /// <summary>
    /// Doğrulama notları / Verification notes
    /// </summary>
    public string? VerificationNotes { get; private set; }

    #endregion

    #region Belge Bilgileri (Document Information)

    /// <summary>
    /// Belge URL / Document URL
    /// </summary>
    public string? DocumentUrl { get; private set; }

    /// <summary>
    /// Belge dosya adı / Document file name
    /// </summary>
    public string? DocumentFileName { get; private set; }

    /// <summary>
    /// Belge boyutu / Document size
    /// </summary>
    public long? DocumentSize { get; private set; }

    /// <summary>
    /// Belge yükleme tarihi / Document upload date
    /// </summary>
    public DateTime? DocumentUploadDate { get; private set; }

    #endregion

    #region Risk ve Önem (Risk and Importance)

    /// <summary>
    /// Kritik sertifika mı? / Is critical certification?
    /// </summary>
    public bool IsCritical { get; private set; }

    /// <summary>
    /// Zorunlu mu? / Is mandatory?
    /// </summary>
    public bool IsMandatory { get; private set; }

    /// <summary>
    /// Süresi dolan için gün uyarısı / Days warning before expiry
    /// </summary>
    public int? ExpiryWarningDays { get; private set; }

    /// <summary>
    /// Süre doldu mu? / Is expired?
    /// </summary>
    public bool IsExpired => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;

    /// <summary>
    /// Süre dolmak üzere mi? / Is expiring soon?
    /// </summary>
    public bool IsExpiringSoon => ExpiryDate.HasValue &&
        ExpiryDate.Value > DateTime.UtcNow &&
        ExpiryDate.Value < DateTime.UtcNow.AddDays(ExpiryWarningDays ?? 30);

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Oluşturma tarihi / Creation date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Güncelleme tarihi / Update date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Supplier Supplier { get; private set; } = null!;

    protected SupplierCertification() : base() { }

    public static SupplierCertification Create(
        Guid supplierId,
        SupplierCertificationType certificationType,
        string certificationName,
        DateTime issueDate,
        DateTime validFromDate,
        Guid tenantId,
        DateTime? expiryDate = null)
    {
        var cert = new SupplierCertification();
        cert.Id = Guid.NewGuid();
        cert.SetTenantId(tenantId);
        cert.SupplierId = supplierId;
        cert.CertificationType = certificationType;
        cert.CertificationName = certificationName;
        cert.IssueDate = issueDate;
        cert.ValidFromDate = validFromDate;
        cert.ExpiryDate = expiryDate;
        cert.Status = SupplierCertificationStatus.Active;
        cert.ExpiryWarningDays = 30;
        cert.CreatedAt = DateTime.UtcNow;
        return cert;
    }

    public void Update(
        string certificationName,
        string? certificationNumber,
        DateTime issueDate,
        DateTime validFromDate,
        DateTime? expiryDate)
    {
        CertificationName = certificationName;
        CertificationNumber = certificationNumber;
        IssueDate = issueDate;
        ValidFromDate = validFromDate;
        ExpiryDate = expiryDate;
        UpdatedAt = DateTime.UtcNow;
        UpdateStatus();
    }

    public void SetIssuingAuthority(string? authority, string? country, string? accreditationBody)
    {
        IssuingAuthority = authority;
        IssuingCountry = country;
        AccreditationBody = accreditationBody;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetScope(string? scope, string? products, string? locations, string? version)
    {
        Scope = scope;
        CoveredProducts = products;
        CoveredLocations = locations;
        StandardVersion = version;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Verify(Guid verifiedById, CertificationVerificationMethod method, string? notes)
    {
        IsVerified = true;
        VerificationDate = DateTime.UtcNow;
        VerifiedById = verifiedById;
        VerificationMethod = method;
        VerificationNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UploadDocument(string url, string? fileName, long? size)
    {
        DocumentUrl = url;
        DocumentFileName = fileName;
        DocumentSize = size;
        DocumentUploadDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Renew(DateTime newExpiryDate, string? certificationNumber = null)
    {
        LastRenewalDate = DateTime.UtcNow;
        ExpiryDate = newExpiryDate;
        if (!string.IsNullOrEmpty(certificationNumber))
            CertificationNumber = certificationNumber;
        Status = SupplierCertificationStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Suspend(string reason)
    {
        Status = SupplierCertificationStatus.Suspended;
        Notes = $"Askıya alındı: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void Revoke(string reason)
    {
        Status = SupplierCertificationStatus.Revoked;
        Notes = $"İptal edildi: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    private void UpdateStatus()
    {
        if (Status == SupplierCertificationStatus.Revoked || Status == SupplierCertificationStatus.Suspended)
            return;

        if (IsExpired)
            Status = SupplierCertificationStatus.Expired;
        else if (IsExpiringSoon)
            Status = SupplierCertificationStatus.ExpiringSoon;
        else
            Status = SupplierCertificationStatus.Active;
    }

    public void SetCritical(bool isCritical, bool isMandatory)
    {
        IsCritical = isCritical;
        IsMandatory = isMandatory;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetExpiryWarningDays(int? days) => ExpiryWarningDays = days;
    public void SetNextAuditDate(DateTime? date) => NextAuditDate = date;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;
}

#region Enums

public enum SupplierCertificationType
{
    /// <summary>ISO 9001 - Kalite yönetimi / Quality management</summary>
    ISO9001 = 1,

    /// <summary>ISO 14001 - Çevre yönetimi / Environmental management</summary>
    ISO14001 = 2,

    /// <summary>ISO 45001 - İş sağlığı ve güvenliği / Occupational health & safety</summary>
    ISO45001 = 3,

    /// <summary>ISO 27001 - Bilgi güvenliği / Information security</summary>
    ISO27001 = 4,

    /// <summary>ISO 22000 - Gıda güvenliği / Food safety</summary>
    ISO22000 = 5,

    /// <summary>IATF 16949 - Otomotiv kalite / Automotive quality</summary>
    IATF16949 = 6,

    /// <summary>AS9100 - Havacılık kalite / Aerospace quality</summary>
    AS9100 = 7,

    /// <summary>CE işareti / CE marking</summary>
    CEMarking = 8,

    /// <summary>FDA onayı / FDA approval</summary>
    FDAApproval = 9,

    /// <summary>HALAL sertifikası / Halal certification</summary>
    Halal = 10,

    /// <summary>KOSHER sertifikası / Kosher certification</summary>
    Kosher = 11,

    /// <summary>Organik sertifika / Organic certification</summary>
    Organic = 12,

    /// <summary>Fair Trade / Fair Trade</summary>
    FairTrade = 13,

    /// <summary>FSC - Orman yönetimi / Forest management</summary>
    FSC = 14,

    /// <summary>REACH uyumu / REACH compliance</summary>
    REACH = 15,

    /// <summary>RoHS uyumu / RoHS compliance</summary>
    RoHS = 16,

    /// <summary>TSE belgesi / TSE certificate</summary>
    TSE = 17,

    /// <summary>Ticaret sicil / Trade registry</summary>
    TradeRegistry = 18,

    /// <summary>Vergi levhası / Tax certificate</summary>
    TaxCertificate = 19,

    /// <summary>SGK borcu yoktur / Social security clearance</summary>
    SocialSecurityClearance = 20,

    /// <summary>İş deneyim belgesi / Work experience certificate</summary>
    WorkExperience = 21,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum SupplierCertificationStatus
{
    /// <summary>Aktif / Active</summary>
    Active = 1,

    /// <summary>Süresi dolmak üzere / Expiring soon</summary>
    ExpiringSoon = 2,

    /// <summary>Süresi dolmuş / Expired</summary>
    Expired = 3,

    /// <summary>Askıda / Suspended</summary>
    Suspended = 4,

    /// <summary>İptal edilmiş / Revoked</summary>
    Revoked = 5,

    /// <summary>Doğrulama bekliyor / Pending verification</summary>
    PendingVerification = 6
}

public enum CertificationVerificationMethod
{
    /// <summary>Online doğrulama / Online verification</summary>
    OnlineVerification = 1,

    /// <summary>Telefon doğrulama / Phone verification</summary>
    PhoneVerification = 2,

    /// <summary>Belge inceleme / Document review</summary>
    DocumentReview = 3,

    /// <summary>Yerinde denetim / On-site audit</summary>
    OnSiteAudit = 4,

    /// <summary>Üçüncü taraf doğrulama / Third party verification</summary>
    ThirdPartyVerification = 5,

    /// <summary>Tedarikçi beyanı / Supplier declaration</summary>
    SupplierDeclaration = 6
}

#endregion
