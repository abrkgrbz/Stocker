using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for Sales DbContext
/// Used by EF Core migrations
/// </summary>
public class SalesDbContextFactory : IDesignTimeDbContextFactory<SalesDbContext>
{
    public SalesDbContext CreateDbContext(string[] args)
    {
        // Build configuration
        var basePath = Directory.GetCurrentDirectory();

        // API klasörünü bul
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
        var optionsBuilder = new DbContextOptionsBuilder<SalesDbContext>();
        var connectionString = configuration.GetConnectionString("TenantConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'TenantConnection' not found.");

        optionsBuilder.UseNpgsql(connectionString, options =>
        {
            options.MigrationsAssembly(typeof(SalesDbContext).Assembly.FullName);
            options.MigrationsHistoryTable("__EFMigrationsHistory", "sales");
            options.CommandTimeout(30);
        });

        // Create a dummy tenant service for design-time
        var tenantService = new SalesDesignTimeTenantService();

        return new SalesDbContext(optionsBuilder.Options, tenantService);
    }
}

/// <summary>
/// Dummy tenant service for design-time operations
/// </summary>
public class SalesDesignTimeTenantService : ITenantService
{
    private readonly Guid _tenantId = Guid.NewGuid();

    public Guid? GetCurrentTenantId() => _tenantId;
    public string? GetCurrentTenantName() => "Design Tenant";
    public string? GetConnectionString() => "Host=coolify.stoocker.app;Port=5432;Database=StockerTenantDb_Design;Username=postgres;Password=YourStrongPassword123!;Include Error Detail=true";
    public Task<bool> SetCurrentTenant(Guid tenantId) => Task.FromResult(true);
    public Task<bool> SetCurrentTenant(string tenantIdentifier) => Task.FromResult(true);
}
