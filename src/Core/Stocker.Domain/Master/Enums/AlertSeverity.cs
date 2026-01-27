namespace Stocker.Domain.Master.Enums;

/// <summary>
/// Severity levels for system alerts
/// </summary>
public enum AlertSeverity
{
    /// <summary>
    /// Informational alert - no action required
    /// </summary>
    Info = 0,

    /// <summary>
    /// Warning alert - attention may be needed
    /// </summary>
    Warning = 1,

    /// <summary>
    /// Error alert - action required
    /// </summary>
    Error = 2,

    /// <summary>
    /// Critical alert - immediate action required
    /// </summary>
    Critical = 3
}
