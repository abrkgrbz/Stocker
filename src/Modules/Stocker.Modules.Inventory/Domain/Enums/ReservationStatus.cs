namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Status of a stock reservation
/// </summary>
public enum ReservationStatus
{
    /// <summary>
    /// Reservation is active and blocking stock
    /// </summary>
    Active = 1,

    /// <summary>
    /// Part of the reserved quantity has been fulfilled
    /// </summary>
    PartiallyFulfilled = 2,

    /// <summary>
    /// Entire reserved quantity has been fulfilled
    /// </summary>
    Fulfilled = 3,

    /// <summary>
    /// Reservation was cancelled before fulfillment
    /// </summary>
    Cancelled = 4,

    /// <summary>
    /// Reservation expired without being fulfilled
    /// </summary>
    Expired = 5
}
