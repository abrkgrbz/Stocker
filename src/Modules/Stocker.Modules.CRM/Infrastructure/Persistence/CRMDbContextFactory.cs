using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for CRM DbContext
/// Used by EF Core migrations
/// </summary>
public class CRMDbContextFactory : IDesignTimeDbContextFactory<CRMDbContext>
{
    public CRMDbContext CreateDbContext(string[] args)
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
        var optionsBuilder = new DbContextOptionsBuilder<CRMDbContext>();
        var connectionString = configuration.GetConnectionString("TenantConnection") 
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'TenantConnection' not found.");

        optionsBuilder.UseSqlServer(connectionString, options =>
        {
            options.MigrationsAssembly(typeof(CRMDbContext).Assembly.FullName);
            options.CommandTimeout(30);
        });

        // Create a dummy tenant service for design-time
        var tenantService = new DesignTimeTenantService();

        return new CRMDbContext(optionsBuilder.Options, tenantService);
    }
}

/// <summary>
/// Dummy tenant service for design-time operations
/// </summary>
public class DesignTimeTenantService : ITenantService
{
    private readonly Guid _tenantId = Guid.NewGuid();  

    public Guid? GetCurrentTenantId() => _tenantId;
    public string? GetCurrentTenantName() => "Design Tenant";
    public string? GetConnectionString() => "Server=coolify.stoocker.app;Database=StockerTenantDb_Design;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=true;MultipleActiveResultSets=true";
    public Task<bool> SetCurrentTenant(Guid tenantId) => Task.FromResult(true);
    public Task<bool> SetCurrentTenant(string tenantIdentifier) => Task.FromResult(true);
}