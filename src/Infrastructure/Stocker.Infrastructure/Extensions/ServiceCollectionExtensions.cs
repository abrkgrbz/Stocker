using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Infrastructure.Middleware;
using Stocker.Infrastructure.Services;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Current User Service
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        
        // Add Date Time Service
        services.AddScoped<IDateTimeService, DateTimeService>();
        
        // Add JWT Service
        services.AddScoped<IJwtService, JwtService>();

        // Add Tenant Resolution Service
        services.AddScoped<ITenantResolverService, TenantResolverService>();
        
        // Add Authentication Service Adapter
        services.AddScoped<IAuthenticationService, AuthenticationServiceAdapter>();
        
        // Add Memory Cache for tenant caching
        services.AddMemoryCache();

        // Add other infrastructure services here as needed

        return services;
    }
}