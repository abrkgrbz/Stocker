using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Finance.Infrastructure.EventConsumers;

namespace Stocker.Modules.Finance.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddFinanceInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register Cross-Module Services (Contract Implementations)
        services.AddScoped<Shared.Contracts.Finance.IFinanceInvoiceService, Application.Services.FinanceInvoiceService>();

        return services;
    }

    /// <summary>
    /// Registers Finance event consumers with MassTransit
    /// Called from API layer where MassTransit is configured
    /// </summary>
    public static void AddFinanceConsumers(IRegistrationConfigurator configurator)
    {
        // Register CRM event consumers for Finance module integration
        configurator.AddConsumer<CustomerCreatedEventConsumer>();
        configurator.AddConsumer<DealWonEventConsumer>();
    }
}
