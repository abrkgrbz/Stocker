using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Stocker.Modules.Purchase.Application;

/// <summary>
/// Dependency injection configuration for Purchase Application
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Purchase application services to the service collection
    /// </summary>
    public static IServiceCollection AddPurchaseApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Add MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Add FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Note: AutoMapper is registered centrally in Program.cs to avoid profile conflicts

        return services;
    }
}
