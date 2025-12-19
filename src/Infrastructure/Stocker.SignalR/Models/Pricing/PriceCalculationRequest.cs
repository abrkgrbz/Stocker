namespace Stocker.SignalR.Models.Pricing;

/// <summary>
/// Request for real-time price calculation
/// </summary>
public class PriceCalculationRequest
{
    /// <summary>
    /// List of selected module codes
    /// </summary>
    public List<string> SelectedModuleCodes { get; set; } = new();

    /// <summary>
    /// Number of users for the subscription
    /// </summary>
    public int UserCount { get; set; } = 1;

    /// <summary>
    /// Selected storage plan code
    /// </summary>
    public string? StoragePlanCode { get; set; }

    /// <summary>
    /// List of selected add-on codes
    /// </summary>
    public List<string>? SelectedAddOnCodes { get; set; }
}
