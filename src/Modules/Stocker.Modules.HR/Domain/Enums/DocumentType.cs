namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// Belge türü
/// </summary>
public enum DocumentType
{
    /// <summary>
    /// Kimlik fotokopisi
    /// </summary>
    IdentityCard = 1,

    /// <summary>
    /// Pasaport
    /// </summary>
    Passport = 2,

    /// <summary>
    /// Ehliyet
    /// </summary>
    DrivingLicense = 3,

    /// <summary>
    /// Diploma
    /// </summary>
    Diploma = 4,

    /// <summary>
    /// Sertifika
    /// </summary>
    Certificate = 5,

    /// <summary>
    /// CV / Özgeçmiş
    /// </summary>
    Resume = 6,

    /// <summary>
    /// İş sözleşmesi
    /// </summary>
    EmploymentContract = 7,

    /// <summary>
    /// Sağlık raporu
    /// </summary>
    MedicalReport = 8,

    /// <summary>
    /// Sabıka kaydı
    /// </summary>
    CriminalRecord = 9,

    /// <summary>
    /// İkametgah belgesi
    /// </summary>
    AddressProof = 10,

    /// <summary>
    /// Referans mektubu
    /// </summary>
    ReferenceLetter = 11,

    /// <summary>
    /// SGK belgesi
    /// </summary>
    SocialSecurityDocument = 12,

    /// <summary>
    /// Banka bilgi formu
    /// </summary>
    BankInformation = 13,

    /// <summary>
    /// Nüfus kayıt örneği
    /// </summary>
    FamilyRegister = 14,

    /// <summary>
    /// Askerlik belgesi
    /// </summary>
    MilitaryDocument = 15,

    /// <summary>
    /// Fotoğraf
    /// </summary>
    Photo = 16,

    /// <summary>
    /// Diğer
    /// </summary>
    Other = 99
}
