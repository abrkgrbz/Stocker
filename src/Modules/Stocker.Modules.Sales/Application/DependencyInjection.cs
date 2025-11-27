using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using Stocker.Modules.Sales.Application.Mappings;

namespace Stocker.Modules.Sales.Application;

/// <summary>
/// Dependency injection configuration for Sales Application
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Sales application services to the service collection
    /// </summary>
    public static IServiceCollection AddSalesApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Add MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Add FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Add AutoMapper
        services.AddAutoMapper(typeof(SalesProfile));

        return services;
    }
}
