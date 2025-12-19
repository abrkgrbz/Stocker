namespace Stocker.SignalR.Models.Validation;

/// <summary>
/// Generic validation result
/// </summary>
public class ValidationResult
{
    /// <summary>
    /// Whether the validation passed
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// Validation message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Additional validation details
    /// </summary>
    public Dictionary<string, string> Details { get; set; } = new();
}
