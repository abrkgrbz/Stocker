using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Stocker.Infrastructure.Alerts.Persistence;

/// <summary>
/// Design-time factory for AlertDbContext.
/// Used by EF Core tools for migrations.
/// </summary>
public class AlertDbContextFactory : IDesignTimeDbContextFactory<AlertDbContext>
{
    public AlertDbContext CreateDbContext(string[] args)
    {
        // Build configuration - find the API project directory
        var currentDir = Directory.GetCurrentDirectory();
        string apiPath;

        // Navigate to find the Stocker root, then API project
        var stockerRoot = currentDir;
        while (!string.IsNullOrEmpty(stockerRoot) && !Directory.Exists(Path.Combine(stockerRoot, "src", "API", "Stocker.API")))
        {
            var parent = Directory.GetParent(stockerRoot);
            if (parent == null) break;
            stockerRoot = parent.FullName;
        }

        apiPath = Path.Combine(stockerRoot, "src", "API", "Stocker.API");

        if (!Directory.Exists(apiPath))
        {
            throw new DirectoryNotFoundException($"Could not find API project at: {apiPath}");
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiPath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not found in configuration");

        var optionsBuilder = new DbContextOptionsBuilder<AlertDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "alerts");
        });

        return new AlertDbContext(optionsBuilder.Options);
    }
}
