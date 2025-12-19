namespace Stocker.SignalR.Models.Pricing;

/// <summary>
/// Response for real-time price calculation
/// </summary>
public class PriceCalculationResponse
{
    /// <summary>
    /// Whether the calculation was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// The calculated price data (when successful)
    /// </summary>
    public object? Data { get; set; }

    /// <summary>
    /// Error message (when not successful)
    /// </summary>
    public string? Error { get; set; }
}
