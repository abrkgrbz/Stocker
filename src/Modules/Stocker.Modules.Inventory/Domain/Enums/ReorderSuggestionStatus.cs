namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Reorder suggestion status
/// </summary>
public enum ReorderSuggestionStatus
{
    /// <summary>Suggestion is pending review</summary>
    Pending,
    /// <summary>Suggestion has been approved</summary>
    Approved,
    /// <summary>Suggestion has been rejected</summary>
    Rejected,
    /// <summary>Purchase order has been created</summary>
    Ordered,
    /// <summary>Suggestion has expired without action</summary>
    Expired
}
