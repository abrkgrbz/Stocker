using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Finance.Application;
using Stocker.Modules.Finance.Infrastructure;

namespace Stocker.Modules.Finance;

/// <summary>
/// Finance Module registration
/// </summary>
public static class FinanceModule
{
    /// <summary>
    /// Adds the Finance module to the service collection
    /// </summary>
    public static IServiceCollection AddFinanceModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add Application layer
        services.AddFinanceApplication();

        // Add Infrastructure layer
        services.AddFinanceInfrastructure(configuration);

        return services;
    }
}
