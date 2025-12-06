namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// Maaş ödeme periyodu
/// </summary>
public enum PayrollPeriod
{
    /// <summary>
    /// Haftalık
    /// </summary>
    Weekly = 1,

    /// <summary>
    /// İki haftalık
    /// </summary>
    BiWeekly = 2,

    /// <summary>
    /// Aylık
    /// </summary>
    Monthly = 3,

    /// <summary>
    /// Üç aylık
    /// </summary>
    Quarterly = 4,

    /// <summary>
    /// Yıllık
    /// </summary>
    Annually = 5
}
