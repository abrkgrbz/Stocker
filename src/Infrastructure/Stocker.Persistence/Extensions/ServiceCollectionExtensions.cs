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
using Stocker.Persistence.Repositories.Tenant;
using Stocker.Persistence.Services;
using Stocker.Persistence.UnitOfWork;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Repositories;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Persistence.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Audit Interceptor
        services.AddScoped<AuditInterceptor>();

        // Add DbContextFactory for MasterDbContext
        // Using factory pattern for better control over DbContext lifetime and concurrency
        services.AddPooledDbContextFactory<MasterDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("MasterConnection");

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("MasterConnection configuration is required. Please set ConnectionStrings:MasterConnection");
            }

            options.UseNpgsql(connectionString);

            // Suppress pending model changes warning
            options.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

            // Note: Interceptors are scoped services, cannot be added to pooled contexts
            // If auditing is needed, implement at application layer

            // Apply development settings if in development environment
            if (configuration.GetValue<bool>("IsDevelopment", false))
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            }
        });

        // Add MasterDbContext as scoped service using the factory
        services.AddScoped<MasterDbContext>(serviceProvider =>
        {
            var factory = serviceProvider.GetRequiredService<IDbContextFactory<MasterDbContext>>();
            var context = factory.CreateDbContext();

            // Add audit interceptor to the context
            var auditInterceptor = serviceProvider.GetRequiredService<AuditInterceptor>();
            var optionsBuilder = new DbContextOptionsBuilder<MasterDbContext>();

            // Get existing options and add interceptor
            optionsBuilder.UseNpgsql(configuration.GetConnectionString("MasterConnection"));
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            optionsBuilder.AddInterceptors(auditInterceptor);

            if (configuration.GetValue<bool>("IsDevelopment", false))
            {
                optionsBuilder.EnableSensitiveDataLogging();
                optionsBuilder.EnableDetailedErrors();
            }

            return new MasterDbContext(optionsBuilder.Options);
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
                // Return null - tenant-specific operations should not be used without a valid tenant
                logger?.LogInformation("No tenant ID available for ITenantUnitOfWork - returning null. This is normal for public/master endpoints.");
                return null;
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Failed to create ITenantUnitOfWork: {Message}", ex.Message);
                throw;
            }
        });

        // Add Tenant Services
        services.AddScoped<ITenantService, TenantService>();
        // BackgroundTenantService for MassTransit consumers and background jobs (no HttpContext dependency)
        services.AddScoped<BackgroundTenantService>();
        services.AddScoped<IBackgroundTenantService>(sp => sp.GetRequiredService<BackgroundTenantService>());
        services.AddScoped<ITenantDbContextFactory, TenantDbContextFactory>();
        services.AddScoped<ITenantUnitOfWorkFactory, TenantUnitOfWorkFactory>();
        services.AddScoped<ITenantContextFactory, TenantContextFactory>();
        services.AddScoped<ITenantResolver, TenantResolver>();
        services.AddScoped<ICompanyService, Services.CompanyService>();

        // Add Tenant Module Service (for module authorization - Phase 4.5)
        services.AddScoped<ITenantModuleService, Services.TenantModuleService>();

        // Add Tenant Database Security Service (per-tenant PostgreSQL users, encrypted connection strings)
        services.AddScoped<ITenantDatabaseSecurityService, Services.TenantDatabaseSecurityService>();

        // Add TenantDbContext as scoped service for CQRS handlers
        services.AddScoped<TenantDbContext>(serviceProvider =>
        {
            var tenantService = serviceProvider.GetService<ITenantService>();
            var factory = serviceProvider.GetRequiredService<ITenantDbContextFactory>();
            var tenantId = tenantService?.GetCurrentTenantId();
            
            // If no tenant ID is available (e.g., during login), return null
            // Tenant-specific operations should not be used without a valid tenant
            if (!tenantId.HasValue || tenantId.Value == Guid.Empty)
            {
                var logger = serviceProvider.GetService<ILogger<TenantDbContext>>();
                logger?.LogDebug("No tenant ID available for TenantDbContext - returning null. This is normal for public/master endpoints.");
                return null;
            }
            
            // Use Task.Run to avoid deadlock
            var context = Task.Run(async () => await factory.CreateDbContextAsync(tenantId.Value)).GetAwaiter().GetResult();
            return (TenantDbContext)context;
        });

        // Add Repositories
        services.AddScoped<ISettingsRepository, SettingsRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        
        // Register DbContext interfaces for Application layer
        services.AddScoped<ITenantDbContext>(provider => 
        {
            var context = provider.GetService<TenantDbContext>();
            return context; // Can be null for public/master endpoints
        });
        services.AddScoped<IMasterDbContext>(provider => provider.GetRequiredService<MasterDbContext>());
        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<MasterDbContext>());
        
        // Add Migration Services
        services.AddScoped<IMigrationService, MigrationService>();
        // Disabled automatic migration - handled manually in Program.cs
        // services.AddHostedService<DatabaseMigrationHostedService>();

        // Add System Monitoring Service
        services.AddScoped<ISystemMonitoringService, Monitoring.SystemMonitoringService>();

        // Add Tenant Health Check Service
        services.AddScoped<ITenantHealthCheckService, Services.TenantHealthCheckService>();

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