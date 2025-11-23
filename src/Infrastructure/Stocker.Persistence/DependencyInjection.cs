using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Factories;
using Stocker.Persistence.Monitoring;
using Stocker.Persistence.Repositories;
using Stocker.Persistence.Services;
using Stocker.Persistence.UnitOfWork;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Enable legacy timestamp behavior for Npgsql GLOBALLY
        // This allows DateTime to work with both 'timestamp with time zone' and 'timestamp without time zone'
        // Must be set before any DbContext instances are created
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        // Add MasterDbContext
        services.AddDbContext<MasterDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("MasterConnection"),
                b => b.MigrationsAssembly(typeof(MasterDbContext).Assembly.FullName)));

        // Register MasterDbContext as IMasterDbContext
        services.AddScoped<IMasterDbContext>(provider => provider.GetRequiredService<MasterDbContext>());

        // Add TenantDbContext as transient (created per request via factory)
        services.AddTransient<TenantDbContext>();
        
        // Register TenantDbContextFactory
        services.AddScoped<ITenantDbContextFactory, TenantDbContextFactory>();

        // Register repositories
        services.AddScoped<IMasterUnitOfWork, MasterUnitOfWork>();
        services.AddScoped<ITenantUnitOfWork, TenantUnitOfWork>();
        
        // Note: Generic repositories should be registered per context
        // They will be registered in specific context configurations

        // Register migration service
        services.AddScoped<IMigrationService, Migrations.MigrationService>();

        // Register system monitoring service
        services.AddScoped<ISystemMonitoringService, SystemMonitoringService>();

        // Register tenant health check service
        services.AddScoped<ITenantHealthCheckService, TenantHealthCheckService>();

        // Note: MigrationService is not registered as HostedService
        // Migrations should be handled explicitly or through a separate hosted service

        return services;
    }
}