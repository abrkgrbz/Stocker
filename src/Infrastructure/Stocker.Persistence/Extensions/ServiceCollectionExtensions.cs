using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.SharedKernel.Settings;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Factories;
using Stocker.Persistence.Interceptors;
using Stocker.Persistence.Migrations;
using Stocker.Persistence.Repositories;
using Stocker.Persistence.Services;
using Stocker.Persistence.UnitOfWork;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Persistence.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Audit Interceptor
        services.AddScoped<AuditInterceptor>();

        // Add DbContexts
        services.AddDbContext<MasterDbContext>((serviceProvider, options) =>
        {
            var databaseSettings = serviceProvider.GetService<IOptions<DatabaseSettings>>()?.Value;
            var connectionString = databaseSettings?.GetMasterConnectionString() 
                ?? configuration.GetConnectionString("MasterConnection");
            
            // Log the connection string for debugging (remove sensitive parts)
            var logger = serviceProvider.GetService<Microsoft.Extensions.Logging.ILogger<MasterDbContext>>();
            if (logger != null && !string.IsNullOrEmpty(connectionString))
            {
                var sanitizedConnStr = connectionString.Contains("Password") 
                    ? connectionString.Substring(0, connectionString.IndexOf("Password")) + "Password=***"
                    : connectionString;
                logger.LogInformation("Connecting to MasterDb with connection string: {ConnectionString}", sanitizedConnStr);
            }
            else if (string.IsNullOrEmpty(connectionString))
            {
                logger?.LogError("MasterDb connection string is null or empty!");
            }
            
            options.UseSqlServer(connectionString);
            
            // Add interceptors
            var auditInterceptor = serviceProvider.GetRequiredService<AuditInterceptor>();
            options.AddInterceptors(auditInterceptor);
            
            // Apply development settings if configured
            if (databaseSettings != null)
            {
                if (databaseSettings.EnableSensitiveDataLogging && configuration.GetValue<bool>("IsDevelopment", false))
                {
                    options.EnableSensitiveDataLogging();
                }
                
                if (databaseSettings.EnableDetailedErrors)
                {
                    options.EnableDetailedErrors();
                }
            }
        });

         

        // Repository Registration
        // Repositories should be accessed through Unit of Work pattern (IMasterUnitOfWork or ITenantUnitOfWork)
        // Direct IRepository<T> injection is not supported due to multi-tenancy requirements
        // If you need a repository, inject the appropriate Unit of Work and call Repository<T>() method

        // Add Unit of Work
        services.AddScoped<IMasterUnitOfWork, MasterUnitOfWork>();
        
        // Register ITenantUnitOfWork as a scoped service
        services.AddScoped<ITenantUnitOfWork>(serviceProvider =>
        {
            var tenantService = serviceProvider.GetService<ITenantService>();
            var factory = serviceProvider.GetRequiredService<ITenantUnitOfWorkFactory>();
            
            // Get current tenant ID from tenant service
            var currentTenantId = tenantService?.GetCurrentTenantId();
            
            if (currentTenantId.HasValue && currentTenantId.Value != Guid.Empty)
            {
                return factory.CreateAsync(currentTenantId.Value).GetAwaiter().GetResult();
            }
            
            // For non-tenant specific operations or when tenant is not yet resolved
            // Create with a default/empty context
            var contextFactory = serviceProvider.GetRequiredService<ITenantDbContextFactory>();
            var defaultContext = contextFactory.CreateDbContextAsync(Guid.Empty).GetAwaiter().GetResult();
            return new TenantUnitOfWork(defaultContext);
        });

        // Add Tenant Services
        services.AddScoped<ITenantService, TenantService>();
        services.AddScoped<ITenantDbContextFactory, TenantDbContextFactory>();
        services.AddScoped<ITenantUnitOfWorkFactory, TenantUnitOfWorkFactory>();

        // Add Migration Services
        services.AddScoped<IMigrationService, MigrationService>(); 
         services.AddHostedService<DatabaseMigrationHostedService>();

        return services;
    }

    public static IServiceCollection AddMultiTenancy(this IServiceCollection services)
    {
        // Add HTTP Context accessor for tenant resolution
        services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

        // Add tenant resolution middleware will be configured here
        // services.AddScoped<ITenantResolutionStrategy, HeaderTenantResolutionStrategy>();

        return services;
    }
}