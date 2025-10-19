using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Sales.Infrastructure.EventConsumers;
using Stocker.Modules.Stocker.Modules.Sales.Infrastructure.EventConsumers;

namespace Stocker.Modules.Sales.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddSalesInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add MassTransit with RabbitMQ
        services.AddMassTransit(x =>
        {
            // Register CRM event consumers for Sales module integration
            x.AddConsumer<CustomerCreatedEventConsumer>();
            x.AddConsumer<DealWonEventConsumer>();
            x.AddConsumer<LeadConvertedEventConsumer>();

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
                cfg.ConfigureEndpoints(context, new KebabCaseEndpointNameFormatter("sales", false));
            });
        });

        return services;
    }
}
