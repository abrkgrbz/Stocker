namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Status of a workflow execution instance
/// </summary>
public enum WorkflowExecutionStatus
{
    /// <summary>
    /// Execution is pending/queued
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Currently executing
    /// </summary>
    Running = 1,

    /// <summary>
    /// Completed successfully
    /// </summary>
    Completed = 2,

    /// <summary>
    /// Failed with error
    /// </summary>
    Failed = 3,

    /// <summary>
    /// Cancelled by user
    /// </summary>
    Cancelled = 4,

    /// <summary>
    /// Waiting for condition or delay
    /// </summary>
    Waiting = 5,

    /// <summary>
    /// Timed out
    /// </summary>
    TimedOut = 6
}
