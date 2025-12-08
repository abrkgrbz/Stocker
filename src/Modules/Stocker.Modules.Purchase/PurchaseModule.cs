using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Purchase.Application;
using Stocker.Modules.Purchase.Infrastructure;

namespace Stocker.Modules.Purchase;

/// <summary>
/// Purchase Module registration
/// </summary>
public static class PurchaseModule
{
    /// <summary>
    /// Adds the Purchase module to the service collection
    /// </summary>
    public static IServiceCollection AddPurchaseModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add Application layer
        services.AddPurchaseApplication();

        // Add Infrastructure layer
        services.AddPurchaseInfrastructure(configuration);

        return services;
    }
}
