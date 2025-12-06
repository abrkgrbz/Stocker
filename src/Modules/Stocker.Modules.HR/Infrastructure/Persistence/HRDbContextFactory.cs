using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.Infrastructure.Persistence;

/// <summary>
/// Factory for creating HRDbContext instances at design time (for migrations)
/// </summary>
public class HRDbContextFactory : IDesignTimeDbContextFactory<HRDbContext>
{
    public HRDbContext CreateDbContext(string[] args)
    {
        // For design-time migrations, we use a default connection string
        // In production, the connection string comes from the tenant service
        var basePath = Directory.GetCurrentDirectory();

        // Try to find the API project directory for appsettings
        var apiPath = Path.Combine(basePath, "..", "..", "API", "Stocker.API");
        if (Directory.Exists(apiPath))
        {
            basePath = apiPath;
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<HRDbContext>();

        // Use a default connection string for design-time operations
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Database=stocker;Username=postgres;Password=postgres";

        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.MigrationsAssembly(typeof(HRDbContext).Assembly.FullName);
        });

        // Use a design-time tenant service that returns a null tenant ID
        // This allows the migrations to run without multi-tenancy filters
        return new HRDbContext(optionsBuilder.Options, new DesignTimeTenantService());
    }

    /// <summary>
    /// Minimal tenant service implementation for design-time operations
    /// </summary>
    private class DesignTimeTenantService : ITenantService
    {
        public Guid? GetCurrentTenantId() => null;
        public string? GetCurrentTenantName() => null;
        public string? GetConnectionString() => null;
        public Task<bool> SetCurrentTenant(Guid tenantId) => Task.FromResult(false);
        public Task<bool> SetCurrentTenant(string tenantIdentifier) => Task.FromResult(false);
    }
}
