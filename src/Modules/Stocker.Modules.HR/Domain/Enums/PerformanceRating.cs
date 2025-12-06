namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// Performans değerlendirmesi
/// </summary>
public enum PerformanceRating
{
    /// <summary>
    /// Yetersiz
    /// </summary>
    Unsatisfactory = 1,

    /// <summary>
    /// Geliştirilmesi gerekli
    /// </summary>
    NeedsImprovement = 2,

    /// <summary>
    /// Beklentileri karşılıyor
    /// </summary>
    MeetsExpectations = 3,

    /// <summary>
    /// Beklentilerin üstünde
    /// </summary>
    ExceedsExpectations = 4,

    /// <summary>
    /// Olağanüstü
    /// </summary>
    Outstanding = 5
}
