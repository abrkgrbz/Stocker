namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Type of stock reservation
/// </summary>
public enum ReservationType
{
    /// <summary>
    /// Reserved for a sales order
    /// </summary>
    SalesOrder = 1,

    /// <summary>
    /// Reserved for a transfer order
    /// </summary>
    Transfer = 2,

    /// <summary>
    /// Reserved for production/manufacturing
    /// </summary>
    Production = 3,

    /// <summary>
    /// Reserved for a project
    /// </summary>
    Project = 4,

    /// <summary>
    /// Manual reservation (user-initiated)
    /// </summary>
    Manual = 5,

    /// <summary>
    /// Reserved for assembly/kit building
    /// </summary>
    Assembly = 6,

    /// <summary>
    /// Reserved for service/repair orders
    /// </summary>
    Service = 7
}
