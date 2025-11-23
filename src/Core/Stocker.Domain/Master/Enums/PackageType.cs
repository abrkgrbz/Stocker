namespace Stocker.Domain.Master.Enums;

public enum PackageType
{
    Trial = -1,        // Free trial package
    Free = -1,         // Alias for Trial
    Baslangic = 0,
    Starter = 0,       // Alias for Baslangic
    Profesyonel = 1,
    Professional = 1,  // English alias
    Isletme = 2,
    Business = 2,      // English alias
    Kurumsal = 3,
    Enterprise = 3,    // English alias
    Ozel = 4,
    Custom = 4         // English alias
}