using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Inventory.Infrastructure.EventConsumers;

namespace Stocker.Modules.Inventory.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInventoryInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register Cross-Module Services (Contract Implementations)
        services.AddScoped<Shared.Contracts.Inventory.IInventoryService, Application.Services.InventoryService>();

        return services;
    }

    /// <summary>
    /// Registers Inventory event consumers with MassTransit
    /// Called from API layer where MassTransit is configured
    /// </summary>
    public static void AddInventoryConsumers(IRegistrationConfigurator configurator)
    {
        // Register event consumers
        configurator.AddConsumer<DealWonEventConsumer>();
    }
}
