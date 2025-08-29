namespace Stocker.Domain.Master.Enums;

public enum SubscriptionStatus
{
    Beklemede = -1,   // Ödeme bekleniyor
    Deneme = 0,
    Aktif = 1,
    OdemesiGecikti = 2,
    Askida = 3,
    IptalEdildi = 4,
    SuresiDoldu = 5
}