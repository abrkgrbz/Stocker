using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Stocker.Modules.HR.Application;

/// <summary>
/// Dependency injection configuration for HR Application
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds HR application services to the service collection
    /// </summary>
    public static IServiceCollection AddHRApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Add MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Add FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
