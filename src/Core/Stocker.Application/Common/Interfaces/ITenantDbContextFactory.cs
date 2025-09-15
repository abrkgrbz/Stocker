using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Factory interface for creating tenant-specific database contexts
/// </summary>
public interface ITenantDbContextFactory
{
    /// <summary>
    /// Creates a database context for the specified tenant
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>A tenant-specific database context</returns>
    Task<ITenantDbContext> CreateDbContextAsync(Guid tenantId);
    
    /// <summary>
    /// Creates a database context for the specified tenant synchronously
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>A tenant-specific database context</returns>
    ITenantDbContext CreateDbContext(Guid tenantId);
    
    /// <summary>
    /// Gets the connection string for a specific tenant
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>The connection string for the tenant's database</returns>
    Task<string> GetTenantConnectionStringAsync(Guid tenantId);
}