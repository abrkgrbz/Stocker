using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.HR.Application;
using Stocker.Modules.HR.Infrastructure;

namespace Stocker.Modules.HR;

/// <summary>
/// HR Module registration
/// </summary>
public static class HRModule
{
    /// <summary>
    /// Adds the HR module to the service collection
    /// </summary>
    public static IServiceCollection AddHRModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add Application layer
        services.AddHRApplication();

        // Add Infrastructure layer
        services.AddHRInfrastructure(configuration);

        return services;
    }
}
