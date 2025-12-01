namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Status of a serial number tracked item
/// </summary>
public enum SerialNumberStatus
{
    /// <summary>
    /// Serial number is registered but not yet received
    /// </summary>
    Available = 1,

    /// <summary>
    /// Item is in stock and available for sale
    /// </summary>
    InStock = 2,

    /// <summary>
    /// Item is reserved for a specific order
    /// </summary>
    Reserved = 3,

    /// <summary>
    /// Item has been sold
    /// </summary>
    Sold = 4,

    /// <summary>
    /// Item has been returned by customer
    /// </summary>
    Returned = 5,

    /// <summary>
    /// Item is marked as defective
    /// </summary>
    Defective = 6,

    /// <summary>
    /// Item is being repaired
    /// </summary>
    InRepair = 7,

    /// <summary>
    /// Item has been scrapped/disposed
    /// </summary>
    Scrapped = 8,

    /// <summary>
    /// Item is lost or unaccounted for
    /// </summary>
    Lost = 9,

    /// <summary>
    /// Item is on loan/demo
    /// </summary>
    OnLoan = 10,

    /// <summary>
    /// Item is in transit
    /// </summary>
    InTransit = 11
}
