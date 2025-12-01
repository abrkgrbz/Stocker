namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Product type enumeration
/// </summary>
public enum ProductType
{
    /// <summary>
    /// Raw material - used in manufacturing
    /// </summary>
    Raw = 0,

    /// <summary>
    /// Semi-finished product - partially manufactured
    /// </summary>
    SemiFinished = 1,

    /// <summary>
    /// Finished product - ready for sale
    /// </summary>
    Finished = 2,

    /// <summary>
    /// Service - non-physical product
    /// </summary>
    Service = 3,

    /// <summary>
    /// Consumable - used in operations but not for sale
    /// </summary>
    Consumable = 4,

    /// <summary>
    /// Fixed asset - capital goods
    /// </summary>
    FixedAsset = 5
}
