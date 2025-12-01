namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Status of a stock transfer between warehouses
/// </summary>
public enum TransferStatus
{
    /// <summary>
    /// Transfer is being prepared
    /// </summary>
    Draft = 1,

    /// <summary>
    /// Transfer is waiting for approval
    /// </summary>
    Pending = 2,

    /// <summary>
    /// Transfer has been approved
    /// </summary>
    Approved = 3,

    /// <summary>
    /// Transfer is rejected
    /// </summary>
    Rejected = 4,

    /// <summary>
    /// Goods are in transit between warehouses
    /// </summary>
    InTransit = 5,

    /// <summary>
    /// Goods have been received at destination
    /// </summary>
    Received = 6,

    /// <summary>
    /// Transfer is fully completed
    /// </summary>
    Completed = 7,

    /// <summary>
    /// Transfer was cancelled
    /// </summary>
    Cancelled = 8,

    /// <summary>
    /// Transfer is partially received (some items have discrepancies)
    /// </summary>
    PartiallyReceived = 9
}
