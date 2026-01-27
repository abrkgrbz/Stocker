namespace Stocker.Domain.Master.Enums;

/// <summary>
/// Status of a report execution
/// </summary>
public enum ReportExecutionStatus
{
    /// <summary>
    /// Report execution is pending/queued
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Report is currently running
    /// </summary>
    Running = 1,

    /// <summary>
    /// Report completed successfully
    /// </summary>
    Completed = 2,

    /// <summary>
    /// Report execution failed
    /// </summary>
    Failed = 3,

    /// <summary>
    /// Report execution was cancelled
    /// </summary>
    Cancelled = 4
}
