using FluentValidation;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Sales.Infrastructure.EventConsumers;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Stocker.Modules.Sales.Infrastructure.EventConsumers;

namespace Stocker.Modules.Sales.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddSalesInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register MediatR handlers
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));

        // Register FluentValidation validators
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }

    /// <summary>
    /// Registers SalesDbContext with the provided connection string
    /// Called during tenant context resolution
    /// </summary>
    public static IServiceCollection AddSalesDbContext(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<SalesDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(SalesDbContext).Assembly.FullName);
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "sales");
            });
        });

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
