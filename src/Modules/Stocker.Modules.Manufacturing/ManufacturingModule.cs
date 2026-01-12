using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Manufacturing.Application;
using Stocker.Modules.Manufacturing.Infrastructure;

namespace Stocker.Modules.Manufacturing;

/// <summary>
/// Manufacturing Module registration
/// </summary>
public static class ManufacturingModule
{
    /// <summary>
    /// Adds the Manufacturing module to the service collection
    /// </summary>
    public static IServiceCollection AddManufacturingModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add Application layer
        services.AddManufacturingApplication();

        // Add Infrastructure layer
        services.AddManufacturingInfrastructure(configuration);

        return services;
    }
}
