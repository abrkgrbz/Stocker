using Stocker.SharedKernel.Interfaces;

namespace Stocker.IntegrationTests.Common;

public class TestTenantService : ITenantService
{
    private Guid? _currentTenantId;
    private string? _currentTenantName;
    private string? _connectionString;

    public Guid? GetCurrentTenantId()
    {
        return _currentTenantId ?? Guid.NewGuid(); // Return a default Guid for testing
    }

    public string? GetCurrentTenantName()
    {
        return _currentTenantName ?? "Test Tenant";
    }

    public string? GetConnectionString()
    {
        return _connectionString ?? "Server=(localdb)\\TestDB;Database=TestDb;Trusted_Connection=true;";
    }

    public Task<bool> SetCurrentTenant(Guid tenantId)
    {
        _currentTenantId = tenantId;
        _currentTenantName = "Test Tenant";
        return Task.FromResult(true);
    }

    public Task<bool> SetCurrentTenant(string tenantIdentifier)
    {
        _currentTenantName = tenantIdentifier;
        _currentTenantId = Guid.NewGuid();
        return Task.FromResult(true);
    }
}