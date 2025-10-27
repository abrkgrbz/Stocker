using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.EventConsumers;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;
using Stocker.Modules.CRM.Infrastructure.Services;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.Modules.CRM.Application.Contracts;
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
        // CRMDbContext is registered dynamically per request based on tenant
        // using ITenantService to get the current tenant's connection string
        services.AddScoped<CRMDbContext>(serviceProvider =>
        {
            var tenantService = serviceProvider.GetRequiredService<ITenantService>();
            var connectionString = tenantService.GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Tenant connection string is not available. Ensure tenant resolution middleware has run.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<CRMDbContext>();
            optionsBuilder.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(typeof(CRMDbContext).Assembly.FullName);
                sqlOptions.CommandTimeout(30);
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null);
            });

            return new CRMDbContext(optionsBuilder.Options, tenantService);
        });

        // Register generic repository (for entities without specific repositories like Pipeline, Opportunity, etc.)
        // CRMGenericRepository explicitly implements IRepository<>, IReadRepository<>, and IWriteRepository<>
        services.AddScoped(typeof(IRepository<>), typeof(CRMGenericRepository<>));
        services.AddScoped(typeof(IReadRepository<>), typeof(CRMGenericRepository<>));
        services.AddScoped(typeof(IWriteRepository<>), typeof(CRMGenericRepository<>));

        // Register specific repositories
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<ILeadRepository, LeadRepository>();
        services.AddScoped<IDealRepository, DealRepository>();
        services.AddScoped<ICustomerSegmentRepository, CustomerSegmentRepository>();
        services.AddScoped<ICustomerTagRepository, CustomerTagRepository>();
        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<IWorkflowRepository, WorkflowRepository>();
        services.AddScoped<IWorkflowExecutionRepository, WorkflowExecutionRepository>();

        // Register UnitOfWork
        services.AddScoped<IUnitOfWork, CRMUnitOfWork>();

        // Register Tenant CRM Database Service
        services.AddScoped<ITenantCRMDatabaseService, TenantCRMDatabaseService>();

        // Register Segmentation Services
        services.AddScoped<Application.Segmentation.SegmentCriteriaEngine>();

        // Register Document Storage Service
        services.AddScoped<IDocumentStorageService, LocalDocumentStorageService>();

        // Register Cross-Module Services (Contract Implementations)
        services.AddScoped<Shared.Contracts.CRM.ICrmCustomerService, Application.Services.CrmCustomerService>();
        services.AddScoped<Shared.Contracts.CRM.ICrmDealService, Application.Services.CrmDealService>();
        services.AddScoped<Shared.Contracts.CRM.ICrmLeadService, Application.Services.CrmLeadService>();

        return services;
    }

    /// <summary>
    /// Registers CRM event consumers with MassTransit
    /// Called from API layer where MassTransit is configured
    /// </summary>
    public static void AddCRMConsumers(IRegistrationConfigurator configurator)
    {
        configurator.AddConsumer<CustomerCreatedEventConsumer>();
        configurator.AddConsumer<CustomerUpdatedEventConsumer>();
        configurator.AddConsumer<DealWonEventConsumer>();
    }
}