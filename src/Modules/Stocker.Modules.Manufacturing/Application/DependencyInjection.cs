using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Manufacturing.Application.Services;
using Stocker.Shared.Contracts.Manufacturing;
using System.Reflection;

namespace Stocker.Modules.Manufacturing.Application;

/// <summary>
/// Dependency injection configuration for Manufacturing Application
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Manufacturing application services to the service collection
    /// </summary>
    public static IServiceCollection AddManufacturingApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Add MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Add FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Add Application Services (Cross-module integration)
        services.AddScoped<IManufacturingService, ManufacturingService>();

        // Validation behavior is already registered in the main application
        // No need to register it again here

        return services;
    }
}
