using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Interfaces.Notifications;
using Stocker.SignalR.Configuration;
using Stocker.SignalR.Health;
using Stocker.SignalR.Hubs;
using Stocker.SignalR.Services;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.SignalR.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds SignalR services with default configuration.
    /// </summary>
    public static IServiceCollection AddSignalRServices(this IServiceCollection services)
    {
        return services.AddSignalRServices(null);
    }

    /// <summary>
    /// Adds SignalR services with configuration from appsettings.
    /// </summary>
    public static IServiceCollection AddSignalRServices(
        this IServiceCollection services,
        IConfiguration? configuration)
    {
        // Bind configuration options
        var signalROptions = new SignalROptions();
        configuration?.GetSection(SignalROptions.SectionName).Bind(signalROptions);
        services.Configure<SignalROptions>(opts =>
        {
            configuration?.GetSection(SignalROptions.SectionName).Bind(opts);
        });

        // Bind rate limiting options
        services.Configure<SignalRRateLimitOptions>(opts =>
        {
            configuration?.GetSection(SignalRRateLimitOptions.SectionName).Bind(opts);
        });

        // Add SignalR with configuration
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = signalROptions.EnableDetailedErrors;
            options.ClientTimeoutInterval = signalROptions.GetClientTimeout();
            options.HandshakeTimeout = signalROptions.GetHandshakeTimeout();
            options.KeepAliveInterval = signalROptions.GetKeepAliveInterval();
            options.MaximumReceiveMessageSize = signalROptions.MaximumReceiveMessageSize;
            options.StreamBufferCapacity = signalROptions.StreamBufferCapacity;
            options.MaximumParallelInvocationsPerClient = signalROptions.MaximumParallelInvocationsPerClient;
        })
        .AddJsonProtocol(options =>
        {
            options.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        })
        .AddMessagePackProtocol();

        // Register core SignalR services
        services.AddSingleton<IConnectionManager, ConnectionManager>();

        // Register notification services with Interface Segregation
        services.AddScoped<NotificationService>();
        services.AddScoped<Services.Interfaces.INotificationService>(sp => sp.GetRequiredService<NotificationService>());
        services.AddScoped<IUserNotificationService>(sp => sp.GetRequiredService<NotificationService>());
        services.AddScoped<IBroadcastNotificationService>(sp => sp.GetRequiredService<NotificationService>());
        services.AddScoped<IGroupNotificationService>(sp => sp.GetRequiredService<NotificationService>());
        services.AddScoped<IRoleNotificationService>(sp => sp.GetRequiredService<NotificationService>());
        // Register ITenantNotificationService from SignalR.Services.Interfaces namespace (used by BackupNotificationService)
        services.AddScoped<Services.Interfaces.ITenantNotificationService>(sp => sp.GetRequiredService<NotificationService>());

        // Register tenant notification service for real-time notifications (from Application layer)
        services.AddScoped<Application.Interfaces.Notifications.ITenantNotificationService, SignalRTenantNotificationService>();

        // Register tenant creation progress service
        services.AddScoped<ITenantCreationProgressService, TenantCreationProgressService>();

        // Register setup progress notifier for real-time setup updates
        services.AddScoped<ISetupProgressNotifier, SetupProgressNotifier>();

        // Register state management services
        services.AddSingleton<IUserConnectionStateManager, InMemoryUserConnectionStateManager>();
        services.AddSingleton(typeof(IHubStateManager<,>), typeof(InMemoryHubStateManager<,>));
        services.AddSingleton(typeof(IRoomStateManager<>), typeof(InMemoryRoomStateManager<>));

        // Register rate limiting service
        services.AddSingleton<ISignalRRateLimiter, SignalRRateLimiter>();

        // Add SignalR user ID provider for authentication
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

        // Register MediatR handlers from this assembly (for domain event handlers)
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ServiceCollectionExtensions).Assembly));

        return services;
    }

    /// <summary>
    /// Adds SignalR health checks.
    /// </summary>
    public static IHealthChecksBuilder AddSignalRHealthChecks(this IHealthChecksBuilder builder)
    {
        builder.AddCheck<SignalRHealthCheck>("signalr", tags: new[] { "signalr", "realtime" });
        builder.AddCheck<DetailedSignalRHealthCheck>("signalr-detailed", tags: new[] { "signalr", "detailed" });
        return builder;
    }

    public static IServiceCollection AddSignalRRedis(this IServiceCollection services, string connectionString)
    {
        // Add Redis backplane for scale-out scenarios
        services.AddSignalR().AddStackExchangeRedis(connectionString, options =>
        {
            options.Configuration.ChannelPrefix = "Stocker";
        });

        return services;
    }
}