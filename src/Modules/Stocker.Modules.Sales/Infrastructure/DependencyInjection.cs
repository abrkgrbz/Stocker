using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Sales.Domain.Repositories;
using Stocker.Modules.Sales.Infrastructure.EventConsumers;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;
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
        services.AddScoped<SalesDbContext>(serviceProvider =>
        {
            var tenantService = serviceProvider.GetRequiredService<ITenantService>();
            var connectionString = tenantService.GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Tenant connection string is not available. Ensure tenant resolution middleware has run.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<SalesDbContext>();
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

            return new SalesDbContext(optionsBuilder.Options, tenantService);
        });

        // Register repositories
        services.AddScoped<ISalesOrderRepository, SalesOrderRepository>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();

        // Register UnitOfWork
        services.AddScoped<IUnitOfWork, SalesUnitOfWork>();

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
