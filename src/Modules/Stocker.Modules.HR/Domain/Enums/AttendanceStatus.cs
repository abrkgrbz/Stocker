namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// Devam durumu
/// </summary>
public enum AttendanceStatus
{
    /// <summary>
    /// Mevcut
    /// </summary>
    Present = 1,

    /// <summary>
    /// Devamsız
    /// </summary>
    Absent = 2,

    /// <summary>
    /// Geç kaldı
    /// </summary>
    Late = 3,

    /// <summary>
    /// Erken ayrıldı
    /// </summary>
    EarlyDeparture = 4,

    /// <summary>
    /// İzinli
    /// </summary>
    OnLeave = 5,

    /// <summary>
    /// Resmi tatil
    /// </summary>
    Holiday = 6,

    /// <summary>
    /// Hafta sonu
    /// </summary>
    Weekend = 7,

    /// <summary>
    /// Uzaktan çalışma
    /// </summary>
    RemoteWork = 8,

    /// <summary>
    /// Yarım gün
    /// </summary>
    HalfDay = 9,

    /// <summary>
    /// Mesai
    /// </summary>
    Overtime = 10,

    /// <summary>
    /// Eğitim
    /// </summary>
    Training = 11,

    /// <summary>
    /// Saha görevi
    /// </summary>
    FieldWork = 12
}
