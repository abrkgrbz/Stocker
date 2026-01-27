namespace Stocker.Domain.Master.Enums;

/// <summary>
/// Frequency options for scheduled reports
/// </summary>
public enum ReportFrequency
{
    /// <summary>
    /// Report runs once (on-demand)
    /// </summary>
    Once = 0,

    /// <summary>
    /// Report runs daily
    /// </summary>
    Daily = 1,

    /// <summary>
    /// Report runs weekly
    /// </summary>
    Weekly = 2,

    /// <summary>
    /// Report runs monthly
    /// </summary>
    Monthly = 3,

    /// <summary>
    /// Report runs quarterly
    /// </summary>
    Quarterly = 4,

    /// <summary>
    /// Report runs yearly
    /// </summary>
    Yearly = 5,

    /// <summary>
    /// Custom cron schedule
    /// </summary>
    Custom = 99
}
