using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using Stocker.Modules.Purchase.Application.Mappings;

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

        // Add AutoMapper
        services.AddAutoMapper(typeof(PurchaseProfile));

        return services;
    }
}
