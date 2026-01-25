using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Stocker.Modules.Finance.Application;

/// <summary>
/// Dependency injection configuration for Finance Application layer
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddFinanceApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        // Register MediatR handlers from this assembly
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Register FluentValidation validators from this assembly
        services.AddValidatorsFromAssembly(assembly);

        // Note: AutoMapper is registered centrally in Program.cs to avoid profile conflicts

        return services;
    }
}
