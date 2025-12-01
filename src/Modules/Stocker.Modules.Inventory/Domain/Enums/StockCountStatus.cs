namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Status of a stock count operation
/// </summary>
public enum StockCountStatus
{
    /// <summary>
    /// Count is being prepared
    /// </summary>
    Draft = 1,

    /// <summary>
    /// Count is in progress
    /// </summary>
    InProgress = 2,

    /// <summary>
    /// Count is completed but not yet reviewed
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Count has been approved
    /// </summary>
    Approved = 4,

    /// <summary>
    /// Count was rejected (requires recount)
    /// </summary>
    Rejected = 5,

    /// <summary>
    /// Stock adjustments have been made based on count
    /// </summary>
    Adjusted = 6,

    /// <summary>
    /// Count was cancelled
    /// </summary>
    Cancelled = 7
}
