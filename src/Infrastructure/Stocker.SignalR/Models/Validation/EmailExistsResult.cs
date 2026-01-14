namespace Stocker.SignalR.Models.Validation;

/// <summary>
/// Email existence check result for SignalR
/// </summary>
public class EmailExistsResult
{
    /// <summary>
    /// Whether the email exists in the system
    /// </summary>
    public bool Exists { get; set; }

    /// <summary>
    /// Message describing the result
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Whether the email belongs to a registered user
    /// </summary>
    public bool IsRegisteredUser { get; set; }

    /// <summary>
    /// Whether the email belongs to a tenant admin
    /// </summary>
    public bool IsTenantAdmin { get; set; }

    /// <summary>
    /// Additional details about the result
    /// </summary>
    public Dictionary<string, string> Details { get; set; } = new();
}
