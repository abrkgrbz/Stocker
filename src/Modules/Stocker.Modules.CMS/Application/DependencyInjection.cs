using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Stocker.Modules.CMS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddCMSApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // AutoMapper
        services.AddAutoMapper(assembly);

        // MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
