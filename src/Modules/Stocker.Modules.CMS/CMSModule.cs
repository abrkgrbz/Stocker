using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.CMS.Application;
using Stocker.Modules.CMS.Infrastructure;

namespace Stocker.Modules.CMS;

/// <summary>
/// CMS Module registration
/// </summary>
public static class CMSModule
{
    /// <summary>
    /// Adds the CMS module to the service collection
    /// </summary>
    public static IServiceCollection AddCMSModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add Application layer
        services.AddCMSApplication();

        // Add Infrastructure layer
        services.AddCMSInfrastructure(configuration);

        return services;
    }
}
