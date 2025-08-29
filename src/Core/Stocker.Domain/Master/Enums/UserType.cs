namespace Stocker.Domain.Master.Enums;

public enum UserType
{
    SistemYoneticisi = 0,    // Tüm tenant'ları ve sistem ayarlarını yönetebilir
    FirmaSahibi = 1,         // Bir veya daha fazla tenant'ın sahibi
    Destek = 2,              // Sınırlı erişime sahip destek personeli
    Kullanici = 3,           // Normal kullanıcı
    FirmaYoneticisi = 4,     // Belirli bir tenant için yönetici
}