namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Type of stock transfer
/// </summary>
public enum TransferType
{
    /// <summary>
    /// Standard transfer between warehouses
    /// </summary>
    Standard = 1,

    /// <summary>
    /// Urgent/priority transfer
    /// </summary>
    Urgent = 2,

    /// <summary>
    /// Transfer for replenishment purposes
    /// </summary>
    Replenishment = 3,

    /// <summary>
    /// Return to supplier warehouse
    /// </summary>
    Return = 4,

    /// <summary>
    /// Transfer within the same warehouse (location to location)
    /// </summary>
    Internal = 5,

    /// <summary>
    /// Cross-docking transfer (direct transfer without storage)
    /// </summary>
    CrossDock = 6,

    /// <summary>
    /// Transfer to consolidation center
    /// </summary>
    Consolidation = 7
}
