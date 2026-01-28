using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Purchase.Infrastructure.BackgroundJobs;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.Modules.Purchase.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Purchase.Infrastructure;

/// <summary>
/// Dependency injection configuration for Purchase Infrastructure
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Purchase infrastructure services to the service collection
    /// </summary>
    public static IServiceCollection AddPurchaseInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // PurchaseDbContext is registered dynamically per request based on tenant
        // using ITenantService to get the current tenant's connection string
        // IMPORTANT: Using AddDbContext ensures single instance per scope
        services.AddDbContext<PurchaseDbContext>((serviceProvider, optionsBuilder) =>
        {
            var tenantService = serviceProvider.GetRequiredService<ITenantService>();
            var connectionString = tenantService.GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Tenant connection string is not available. Ensure tenant resolution middleware has run.");
            }

            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(PurchaseDbContext).Assembly.FullName);
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "purchase");
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });
        }, ServiceLifetime.Scoped);

        // Register PurchaseUnitOfWork following Pattern A (BaseUnitOfWork)
        // This fixes Report Issue #6 (missing IPurchaseUnitOfWork/IUnitOfWork registration)
        services.AddScoped<PurchaseUnitOfWork>();
        services.AddScoped<IPurchaseUnitOfWork>(sp => sp.GetRequiredService<PurchaseUnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<PurchaseUnitOfWork>());

        // NOTE: Domain-specific repository registrations will be added here as they are created.
        // Currently the Purchase module uses generic Repository<T>() access from IUnitOfWork base.

        // Register Hangfire Background Jobs
        services.AddScoped<PurchaseOrderFollowupJob>();

        return services;
    }

    /// <summary>
    /// Schedules Purchase module recurring Hangfire jobs.
    /// Called from HangfireConfiguration after Hangfire is initialized.
    /// </summary>
    public static void SchedulePurchaseJobs()
    {
        // Purchase order followup - runs daily at 10:00 UTC
        PurchaseOrderFollowupJob.Schedule();
    }
}
