namespace Stocker.SignalR.Models.Validation;

/// <summary>
/// Domain availability check result
/// </summary>
public class DomainCheckResult
{
    /// <summary>
    /// Whether the domain is available
    /// </summary>
    public bool IsAvailable { get; set; }

    /// <summary>
    /// Result message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Alternative domain suggestions
    /// </summary>
    public string[] Suggestions { get; set; } = Array.Empty<string>();
}
