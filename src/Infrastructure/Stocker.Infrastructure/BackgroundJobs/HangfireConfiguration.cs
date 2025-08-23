using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Stocker.Infrastructure.BackgroundJobs;

public static class HangfireConfiguration
{
    public static IServiceCollection AddHangfireServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Hangfire konfigürasyonu
        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(configuration.GetConnectionString("MasterConnection"), new SqlServerStorageOptions
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
        
        app.UseHangfireDashboard(dashboardPath, new DashboardOptions
        {
            DashboardTitle = "Stocker - Background Jobs",
            Authorization = new[] { new HangfireAuthorizationFilter() },
            IgnoreAntiforgeryToken = true
        });

        return app;
    }
}