using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using Stocker.Application.Common.Interfaces;
using Stocker.Infrastructure.Services;

namespace Stocker.Infrastructure.Extensions;

public static class CacheServiceExtensions
{
    public static IServiceCollection AddCacheServices(this IServiceCollection services, IConfiguration configuration)
    {
        var redisConnection = configuration.GetConnectionString("Redis");
        
        if (!string.IsNullOrEmpty(redisConnection))
        {
            // Redis cache configuration
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = "Stocker:";
            });

            // Add Redis multiplexer for direct Redis operations
            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var configurationOptions = ConfigurationOptions.Parse(redisConnection);
                configurationOptions.AbortOnConnectFail = false;
                configurationOptions.ConnectRetry = 3;
                configurationOptions.ConnectTimeout = 5000;
                configurationOptions.SyncTimeout = 5000;
                configurationOptions.AsyncTimeout = 5000;
                return ConnectionMultiplexer.Connect(configurationOptions);
            });

            // Register cache service
            services.AddSingleton<ICacheService, RedisCacheService>();
            services.AddSingleton<ITenantSettingsCacheService, RedisCacheService>();
        }
        else
        {
            // In-memory cache as fallback
            services.AddDistributedMemoryCache(); // Required for IDistributedCache
            services.AddMemoryCache();
            services.AddSingleton<ICacheService, InMemoryCacheService>();
            services.AddSingleton<ITenantSettingsCacheService, InMemoryCacheService>();
        }

        return services;
    }
}