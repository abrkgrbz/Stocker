using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Inventory.Application.Behaviors;
using System.Reflection;

namespace Stocker.Modules.Inventory.Application;

/// <summary>
/// Dependency injection configuration for Inventory Application
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Inventory application services to the service collection
    /// </summary>
    public static IServiceCollection AddInventoryApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Add MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Add FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Add Idempotency pipeline behavior
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(IdempotencyBehavior<,>));

        return services;
    }
}
