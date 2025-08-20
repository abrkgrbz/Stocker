using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Infrastructure.Middleware;
using Stocker.Infrastructure.Services;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Settings;

namespace Stocker.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration, IHostEnvironment? environment = null)
    {
        // Configure settings
        services.Configure<PasswordPolicy>(configuration.GetSection("PasswordPolicy"));
        
        // Add Current User Service
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        
        // Add Date Time Service
        services.AddScoped<IDateTimeService, DateTimeService>();
        
        // Add JWT Service
        services.AddScoped<IJwtService, JwtService>();
        
        // Add Token Service
        services.AddScoped<ITokenService, TokenService>();

        // Add Tenant Resolution Service
        services.AddScoped<ITenantResolverService, TenantResolverService>();
        
        // Add Authentication Service Adapter
        services.AddScoped<IAuthenticationService, AuthenticationServiceAdapter>();
        
        // Add Validation Service
        services.AddScoped<IValidationService, ValidationService>();
        
        // Add Email Service
        // Use DevelopmentEmailService in Development, EmailService in Production
        var isDevelopment = environment?.IsDevelopment() ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
        if (isDevelopment)
        {
            services.AddScoped<IEmailService, DevelopmentEmailService>();
        }
        else
        {
            services.AddScoped<IEmailService, EmailService>();
        }
        
        // Add Memory Cache for tenant caching
        services.AddMemoryCache();

        // Add other infrastructure services here as needed

        return services;
    }
}