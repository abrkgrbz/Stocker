using Microsoft.EntityFrameworkCore;

namespace Stocker.SharedKernel.MultiTenancy;

/// <summary>
/// Factory for creating tenant-specific database contexts
/// </summary>
public interface ITenantContextFactory
{
    /// <summary>
    /// Creates a database context for the specified tenant
    /// </summary>
    /// <param name="tenantId">The ID of the tenant</param>
    /// <returns>A DbContext instance configured for the specified tenant</returns>
    Task<DbContext> CreateAsync(Guid tenantId);

    /// <summary>
    /// Creates a database context for the current tenant
    /// </summary>
    /// <returns>A DbContext instance configured for the current tenant</returns>
    Task<DbContext> CreateForCurrentTenantAsync();
}