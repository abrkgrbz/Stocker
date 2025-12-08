namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Auto-reorder rule status
/// </summary>
public enum ReorderRuleStatus
{
    /// <summary>Rule is active and will trigger when conditions are met</summary>
    Active,
    /// <summary>Rule is temporarily paused and will not trigger</summary>
    Paused,
    /// <summary>Rule is disabled and will not trigger</summary>
    Disabled
}
