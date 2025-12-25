using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Sales.Domain.Repositories;
using Stocker.Modules.Sales.Infrastructure.EventConsumers;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;
using Stocker.Modules.Sales.Interfaces;
using Stocker.Modules.Stocker.Modules.Sales.Infrastructure.EventConsumers;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Infrastructure;

/// <summary>
/// Dependency injection configuration for Sales Infrastructure
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Sales infrastructure services to the service collection
    /// </summary>
    public static IServiceCollection AddSalesInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // SalesDbContext is registered dynamically per request based on tenant
        // using ITenantService to get the current tenant's connection string
        // IMPORTANT: Using AddDbContext ensures single instance per scope
        services.AddDbContext<SalesDbContext>((serviceProvider, optionsBuilder) =>
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
                npgsqlOptions.MigrationsAssembly(typeof(SalesDbContext).Assembly.FullName);
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "sales");
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });
        }, ServiceLifetime.Scoped);

        // Register SalesUnitOfWork following Pattern A (BaseUnitOfWork)
        // MIGRATION: Changed from services.AddScoped<IUnitOfWork, SalesUnitOfWork>()
        // Now exposes ISalesUnitOfWork for strongly-typed access
        services.AddScoped<SalesUnitOfWork>();
        services.AddScoped<ISalesUnitOfWork>(sp => sp.GetRequiredService<SalesUnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<SalesUnitOfWork>());

        // IMPORTANT: Repository registrations now delegate to ISalesUnitOfWork
        // to ensure the same DbContext instance is used for both repository operations
        // and SaveChanges(). This fixes the bug where entities were added to one DbContext
        // but SaveChanges() was called on a different DbContext instance.
        //
        // Handlers can use either:
        //   - ISalesUnitOfWork.SalesOrders (recommended for new code)
        //   - ISalesOrderRepository (legacy, still supported - now correctly shares DbContext)
        services.AddScoped<ISalesOrderRepository>(sp => sp.GetRequiredService<ISalesUnitOfWork>().SalesOrders);
        services.AddScoped<IInvoiceRepository>(sp => sp.GetRequiredService<ISalesUnitOfWork>().Invoices);
        services.AddScoped<IPaymentRepository>(sp => sp.GetRequiredService<ISalesUnitOfWork>().Payments);

        // Phase 3: Contract & Territory Repositories
        services.AddScoped<ICustomerContractRepository>(sp => sp.GetRequiredService<ISalesUnitOfWork>().CustomerContracts);
        services.AddScoped<ISalesTerritoryRepository>(sp => sp.GetRequiredService<ISalesUnitOfWork>().SalesTerritories);

        return services;
    }

    /// <summary>
    /// Registers Sales event consumers with MassTransit
    /// Called from API layer where MassTransit is configured
    /// </summary>
    public static void AddSalesConsumers(IRegistrationConfigurator configurator)
    {
        // Register CRM event consumers for Sales module integration
        configurator.AddConsumer<CustomerCreatedEventConsumer>();
        configurator.AddConsumer<DealWonEventConsumer>();
        configurator.AddConsumer<LeadConvertedEventConsumer>();
    }
}
