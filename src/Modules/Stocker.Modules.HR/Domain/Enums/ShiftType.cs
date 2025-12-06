namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// Vardiya türü
/// </summary>
public enum ShiftType
{
    /// <summary>
    /// Sabah vardiyası
    /// </summary>
    Morning = 1,

    /// <summary>
    /// Öğle vardiyası
    /// </summary>
    Afternoon = 2,

    /// <summary>
    /// Akşam vardiyası
    /// </summary>
    Evening = 3,

    /// <summary>
    /// Gece vardiyası
    /// </summary>
    Night = 4,

    /// <summary>
    /// Tam gün
    /// </summary>
    FullDay = 5,

    /// <summary>
    /// Esnek çalışma
    /// </summary>
    Flexible = 6,

    /// <summary>
    /// Rotasyonlu
    /// </summary>
    Rotating = 7,

    /// <summary>
    /// Nöbet
    /// </summary>
    OnCall = 8
}
