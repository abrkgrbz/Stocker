using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
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
            
            // Configure timeouts
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(60);
            options.HandshakeTimeout = TimeSpan.FromSeconds(15);
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            
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
        
        // Add SignalR user ID provider for authentication
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

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