using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Application.Common.Behaviors;
using Stocker.Application.Common.Models;
using Stocker.Application.Common.Localization;
using Stocker.Application.Services;
using System.Reflection;
using System.Globalization;
// Alias for settings from SharedKernel
using DatabaseSettings = Stocker.SharedKernel.Settings.DatabaseSettings;
using AdminCredentials = Stocker.SharedKernel.Settings.AdminCredentials;
using EmailSettings = Stocker.SharedKernel.Settings.EmailSettings;
using StorageSettings = Stocker.SharedKernel.Settings.StorageSettings;
using ExternalApiSettings = Stocker.SharedKernel.Settings.ExternalApiSettings;

namespace Stocker.Application;

public static class DependencyInjection
{
    /// <summary>
    /// Registers all application layer services including MediatR, FluentValidation, and AutoMapper
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Add Configuration Models
        services.Configure<DatabaseSettings>(configuration.GetSection("DatabaseSettings"));
        services.Configure<AdminCredentials>(configuration.GetSection("AdminCredentials"));
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        services.Configure<StorageSettings>(configuration.GetSection("StorageSettings"));
        services.Configure<ExternalApiSettings>(configuration.GetSection("ExternalApiKeys"));

        // Add AutoMapper - using specific package to avoid ambiguity
        services.AddSingleton<AutoMapper.IConfigurationProvider>(sp =>
            new AutoMapper.MapperConfiguration(cfg => cfg.AddMaps(assembly)));
        services.AddScoped<AutoMapper.IMapper>(sp =>
            new AutoMapper.Mapper(sp.GetRequiredService<AutoMapper.IConfigurationProvider>()));

        // Add FluentValidation with Turkish language
        services.AddValidatorsFromAssembly(assembly);
        
        // Set Turkish as default language for validation messages
        ValidatorOptions.Global.LanguageManager = new TurkishLanguageManager();
        ValidatorOptions.Global.DefaultClassLevelCascadeMode = CascadeMode.Continue;
        ValidatorOptions.Global.DefaultRuleLevelCascadeMode = CascadeMode.Stop;

        // Add MediatR with pipeline behaviors
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);

            // Register behaviors in the correct order - they execute in reverse order of registration
            // Execution order (reverse of registration):
            // 1. Logging (outermost - logs the entire request/response)
            // 2. Performance monitoring
            // 3. Caching (checks cache before proceeding)
            // 4. Tenant validation (validates tenant authorization)
            // 5. Tenant enrichment (sets TenantId from current user) - MUST RUN BEFORE VALIDATION
            // 6. Validation (innermost - validates before handler execution)
            // 7. Cache invalidation (after handler - invalidates cache on mutations)
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CachingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(TenantEnrichmentBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(TenantValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CacheInvalidationBehavior<,>));
        });

        // Add Application Services
        services.AddScoped<IModuleActivationService, ModuleActivationService>();

        return services;
    }
    
    /// <summary>
    /// Registers application layer services without configuration (for backwards compatibility)
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var configuration = services.BuildServiceProvider().GetRequiredService<IConfiguration>();
        return services.AddApplication(configuration);
    }
}