using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;
using Stocker.Modules.CRM.Infrastructure.Services;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Infrastructure;

/// <summary>
/// Dependency injection configuration for CRM Infrastructure
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds CRM infrastructure services to the service collection
    /// </summary>
    public static IServiceCollection AddCRMInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add DbContext
        services.AddDbContext<CRMDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("TenantConnection") 
                ?? configuration.GetConnectionString("DefaultConnection");
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(typeof(CRMDbContext).Assembly.FullName);
                sqlOptions.CommandTimeout(30);
            });
        });

        // Register repositories
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<ILeadRepository, LeadRepository>();

        // Register UnitOfWork
        services.AddScoped<IUnitOfWork, CRMUnitOfWork>();

        // Register Tenant CRM Database Service
        services.AddScoped<ITenantCRMDatabaseService, TenantCRMDatabaseService>();

        return services;
    }
}