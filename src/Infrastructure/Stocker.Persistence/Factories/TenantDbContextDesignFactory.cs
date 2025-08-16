using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Persistence.Factories;

// Design-time tenant service for migrations
public class DesignTimeTenantService : ITenantService
{
    private readonly Guid _tenantId = Guid.NewGuid(); // Design-time tenant ID
    private readonly string _connectionString;
    
    public DesignTimeTenantService(string connectionString)
    {
        _connectionString = connectionString;
    }

    public Guid? GetCurrentTenantId() => _tenantId;
    public string? GetCurrentTenantName() => "Design Tenant";
    public string? GetConnectionString() => _connectionString;
    public Task<bool> SetCurrentTenant(Guid tenantId) => Task.FromResult(true);
    public Task<bool> SetCurrentTenant(string tenantIdentifier) => Task.FromResult(true);
}

// Design-time factory for EF Core migrations
public class TenantDbContextDesignFactory : IDesignTimeDbContextFactory<TenantDbContext>
{
    public TenantDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
        
        // Build configuration
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();
        
        // Get connection string from configuration
        var connectionString = configuration.GetConnectionString("TenantConnection");
        
        if (string.IsNullOrEmpty(connectionString))
        {
            // Fallback for local development
            connectionString = "Server=localhost;Database=StockerTenantDb_Design;User Id=sa;Password=YourStrongPassword123!;MultipleActiveResultSets=true;TrustServerCertificate=True";
        }
        
        optionsBuilder.UseSqlServer(connectionString);

        // Create a design-time tenant service
        var tenantService = new DesignTimeTenantService(connectionString);

        return new TenantDbContext(optionsBuilder.Options, tenantService);
    }
}