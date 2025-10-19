using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.EventConsumers;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;
using Stocker.Modules.CRM.Infrastructure.Services;
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
        // Add DbContext
        services.AddDbContext<CRMDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("TenantConnection") 
                ?? configuration.GetConnectionString("DefaultConnection");
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(typeof(CRMDbContext).Assembly.FullName);
                sqlOptions.CommandTimeout(30);
            });
        });

        // Register repositories
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<ILeadRepository, LeadRepository>();
        services.AddScoped<IDealRepository, DealRepository>();

        // Register UnitOfWork
        services.AddScoped<IUnitOfWork, CRMUnitOfWork>();

        // Register Tenant CRM Database Service
        services.AddScoped<ITenantCRMDatabaseService, TenantCRMDatabaseService>();

        // Add MassTransit with RabbitMQ
        services.AddMassTransit(x =>
        {
            // Register event consumers
            x.AddConsumer<CustomerCreatedEventConsumer>();
            x.AddConsumer<CustomerUpdatedEventConsumer>();
            x.AddConsumer<DealWonEventConsumer>();

            x.UsingRabbitMq((context, cfg) =>
            {
                var rabbitMqHost = configuration.GetValue<string>("RabbitMQ:Host") ?? "localhost";
                var rabbitMqVirtualHost = configuration.GetValue<string>("RabbitMQ:VirtualHost") ?? "/";
                var rabbitMqUsername = configuration.GetValue<string>("RabbitMQ:Username") ?? "guest";
                var rabbitMqPassword = configuration.GetValue<string>("RabbitMQ:Password") ?? "guest";
                var retryCount = configuration.GetValue<int>("RabbitMQ:RetryCount");
                var retryInterval = configuration.GetValue<int>("RabbitMQ:RetryInterval");

                cfg.Host(rabbitMqHost, rabbitMqVirtualHost, h =>
                {
                    h.Username(rabbitMqUsername);
                    h.Password(rabbitMqPassword);

                    // Connection resilience
                    h.RequestedConnectionTimeout(TimeSpan.FromSeconds(30));
                    h.Heartbeat(TimeSpan.FromSeconds(60));
                });

                // Global retry policy with exponential backoff
                cfg.UseMessageRetry(r =>
                {
                    r.Exponential(retryCount,
                        TimeSpan.FromSeconds(retryInterval),
                        TimeSpan.FromSeconds(retryInterval * 10),
                        TimeSpan.FromSeconds(retryInterval));

                    // Only retry on specific exceptions
                    r.Ignore<ArgumentNullException>();
                    r.Ignore<InvalidOperationException>();
                });

                // Circuit breaker to prevent cascading failures
                cfg.UseCircuitBreaker(cb =>
                {
                    cb.TrackingPeriod = TimeSpan.FromMinutes(1);
                    cb.TripThreshold = 15;
                    cb.ActiveThreshold = 10;
                    cb.ResetInterval = TimeSpan.FromMinutes(5);
                });

                // Dead letter queue configuration
                cfg.UseDelayedRedelivery(r => r.Intervals(
                    TimeSpan.FromSeconds(5),
                    TimeSpan.FromSeconds(15),
                    TimeSpan.FromSeconds(30)));

                // Configure message TTL and error handling
                cfg.ConfigureEndpoints(context, new KebabCaseEndpointNameFormatter("crm", false));
            });
        });

        return services;
    }
}