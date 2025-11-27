using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Sales.Application;
using Stocker.Modules.Sales.Infrastructure;

namespace Stocker.Modules.Sales;

/// <summary>
/// Sales Module registration
/// </summary>
public static class SalesModule
{
    /// <summary>
    /// Adds the Sales module to the service collection
    /// </summary>
    public static IServiceCollection AddSalesModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add Application layer
        services.AddSalesApplication();

        // Add Infrastructure layer
        services.AddSalesInfrastructure(configuration);

        return services;
    }
}
