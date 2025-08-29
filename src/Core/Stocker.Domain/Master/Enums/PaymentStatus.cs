namespace Stocker.Domain.Master.Enums;

public enum PaymentStatus
{
    Beklemede = 0,
    Isleniyor = 1,
    Tamamlandi = 2,
    Basarisiz = 3,
    IadeEdildi = 4,
    KismiIade = 5,
    IptalEdildi = 6
}