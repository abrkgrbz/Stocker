namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// Eğitim durumu
/// </summary>
public enum TrainingStatus
{
    /// <summary>
    /// Planlandı
    /// </summary>
    Scheduled = 1,

    /// <summary>
    /// Devam ediyor
    /// </summary>
    InProgress = 2,

    /// <summary>
    /// Tamamlandı
    /// </summary>
    Completed = 3,

    /// <summary>
    /// İptal edildi
    /// </summary>
    Cancelled = 4,

    /// <summary>
    /// Ertelendi
    /// </summary>
    Postponed = 5
}
