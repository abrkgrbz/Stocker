namespace Stocker.SignalR.Models.Validation;

/// <summary>
/// Turkish ID Number (TC Kimlik No) or Tax Number (Vergi No) validation result
/// </summary>
public class IdentityValidationResult
{
    /// <summary>
    /// Whether the identity number is valid
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// Validation message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Type of number (e.g., "TC Kimlik No", "Vergi No")
    /// </summary>
    public string NumberType { get; set; } = string.Empty;

    /// <summary>
    /// Additional validation details
    /// </summary>
    public Dictionary<string, string> Details { get; set; } = new();
}
