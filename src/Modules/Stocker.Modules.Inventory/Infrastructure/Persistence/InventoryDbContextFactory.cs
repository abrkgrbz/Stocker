using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for Inventory DbContext
/// Used by EF Core migrations
/// </summary>
public class InventoryDbContextFactory : IDesignTimeDbContextFactory<InventoryDbContext>
{
    public InventoryDbContext CreateDbContext(string[] args)
    {
        // Build configuration
        var basePath = Directory.GetCurrentDirectory();

        // Find API directory
        if (!basePath.Contains("Stocker.API"))
        {
            basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "API", "Stocker.API");
            if (!Directory.Exists(basePath))
            {
                basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "API", "Stocker.API");
                if (!Directory.Exists(basePath))
                {
                    basePath = @"C:\Users\PC\source\repos\Stocker\src\API\Stocker.API";
                }
            }
        }

        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        // Create DbContext options
        var optionsBuilder = new DbContextOptionsBuilder<InventoryDbContext>();
        var connectionString = configuration.GetConnectionString("TenantConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'TenantConnection' not found.");

        optionsBuilder.UseNpgsql(connectionString, options =>
        {
            options.MigrationsAssembly(typeof(InventoryDbContext).Assembly.FullName);
            options.CommandTimeout(30);
        });

        // Create a dummy tenant service for design-time
        var tenantService = new DesignTimeTenantService();

        return new InventoryDbContext(optionsBuilder.Options, tenantService);
    }
}

/// <summary>
/// Dummy tenant service for design-time operations
/// </summary>
internal class DesignTimeTenantService : ITenantService
{
    private readonly Guid _tenantId = Guid.NewGuid();

    public Guid? GetCurrentTenantId() => _tenantId;
    public string? GetCurrentTenantName() => "Design Tenant";
    public string? GetConnectionString() => "Host=coolify.stoocker.app;Port=5432;Database=StockerTenantDb_Design;Username=postgres;Password=YourStrongPassword123!;Include Error Detail=true";
    public Task<bool> SetCurrentTenant(Guid tenantId) => Task.FromResult(true);
    public Task<bool> SetCurrentTenant(string tenantIdentifier) => Task.FromResult(true);
}
