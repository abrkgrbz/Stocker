namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for retrieving tenant-specific module subscriptions
/// Used by authorization middleware to enforce module-level access control
/// </summary>
public interface ITenantModuleService
{
    /// <summary>
    /// Gets the list of modules that a tenant has subscribed to
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of subscribed module names (e.g., ["CRM", "Finance"])</returns>
    Task<List<string>> GetSubscribedModulesAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a tenant has subscribed to a specific module
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="moduleName">The module name to check (e.g., "CRM", "Finance")</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if tenant has subscribed to the module, false otherwise</returns>
    Task<bool> HasModuleAccessAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default);
}
