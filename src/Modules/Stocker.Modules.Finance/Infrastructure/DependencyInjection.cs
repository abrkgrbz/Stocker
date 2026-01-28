using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.Modules.Finance.Domain.Services;
using Stocker.Modules.Finance.Infrastructure.EventConsumers;
using Stocker.Modules.Finance.Infrastructure.BackgroundJobs;
using Stocker.Modules.Finance.Infrastructure.Persistence;
using Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;
using Stocker.Modules.Finance.Infrastructure.Services;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Finance.Infrastructure;

/// <summary>
/// Dependency injection configuration for Finance Infrastructure
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddFinanceInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // FinanceDbContext is registered dynamically per request based on tenant
        // Supports both HTTP context (via ITenantService) and background jobs (via IBackgroundTenantService)
        services.AddDbContext<FinanceDbContext>((serviceProvider, optionsBuilder) =>
        {
            string? connectionString = null;

            // First try IBackgroundTenantService (for MassTransit consumers and background jobs)
            var backgroundTenantService = serviceProvider.GetService<IBackgroundTenantService>();
            if (backgroundTenantService != null)
            {
                connectionString = backgroundTenantService.GetConnectionString();
            }

            // Fall back to ITenantService (for HTTP requests)
            if (string.IsNullOrEmpty(connectionString))
            {
                var tenantService = serviceProvider.GetService<ITenantService>();
                connectionString = tenantService?.GetConnectionString();
            }

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Tenant connection string is not available. Ensure tenant resolution middleware has run or BackgroundTenantService is configured.");
            }

            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(FinanceDbContext).Assembly.FullName);
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });
        }, ServiceLifetime.Scoped);

        // Register FinanceUnitOfWork following Pattern A (BaseUnitOfWork)
        services.AddScoped<FinanceUnitOfWork>();
        services.AddScoped<IFinanceUnitOfWork>(sp => sp.GetRequiredService<FinanceUnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<FinanceUnitOfWork>());

        // Register generic repository (for entities without specific repositories)
        services.AddScoped(typeof(IFinanceRepository<>), typeof(FinanceGenericRepository<>));
        services.AddScoped(typeof(IRepository<>), typeof(FinanceGenericRepository<>));
        services.AddScoped(typeof(IReadRepository<>), typeof(FinanceGenericRepository<>));
        services.AddScoped(typeof(IWriteRepository<>), typeof(FinanceGenericRepository<>));

        // Repository registrations delegate to IFinanceUnitOfWork
        // to ensure the same DbContext instance is used for both repository operations
        // and SaveChanges().
        services.AddScoped<ICurrentAccountRepository>(sp => sp.GetRequiredService<IFinanceUnitOfWork>().CurrentAccounts);
        services.AddScoped<IInvoiceRepository>(sp => sp.GetRequiredService<IFinanceUnitOfWork>().Invoices);
        services.AddScoped<IExpenseRepository>(sp => sp.GetRequiredService<IFinanceUnitOfWork>().Expenses);
        services.AddScoped<IPaymentRepository>(sp => sp.GetRequiredService<IFinanceUnitOfWork>().Payments);

        // Register Cross-Module Services (Contract Implementations)
        services.AddScoped<Shared.Contracts.Finance.IFinanceInvoiceService, Application.Services.FinanceInvoiceService>();
        services.AddScoped<Shared.Contracts.Finance.ICurrencyRateService, Application.Services.CurrencyRateService>();

        // Register Domain Services
        services.AddScoped<ITaxCalculationService, TaxCalculationService>();
        services.AddScoped<IInvoiceNumberGenerator, InvoiceNumberGenerator>();
        services.AddScoped<ICurrentAccountTransactionService, CurrentAccountTransactionService>();

        // Register Hangfire Background Jobs
        services.AddScoped<InvoiceDueDateReminderJob>();

        return services;
    }

    /// <summary>
    /// Registers Finance event consumers with MassTransit
    /// Called from API layer where MassTransit is configured
    /// </summary>
    public static void AddFinanceConsumers(IRegistrationConfigurator configurator)
    {
        // Register CRM event consumers for Finance module integration
        configurator.AddConsumer<CustomerCreatedEventConsumer>();
        configurator.AddConsumer<DealWonEventConsumer>();
    }

    /// <summary>
    /// Schedules Finance module recurring Hangfire jobs.
    /// Called from HangfireConfiguration after Hangfire is initialized.
    /// </summary>
    public static void ScheduleFinanceJobs()
    {
        // Invoice due date reminder - runs daily at 09:00 UTC
        InvoiceDueDateReminderJob.Schedule();
    }
}
