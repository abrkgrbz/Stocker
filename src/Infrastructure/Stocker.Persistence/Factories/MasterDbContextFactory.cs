using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Factories;

public class MasterDbContextFactory : IDesignTimeDbContextFactory<MasterDbContext>
{
    public MasterDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MasterDbContext>();
        
        // Build configuration
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();
        
        // Get connection string from configuration
        var connectionString = configuration.GetConnectionString("MasterConnection");
        
        if (string.IsNullOrEmpty(connectionString))
        {
            // Fallback for local development
            connectionString = "Server=localhost;Database=StockerMasterDb;User Id=sa;Password=YourStrongPassword123!;MultipleActiveResultSets=true;TrustServerCertificate=True";
        }
        
        optionsBuilder.UseSqlServer(connectionString);

        return new MasterDbContext(optionsBuilder.Options);
    }
}