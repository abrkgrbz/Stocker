using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Minio;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Infrastructure.BackgroundJobs;
using Stocker.Infrastructure.BackgroundJobs.Jobs;
using Stocker.Infrastructure.Configuration;
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
        services.AddScoped<IDateTime, DateTimeService>();
        
        // Add Encryption Service with Data Protection
        services.AddDataProtection()
            .SetApplicationName("Stocker.ERP")
            .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(Directory.GetCurrentDirectory(), "keys")));
        services.AddSingleton<IEncryptionService, EncryptionService>();
        
        // Add JWT Service
        services.AddScoped<IJwtService, JwtService>();

        // Add Token Service
        services.AddScoped<ITokenService, TokenService>();

        // Add HMAC Service (for data integrity and authentication)
        services.AddSingleton<IHmacService, HmacService>();

        // Add Tenant Resolution Service
        services.AddScoped<ITenantResolverService, TenantResolverService>();

        // Add Authentication Service Adapter
        services.AddScoped<IAuthenticationService, AuthenticationServiceAdapter>();
        
        // Add Validation Service
        services.AddScoped<IValidationService, ValidationService>();
        
        // Add Cache Services (Redis or In-Memory)
        services.AddCacheServices(configuration);
        
        // Add Audit Service
        services.AddScoped<Services.IAuditService, Services.AuditService>();

        // Add Security Audit Service
        services.AddScoped<ISecurityAuditService, SecurityAuditService>();

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
        
        // Add Payment Service
        services.AddHttpClient("Iyzico");
        services.AddScoped<IPaymentService, PaymentService>();

        // Add Docker Management Service
        services.AddScoped<IDockerManagementService, DockerManagementService>();

        // Add Memory Cache for tenant caching
        services.AddMemoryCache();

        // Add MinIO Storage Services
        services.AddMinioStorageServices(configuration);

        // Add Hangfire services (skip in Testing environment)
        var isTestingEnvironment = environment?.EnvironmentName?.Equals("Testing", StringComparison.OrdinalIgnoreCase) ?? false;
        if (!isTestingEnvironment)
        {
            services.AddHangfireServices(configuration);
            
            // Add Hangfire initialization service
            services.AddHostedService<HangfireInitializationService>();
            
            // Register Hangfire jobs
            services.AddScoped<IEmailBackgroundJob, EmailBackgroundJob>();
            services.AddScoped<ITenantProvisioningJob, TenantProvisioningJob>();
            
            // Register Background Job Service
            services.AddScoped<IBackgroundJobService, HangfireBackgroundJobService>();
        }
        else
        {
            // Register a mock background job service for testing
            services.AddScoped<IBackgroundJobService, MockBackgroundJobService>();
        }

        // Add other infrastructure services here as needed

        return services;
    }

    /// <summary>
    /// Adds MinIO storage services for tenant bucket and quota management
    /// </summary>
    private static IServiceCollection AddMinioStorageServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure MinIO settings
        services.Configure<MinioStorageSettings>(configuration.GetSection(MinioStorageSettings.SectionName));

        // Register MinIO client as singleton
        services.AddSingleton<IMinioClient>(sp =>
        {
            var settings = sp.GetRequiredService<IOptions<MinioStorageSettings>>().Value;

            var minioClient = new MinioClient()
                .WithEndpoint(settings.Endpoint)
                .WithCredentials(settings.AccessKey, settings.SecretKey);

            if (settings.UseSSL)
            {
                minioClient.WithSSL();
            }

            return minioClient.Build();
        });

        // Add HttpClient for MinIO Admin API operations
        services.AddHttpClient("MinioAdmin", (sp, client) =>
        {
            var settings = sp.GetRequiredService<IOptions<MinioStorageSettings>>().Value;
            var adminEndpoint = settings.AdminEndpoint ?? settings.Endpoint;
            var protocol = settings.UseSSL ? "https" : "http";
            client.BaseAddress = new Uri($"{protocol}://{adminEndpoint}");
        });

        // Register Tenant Storage Service
        services.AddScoped<ITenantStorageService, MinioTenantStorageService>();

        return services;
    }
}