using Stocker.Application.Common.Interfaces;

namespace Stocker.SignalR.Models;

/// <summary>
/// Represents the progress of tenant creation process
/// </summary>
public class TenantCreationProgress
{
    public Guid RegistrationId { get; set; }
    public TenantCreationStep Step { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsCompleted { get; set; }
    public bool HasError { get; set; }
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}
