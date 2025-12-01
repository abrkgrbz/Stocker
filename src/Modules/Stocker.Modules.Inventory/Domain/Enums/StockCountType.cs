namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Type of stock count/inventory audit
/// </summary>
public enum StockCountType
{
    /// <summary>
    /// Full physical inventory count
    /// </summary>
    Full = 1,

    /// <summary>
    /// Periodic cycle count (subset of inventory)
    /// </summary>
    Cycle = 2,

    /// <summary>
    /// Random spot check
    /// </summary>
    Spot = 3,

    /// <summary>
    /// Annual year-end inventory
    /// </summary>
    Annual = 4,

    /// <summary>
    /// Category-specific count
    /// </summary>
    Category = 5,

    /// <summary>
    /// Location-specific count
    /// </summary>
    Location = 6,

    /// <summary>
    /// ABC classification based count (high-value items)
    /// </summary>
    ABC = 7,

    /// <summary>
    /// Perpetual inventory verification
    /// </summary>
    Perpetual = 8
}
