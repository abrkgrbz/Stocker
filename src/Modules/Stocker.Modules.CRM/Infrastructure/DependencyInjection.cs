using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.EventConsumers;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;
using Stocker.Modules.CRM.Infrastructure.Services;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.Modules.CRM.Infrastructure.Configuration;
using Stocker.Modules.CRM.Application.Contracts;
using Stocker.Modules.CRM.Application.Services.Email;
using Stocker.Modules.CRM.Application.Services.Workflows;
using Stocker.Modules.CRM.Application.Services.Templates;
using Stocker.Modules.CRM.Application.Services.Reminders;
using Stocker.Modules.CRM.Application.Features.Workflows.ActionHandlers;
using Stocker.Modules.CRM.Infrastructure.Services.Email;
using Stocker.Modules.CRM.Infrastructure.Services.Workflows;
using Stocker.Modules.CRM.Infrastructure.Services.Templates;
using Stocker.Modules.CRM.Infrastructure.Services.Reminders;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Infrastructure;

/// <summary>
/// Dependency injection configuration for CRM Infrastructure
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds CRM infrastructure services to the service collection
    /// </summary>
    public static IServiceCollection AddCRMInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // CRMDbContext is registered dynamically per request based on tenant
        // using ITenantService to get the current tenant's connection string
        // IMPORTANT: Using AddDbContext ensures single instance per scope
        services.AddDbContext<CRMDbContext>((serviceProvider, optionsBuilder) =>
        {
            var tenantService = serviceProvider.GetRequiredService<ITenantService>();
            var connectionString = tenantService.GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Tenant connection string is not available. Ensure tenant resolution middleware has run.");
            }

            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(CRMDbContext).Assembly.FullName);
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });
        }, ServiceLifetime.Scoped);

        // Register CRMUnitOfWork following Pattern A (BaseUnitOfWork)
        // MIGRATION: Changed from services.AddScoped<IUnitOfWork, CRMUnitOfWork>()
        // Now exposes ICRMUnitOfWork for strongly-typed access
        services.AddScoped<CRMUnitOfWork>();
        services.AddScoped<ICRMUnitOfWork>(sp => sp.GetRequiredService<CRMUnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<CRMUnitOfWork>());

        // Register generic repository (for entities without specific repositories like Pipeline, Opportunity, etc.)
        // CRMGenericRepository explicitly implements IRepository<>, IReadRepository<>, and IWriteRepository<>
        services.AddScoped(typeof(IRepository<>), typeof(CRMGenericRepository<>));
        services.AddScoped(typeof(IReadRepository<>), typeof(CRMGenericRepository<>));
        services.AddScoped(typeof(IWriteRepository<>), typeof(CRMGenericRepository<>));

        // IMPORTANT: Repository registrations now delegate to ICRMUnitOfWork
        // to ensure the same DbContext instance is used for both repository operations
        // and SaveChanges(). This fixes the bug where entities were added to one DbContext
        // but SaveChanges() was called on a different DbContext instance.
        //
        // Handlers can use either:
        //   - ICRMUnitOfWork.Customers (recommended for new code)
        //   - ICustomerRepository (legacy, still supported - now correctly shares DbContext)
        services.AddScoped<ICustomerRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Customers);
        services.AddScoped<IContactRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Contacts);
        services.AddScoped<ILeadRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Leads);
        services.AddScoped<IDealRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Deals);
        services.AddScoped<ICustomerSegmentRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().CustomerSegments);
        services.AddScoped<ICustomerTagRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().CustomerTags);
        services.AddScoped<IDocumentRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Documents);
        services.AddScoped<IWorkflowRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Workflows);
        services.AddScoped<IWorkflowExecutionRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().WorkflowExecutions);
        services.AddScoped<INotificationRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Notifications);
        services.AddScoped<IReminderRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Reminders);
        services.AddScoped<ICallLogRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().CallLogs);
        services.AddScoped<ICompetitorRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Competitors);
        services.AddScoped<IMeetingRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Meetings);
        services.AddScoped<IProductInterestRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().ProductInterests);
        services.AddScoped<IReferralRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Referrals);
        services.AddScoped<ISalesTeamRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().SalesTeams);
        services.AddScoped<ISocialMediaProfileRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().SocialMediaProfiles);
        services.AddScoped<ISurveyResponseRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().SurveyResponses);
        services.AddScoped<ITerritoryRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().Territories);
        services.AddScoped<ILoyaltyProgramRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().LoyaltyPrograms);
        services.AddScoped<ILoyaltyMembershipRepository>(sp => sp.GetRequiredService<ICRMUnitOfWork>().LoyaltyMemberships);

        // Register Tenant CRM Database Service
        services.AddScoped<ITenantCRMDatabaseService, TenantCRMDatabaseService>();

        // Register Segmentation Services
        services.AddScoped<Application.Segmentation.SegmentCriteriaEngine>();

        // Register MinIO Storage Configuration
        services.Configure<MinioSettings>(configuration.GetSection(MinioSettings.SectionName));

        // Register MinIO Client
        services.AddSingleton<IMinioClient>(serviceProvider =>
        {
            var settings = configuration.GetSection(MinioSettings.SectionName).Get<MinioSettings>()
                ?? throw new InvalidOperationException("MinioStorage configuration section is missing");

            return new MinioClient()
                .WithEndpoint(settings.Endpoint)
                .WithCredentials(settings.AccessKey, settings.SecretKey)
                .WithSSL(settings.UseSSL)
                .Build();
        });

        // Register Document Storage Service (MinIO)
        services.AddScoped<IDocumentStorageService, MinioDocumentStorageService>();

        // Register Email Service (SMTP)
        services.AddScoped<IEmailService, SmtpEmailService>();

        // Register Template Service (Liquid)
        services.AddSingleton<ITemplateService, LiquidTemplateService>();

        // Register Workflow Execution Services
        services.AddScoped<IWorkflowExecutionService, WorkflowExecutionService>();

        // Register Workflow Action Handlers
        services.AddScoped<IWorkflowActionHandler, SendEmailActionHandler>();

        // Register Reminder Service
        services.AddScoped<IReminderService, ReminderService>();

        // Register Cross-Module Services (Contract Implementations)
        services.AddScoped<Shared.Contracts.CRM.ICrmCustomerService, Application.Services.CrmCustomerService>();
        services.AddScoped<Shared.Contracts.CRM.ICrmDealService, Application.Services.CrmDealService>();
        services.AddScoped<Shared.Contracts.CRM.ICrmLeadService, Application.Services.CrmLeadService>();

        return services;
    }

    /// <summary>
    /// Registers CRM event consumers with MassTransit
    /// Called from API layer where MassTransit is configured
    /// </summary>
    public static void AddCRMConsumers(IRegistrationConfigurator configurator)
    {
        configurator.AddConsumer<CustomerCreatedEventConsumer>();
        configurator.AddConsumer<CustomerUpdatedEventConsumer>();
        configurator.AddConsumer<DealWonEventConsumer>();
    }
}