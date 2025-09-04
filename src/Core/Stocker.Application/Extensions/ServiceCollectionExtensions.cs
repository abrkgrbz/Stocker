using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using Stocker.Application.Common.Behaviors;
using System; 

namespace Stocker.Application.Extensions;

[Obsolete("Use AddApplication() extension method from Stocker.Application namespace instead. This method will be removed in the next major version.")]
public static class ServiceCollectionExtensions
{
    [Obsolete("Use AddApplication() extension method from Stocker.Application namespace instead. This method will be removed in the next major version.")]
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Add MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Add FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Add AutoMapper - using specific package to avoid ambiguity
        services.AddSingleton<AutoMapper.IConfigurationProvider>(sp =>
            new AutoMapper.MapperConfiguration(cfg => cfg.AddMaps(assembly)));
        services.AddScoped<AutoMapper.IMapper>(sp =>
            new AutoMapper.Mapper(sp.GetRequiredService<AutoMapper.IConfigurationProvider>()));

        // Add CQRS Pipeline Behaviors
        // NOTE: These are now registered via MediatR configuration in AddApplication()
        // Keeping these here temporarily for backward compatibility
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(TenantValidationBehavior<,>));

        return services;
    }
}