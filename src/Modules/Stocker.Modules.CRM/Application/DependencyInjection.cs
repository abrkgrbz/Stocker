using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Stocker.Modules.CRM.Application;

/// <summary>
/// Dependency injection configuration for CRM Application
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds CRM application services to the service collection
    /// </summary>
    public static IServiceCollection AddCRMApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Add MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Add FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Validation behavior is already registered in the main application
        // No need to register it again here

        return services;
    }
}