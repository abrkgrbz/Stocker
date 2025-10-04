using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Application.Interfaces.Notifications;
using Stocker.SignalR.Hubs;
using Stocker.SignalR.Services;

namespace Stocker.SignalR.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSignalRServices(this IServiceCollection services)
    {
        // Add SignalR with configuration
        services.AddSignalR(options =>
        {
            // Enable detailed errors in development
            options.EnableDetailedErrors = true;
            
            // Configure timeouts - Increased for better stability
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(120); // Increased from 60
            options.HandshakeTimeout = TimeSpan.FromSeconds(30); // Increased from 15
            options.KeepAliveInterval = TimeSpan.FromSeconds(30); // Increased from 15 to prevent disconnections
            
            // Configure message size limits
            options.MaximumReceiveMessageSize = 32 * 1024; // 32KB
            options.StreamBufferCapacity = 10;
        })
        .AddJsonProtocol(options =>
        {
            // Configure JSON serialization
            options.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        })
        .AddMessagePackProtocol(); // Add MessagePack for better performance

        // Register SignalR services
        services.AddSingleton<IConnectionManager, ConnectionManager>();
        services.AddScoped<INotificationService, NotificationService>();

        // Register tenant notification service for real-time notifications
        services.AddScoped<ITenantNotificationService, SignalRTenantNotificationService>();

        // Add SignalR user ID provider for authentication
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

        // Register MediatR handlers from this assembly (for domain event handlers)
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ServiceCollectionExtensions).Assembly));

        return services;
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