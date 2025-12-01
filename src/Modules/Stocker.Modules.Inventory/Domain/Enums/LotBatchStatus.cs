namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Status of a lot/batch tracked inventory
/// </summary>
public enum LotBatchStatus
{
    /// <summary>
    /// Lot is pending receipt/inspection
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Lot has been received but not yet inspected
    /// </summary>
    Received = 2,

    /// <summary>
    /// Lot has passed inspection and is approved for use
    /// </summary>
    Approved = 3,

    /// <summary>
    /// Lot is in quarantine pending investigation
    /// </summary>
    Quarantined = 4,

    /// <summary>
    /// Lot failed inspection and is rejected
    /// </summary>
    Rejected = 5,

    /// <summary>
    /// Lot is fully consumed/depleted
    /// </summary>
    Exhausted = 6,

    /// <summary>
    /// Lot has expired
    /// </summary>
    Expired = 7,

    /// <summary>
    /// Lot is being recalled
    /// </summary>
    Recalled = 8
}
