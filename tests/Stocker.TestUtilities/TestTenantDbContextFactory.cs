using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;
using System.Collections.Concurrent;

namespace Stocker.TestUtilities;

public class TestTenantDbContextFactory : ITenantDbContextFactory
{
    // Static to ensure same instance across all tests
    private static readonly ConcurrentDictionary<Guid, InMemoryDatabaseRoot> _databaseRoots = new();
    private static readonly ConcurrentDictionary<Guid, DbContextOptions<TenantDbContext>> _optionsCache = new();
    
    public ITenantDbContext CreateDbContext(Guid tenantId)
    {
        var options = GetOrCreateOptions(tenantId);
        return new TenantDbContext(options, tenantId);
    }

    public async Task<ITenantDbContext> CreateDbContextAsync(Guid tenantId)
    {
        return await Task.FromResult(CreateDbContext(tenantId));
    }

    private DbContextOptions<TenantDbContext> GetOrCreateOptions(Guid tenantId)
    {
        return _optionsCache.GetOrAdd(tenantId, id =>
        {
            // Get or create a database root for this tenant
            var databaseRoot = _databaseRoots.GetOrAdd(id, _ => new InMemoryDatabaseRoot());
            
            return new DbContextOptionsBuilder<TenantDbContext>()
                .UseInMemoryDatabase($"TestTenantDb_{id}", databaseRoot)
                .EnableSensitiveDataLogging()
                .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.ManyServiceProvidersCreatedWarning))
                .Options;
        });
    }

    public async Task<string> GetTenantConnectionStringAsync(Guid tenantId)
    {
        // For testing, return a dummy connection string
        return await Task.FromResult($"DataSource=:memory:{tenantId}");
    }
}