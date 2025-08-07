using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Persistence.Factories;

// Design-time tenant service for migrations
public class DesignTimeTenantService : ITenantService
{
    private readonly Guid _tenantId = Guid.NewGuid(); // Design-time tenant ID

    public Guid? GetCurrentTenantId() => _tenantId;
    public string? GetCurrentTenantName() => "Design Tenant";
    public string? GetConnectionString() => "Server=DESKTOP-A1C2AO3;Database=StockerTenantDb_Design;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";
    public Task<bool> SetCurrentTenant(Guid tenantId) => Task.FromResult(true);
    public Task<bool> SetCurrentTenant(string tenantIdentifier) => Task.FromResult(true);
}

// Design-time factory for EF Core migrations
public class TenantDbContextDesignFactory : IDesignTimeDbContextFactory<TenantDbContext>
{
    public TenantDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
        
        // Design-time connection string for migration generation
        optionsBuilder.UseSqlServer(
            "Server=DESKTOP-A1C2AO3;Database=StockerTenantDb_Design;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True");

        // Create a design-time tenant service
        var tenantService = new DesignTimeTenantService();

        return new TenantDbContext(optionsBuilder.Options, tenantService);
    }
}