using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Inventory.Application;
using Stocker.Modules.Inventory.Infrastructure;

namespace Stocker.Modules.Inventory;

/// <summary>
/// Inventory Module registration
/// </summary>
public static class InventoryModule
{
    /// <summary>
    /// Adds the Inventory module to the service collection
    /// </summary>
    public static IServiceCollection AddInventoryModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add Application layer
        services.AddInventoryApplication();

        // Add Infrastructure layer
        services.AddInventoryInfrastructure(configuration);

        return services;
    }
}
