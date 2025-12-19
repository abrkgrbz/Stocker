namespace Stocker.SignalR.Models.Setup;

/// <summary>
/// Setup/provisioning progress update message
/// </summary>
public class SetupProgressMessage
{
    /// <summary>
    /// The tenant being set up
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Current setup step
    /// </summary>
    public SetupStep Step { get; set; }

    /// <summary>
    /// Human-readable step name
    /// </summary>
    public string StepName { get; set; } = string.Empty;

    /// <summary>
    /// Progress message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Progress percentage (0-100)
    /// </summary>
    public int ProgressPercentage { get; set; }

    /// <summary>
    /// Whether the setup is completed
    /// </summary>
    public bool IsCompleted { get; set; }

    /// <summary>
    /// Whether an error occurred
    /// </summary>
    public bool HasError { get; set; }

    /// <summary>
    /// Error message (if HasError is true)
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// When this update was generated
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Additional metadata about the setup process
    /// </summary>
    public Dictionary<string, object>? Metadata { get; set; }
}
