namespace Stocker.SignalR.Models.Validation;

/// <summary>
/// Tenant code availability validation result
/// </summary>
public class TenantCodeValidationResult
{
    /// <summary>
    /// Whether the tenant code is available
    /// </summary>
    public bool IsAvailable { get; set; }

    /// <summary>
    /// Validation message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// The validated code
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Alternative code suggestions if not available
    /// </summary>
    public string[] SuggestedCodes { get; set; } = Array.Empty<string>();
}
