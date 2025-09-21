using Hangfire;
using Hangfire.Dashboard;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Stocker.Infrastructure.BackgroundJobs;

public static class HangfireConfiguration
{
    public static IServiceCollection AddHangfireServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Get connection string with fallback options - Use HangfireConnection first
        var connectionString = configuration.GetConnectionString("HangfireConnection") 
            ?? configuration.GetConnectionString("MasterConnection");
        
        // If connection string is not found, try to build it from environment variables
        if (string.IsNullOrEmpty(connectionString))
        {
            var dbHost = configuration["DB_HOST"] ?? "database";
            var dbName = configuration["HANGFIRE_DB_NAME"] ?? "StockerHangfireDb";
            var dbUser = configuration["DB_USER"] ?? "sa";
            var dbPassword = configuration["DB_PASSWORD"];
            
            if (!string.IsNullOrEmpty(dbPassword))
            {
                connectionString = $"Server={dbHost};Database={dbName};User Id={dbUser};Password={dbPassword};TrustServerCertificate=True;MultipleActiveResultSets=true";
                Console.WriteLine($"[Hangfire] Built connection string from environment variables");
            }
            else
            {
                // Fallback to a default connection string for local development
                connectionString = "Server=localhost;Database=StockerHangfireDb;Trusted_Connection=true;TrustServerCertificate=true;MultipleActiveResultSets=true";
                Console.WriteLine($"[Hangfire] Using default connection string");
            }
        }
        
        Console.WriteLine($"[Hangfire] Connection string configured: {!string.IsNullOrEmpty(connectionString)}");
        
        // Hangfire konfigürasyonu
        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(connectionString, new SqlServerStorageOptions
            {
                CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
                SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
                QueuePollInterval = TimeSpan.Zero,
                UseRecommendedIsolationLevel = true,
                DisableGlobalLocks = true,
                SchemaName = "Hangfire",
                PrepareSchemaIfNecessary = true // Tabloları otomatik oluştur
            }));

        // Hangfire server
        services.AddHangfireServer(options =>
        {
            options.ServerName = $"Stocker-{Environment.MachineName}";
            options.WorkerCount = Environment.ProcessorCount * 2;
            options.Queues = new[] { "critical", "default", "low" };
        });

        return services;
    }

    public static IApplicationBuilder UseHangfireDashboard(this IApplicationBuilder app, IConfiguration configuration)
    {
        var dashboardPath = configuration.GetValue<string>("Hangfire:DashboardPath") ?? "/hangfire";
        
        // Get JWT settings for authorization
        var jwtSecret = configuration["JwtSettings:Secret"];
        var jwtIssuer = configuration["JwtSettings:Issuer"] ?? "Stocker";
        var jwtAudience = configuration["JwtSettings:Audience"] ?? "Stocker";
        
        app.UseHangfireDashboard(dashboardPath, new DashboardOptions
        {
            DashboardTitle = "Stocker - Background Jobs",
            Authorization = new[] { 
                new HangfireJwtAuthorizationFilter(jwtSecret, jwtIssuer, jwtAudience) 
            },
            IgnoreAntiforgeryToken = true,
            DisplayStorageConnectionString = false,
            IsReadOnlyFunc = (DashboardContext context) => false
        });

        return app;
    }
}