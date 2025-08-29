namespace Stocker.Domain.Master.Enums;

public enum UserType
{
    SistemYoneticisi = 0,    // Tüm sistemin yöneticisi (platform sahibi)
    FirmaYoneticisi = 1,     // Tenant sahibi ve yöneticisi (müşteriler)
    Personel = 2,            // Firma çalışanı (müşterilerin çalışanları)
    Destek = 3,              // Destek personeli (platform destek ekibi)
    Misafir = 4,             // Sınırlı erişimli kullanıcı
}