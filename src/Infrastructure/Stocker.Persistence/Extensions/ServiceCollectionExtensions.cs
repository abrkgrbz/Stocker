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
            // In Production/Docker, prefer ConnectionStrings over DatabaseSettings
            var connectionString = configuration.GetConnectionString("MasterConnection");
            var databaseSettings = serviceProvider.GetService<IOptions<DatabaseSettings>>()?.Value;
            
            // Fallback to DatabaseSettings if ConnectionString is not provided
            if (string.IsNullOrEmpty(connectionString))
            {
                connectionString = databaseSettings?.GetMasterConnectionString();
            }
            
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
            var logger = serviceProvider.GetService<Microsoft.Extensions.Logging.ILogger<TenantUnitOfWork>>();
            
            try
            {
                var tenantService = serviceProvider.GetService<ITenantService>();
                var factory = serviceProvider.GetRequiredService<ITenantUnitOfWorkFactory>();
                
                // Get current tenant ID from tenant service
                var currentTenantId = tenantService?.GetCurrentTenantId();
                
                if (currentTenantId.HasValue && currentTenantId.Value != Guid.Empty)
                {
                    try
                    {
                        // Task.Run ile deadlock'ı önle
                        var unitOfWork = Task.Run(async () => await factory.CreateAsync(currentTenantId.Value)).GetAwaiter().GetResult();
                        return unitOfWork;
                    }
                    catch (Exception factoryEx)
                    {
                        logger?.LogError(factoryEx, "Failed to create TenantUnitOfWork via factory: {Message}", factoryEx.Message);
                        throw;
                    }
                }
                
                // For non-tenant specific operations or when tenant is not yet resolved
                // Create with a default/empty context
                logger?.LogWarning("No tenant ID available, attempting to create default context with Guid.Empty");
                var contextFactory = serviceProvider.GetRequiredService<ITenantDbContextFactory>();
                // Task.Run ile deadlock'ı önle
                var defaultContext = Task.Run(async () => await contextFactory.CreateDbContextAsync(Guid.Empty)).GetAwaiter().GetResult();
                logger?.LogWarning("Default TenantUnitOfWork created with empty tenant ID - this may cause issues!");
                return new TenantUnitOfWork(defaultContext);
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Failed to create ITenantUnitOfWork: {Message}", ex.Message);
                throw;
            }
        });

        // Add Tenant Services
        services.AddScoped<ITenantService, TenantService>();
        services.AddScoped<ITenantDbContextFactory, TenantDbContextFactory>();
        services.AddScoped<ITenantUnitOfWorkFactory, TenantUnitOfWorkFactory>();
        
        // Add TenantDbContext as scoped service for CQRS handlers
        services.AddScoped<TenantDbContext>(serviceProvider =>
        {
            var tenantService = serviceProvider.GetRequiredService<ITenantService>();
            var factory = serviceProvider.GetRequiredService<ITenantDbContextFactory>();
            var tenantId = tenantService.GetCurrentTenantId();
            
            if (!tenantId.HasValue || tenantId.Value == Guid.Empty)
            {
                throw new InvalidOperationException("TenantDbContext cannot be created without a valid TenantId");
            }
            
            // Use Task.Run to avoid deadlock
            return Task.Run(async () => await factory.CreateDbContextAsync(tenantId.Value)).GetAwaiter().GetResult();
        });

        // Add Migration Services
        services.AddScoped<IMigrationService, MigrationService>(); 
        // Disabled automatic migration - handled manually in Program.cs
        // services.AddHostedService<DatabaseMigrationHostedService>();

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