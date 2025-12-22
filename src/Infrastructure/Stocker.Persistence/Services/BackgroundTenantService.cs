using Stocker.SharedKernel.Interfaces;

namespace Stocker.Persistence.Services;

/// <summary>
/// A tenant service implementation for background jobs that don't have HttpContext.
/// This service maintains tenant context without requiring HTTP context.
/// Used by MassTransit consumers and Hangfire jobs.
/// </summary>
public class BackgroundTenantService : IBackgroundTenantService
{
    private Guid? _tenantId;
    private string? _tenantName;
    private string? _connectionString;

    public Guid? GetCurrentTenantId() => _tenantId;

    public string? GetCurrentTenantName() => _tenantName;

    public string? GetConnectionString() => _connectionString;

    public Task<bool> SetCurrentTenant(Guid tenantId)
    {
        _tenantId = tenantId;
        return Task.FromResult(true);
    }

    public Task<bool> SetCurrentTenant(string tenantIdentifier)
    {
        // Not needed for background jobs
        return Task.FromResult(false);
    }

    /// <summary>
    /// Sets all tenant information at once for background processing
    /// </summary>
    public void SetTenantInfo(Guid tenantId, string? tenantName = null, string? connectionString = null)
    {
        _tenantId = tenantId;
        _tenantName = tenantName;
        _connectionString = connectionString;
    }
}