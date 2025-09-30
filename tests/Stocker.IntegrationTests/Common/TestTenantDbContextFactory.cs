using Microsoft.Extensions.DependencyInjection;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;

namespace Stocker.IntegrationTests.Common;

public class TestTenantDbContextFactory : ITenantDbContextFactory
{
    private readonly IServiceProvider _serviceProvider;

    public TestTenantDbContextFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public ITenantDbContext CreateDbContext(Guid tenantId)
    {
        // In tests, always return the same TenantDbContext
        return _serviceProvider.GetRequiredService<TenantDbContext>();
    }

    public async Task<ITenantDbContext> CreateDbContextAsync(Guid tenantId)
    {
        // In tests, always return the same TenantDbContext
        return await Task.FromResult(_serviceProvider.GetRequiredService<TenantDbContext>());
    }

    public async Task<string> GetTenantConnectionStringAsync(Guid tenantId)
    {
        // Return test connection string
        return await Task.FromResult("Server=(localdb)\\TestDB;Database=TestDb;Trusted_Connection=true;");
    }
}