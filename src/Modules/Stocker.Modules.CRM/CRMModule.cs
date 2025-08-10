using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.CRM.Application;
using Stocker.Modules.CRM.Infrastructure;

namespace Stocker.Modules.CRM;

/// <summary>
/// CRM Module registration
/// </summary>
public static class CRMModule
{
    /// <summary>
    /// Adds the CRM module to the service collection
    /// </summary>
    public static IServiceCollection AddCRMModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add Application layer
        services.AddCRMApplication();

        // Add Infrastructure layer
        services.AddCRMInfrastructure(configuration);

        return services;
    }
}