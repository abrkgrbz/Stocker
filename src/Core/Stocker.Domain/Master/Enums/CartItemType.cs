namespace Stocker.Domain.Master.Enums;

/// <summary>
/// Type of item in a subscription cart
/// </summary>
public enum CartItemType
{
    /// <summary>
    /// Individual module (e.g., Inventory, Sales, CRM)
    /// </summary>
    Module = 0,

    /// <summary>
    /// Bundle of modules (discounted package)
    /// </summary>
    Bundle = 1,

    /// <summary>
    /// Add-on feature or service
    /// </summary>
    AddOn = 2,

    /// <summary>
    /// Storage plan
    /// </summary>
    StoragePlan = 3,

    /// <summary>
    /// Additional users
    /// </summary>
    Users = 4
}
