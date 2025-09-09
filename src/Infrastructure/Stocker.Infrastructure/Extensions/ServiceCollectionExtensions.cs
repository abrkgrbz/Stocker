using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Infrastructure.BackgroundJobs;
using Stocker.Infrastructure.BackgroundJobs.Jobs;
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
        services.AddScoped<Application.Common.Interfaces.ICurrentUserService, CurrentUserService>();
        services.AddScoped<SharedKernel.Interfaces.ICurrentUserService, CurrentUserService>();
        
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
        
        // Add Cache Service
        // Check if Redis is configured
        var redisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnection))
        {
            // Use Redis cache
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = "Stocker:";
            });
            services.AddSingleton<ITenantSettingsCacheService, RedisCacheService>();
        }
        else
        {
            // Fall back to in-memory cache
            services.AddMemoryCache();
            services.AddSingleton<ITenantSettingsCacheService, TenantSettingsCacheService>();
        }
        
        // Add Audit Service
        services.AddScoped<Services.IAuditService, Services.AuditService>();
        
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
        
        // Add Captcha Service
        services.AddHttpClient<ICaptchaService, ReCaptchaService>();
        
        // Add Memory Cache for tenant caching
        services.AddMemoryCache();

        // Add Hangfire services
        services.AddHangfireServices(configuration);
        
        // Add Hangfire initialization service
        services.AddHostedService<HangfireInitializationService>();
        
        // Register Hangfire jobs
        services.AddScoped<IEmailBackgroundJob, EmailBackgroundJob>();
        services.AddScoped<ITenantProvisioningJob, TenantProvisioningJob>();
        
        // Register Background Job Service
        services.AddScoped<IBackgroundJobService, HangfireBackgroundJobService>();

        // Add other infrastructure services here as needed

        return services;
    }
}