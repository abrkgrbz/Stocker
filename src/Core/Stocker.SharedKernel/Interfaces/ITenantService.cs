namespace Stocker.SharedKernel.Interfaces;

public interface ITenantService
{
    Guid? GetCurrentTenantId();
    string? GetCurrentTenantName();
    string? GetConnectionString();
    Task<bool> SetCurrentTenant(Guid tenantId);
    Task<bool> SetCurrentTenant(string tenantIdentifier);
}