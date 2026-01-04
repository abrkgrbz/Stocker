using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Finance.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for Finance DbContext
/// Used by EF Core migrations
/// </summary>
public class FinanceDbContextFactory : IDesignTimeDbContextFactory<FinanceDbContext>
{
    public FinanceDbContext CreateDbContext(string[] args)
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
        var optionsBuilder = new DbContextOptionsBuilder<FinanceDbContext>();
        var connectionString = configuration.GetConnectionString("TenantConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'TenantConnection' not found.");

        optionsBuilder.UseNpgsql(connectionString, options =>
        {
            options.MigrationsAssembly(typeof(FinanceDbContext).Assembly.FullName);
            options.MigrationsHistoryTable("__EFMigrationsHistory", "finance");
            options.CommandTimeout(30);
        });

        // Create a dummy tenant service for design-time
        var tenantService = new FinanceDesignTimeTenantService();

        return new FinanceDbContext(optionsBuilder.Options, tenantService);
    }
}

/// <summary>
/// Dummy tenant service for design-time operations
/// </summary>
public class FinanceDesignTimeTenantService : ITenantService
{
    private readonly Guid _tenantId = Guid.NewGuid();

    public Guid? GetCurrentTenantId() => _tenantId;
    public string? GetCurrentTenantName() => "Design Tenant";
    public string? GetConnectionString() => "Host=coolify.stoocker.app;Port=5432;Database=StockerTenantDb_Design;Username=postgres;Password=YourStrongPassword123!;Include Error Detail=true";
    public Task<bool> SetCurrentTenant(Guid tenantId) => Task.FromResult(true);
    public Task<bool> SetCurrentTenant(string tenantIdentifier) => Task.FromResult(true);
}
