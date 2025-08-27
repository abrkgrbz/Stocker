using Stocker.SharedKernel.Interfaces;

namespace Stocker.Persistence.Services;

/// <summary>
/// A simple tenant service for background jobs that don't have HttpContext
/// </summary>
public class BackgroundTenantService : ITenantService
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

    public void SetTenantInfo(Guid tenantId, string? tenantName = null, string? connectionString = null)
    {
        _tenantId = tenantId;
        _tenantName = tenantName;
        _connectionString = connectionString;
    }
}