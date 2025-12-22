namespace Stocker.SharedKernel.Interfaces;

public interface ITenantService
{
    Guid? GetCurrentTenantId();
    string? GetCurrentTenantName();
    string? GetConnectionString();
    Task<bool> SetCurrentTenant(Guid tenantId);
    Task<bool> SetCurrentTenant(string tenantIdentifier);
}

/// <summary>
/// Extended interface for setting tenant info programmatically.
/// Used by MassTransit consumers and background jobs that don't have HttpContext.
/// </summary>
public interface IBackgroundTenantService : ITenantService
{
    /// <summary>
    /// Sets all tenant information at once for background processing
    /// </summary>
    void SetTenantInfo(Guid tenantId, string? tenantName = null, string? connectionString = null);
}