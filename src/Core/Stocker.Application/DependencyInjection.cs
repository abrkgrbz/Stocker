using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Application.Common.Behaviors;
using Stocker.Application.Common.Models;
using Stocker.Application.Common.Localization;
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

        // Add AutoMapper
        services.AddAutoMapper(assembly);

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
            // 1. Logging (outermost - logs the entire request/response)
            // 2. Performance monitoring
            // 3. Tenant validation (before business logic)
            // 4. Validation (innermost - validates before handler execution)
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(TenantValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

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