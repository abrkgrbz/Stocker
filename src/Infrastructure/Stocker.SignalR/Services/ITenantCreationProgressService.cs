using Stocker.SignalR.Models;

namespace Stocker.SignalR.Services;

/// <summary>
/// Service for sending real-time tenant creation progress updates via SignalR
/// </summary>
public interface ITenantCreationProgressService
{
    /// <summary>
    /// Send progress update for a specific registration
    /// </summary>
    Task SendProgressAsync(Guid registrationId, TenantCreationStep step, string message, int progressPercentage, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send error notification for tenant creation failure
    /// </summary>
    Task SendErrorAsync(Guid registrationId, string errorMessage, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send completion notification with tenant information
    /// </summary>
    Task SendCompletionAsync(Guid registrationId, Guid tenantId, string tenantName, CancellationToken cancellationToken = default);
}
