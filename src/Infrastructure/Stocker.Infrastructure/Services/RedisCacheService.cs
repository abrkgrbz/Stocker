using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs;
using System.Text.Json;
using Stocker.SharedKernel.Exceptions;
using StackExchange.Redis;

namespace Stocker.Infrastructure.Services;

public class RedisCacheService : ICacheService, ITenantSettingsCacheService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<RedisCacheService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly DistributedCacheEntryOptions _defaultOptions;

    public RedisCacheService(
        IDistributedCache cache,
        ILogger<RedisCacheService> logger)
    {
        _cache = cache;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        _defaultOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15),
            SlidingExpiration = TimeSpan.FromMinutes(5)
        };
    }

    public async Task<T?> GetAsync<T>(string key, Guid tenantId)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        
        try
        {
            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (cachedData != null)
            {
                _logger.LogDebug("Redis cache hit for key: {CacheKey}", cacheKey);
                return JsonSerializer.Deserialize<T>(cachedData, _jsonOptions);
            }
            
            _logger.LogDebug("Redis cache miss for key: {CacheKey}", cacheKey);
            return default;
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error getting value from Redis for key: {CacheKey}", cacheKey);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, Guid tenantId, T value, TimeSpan? expiry = null)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        
        try
        {
            var options = new DistributedCacheEntryOptions();
            if (expiry.HasValue)
            {
                options.AbsoluteExpirationRelativeToNow = expiry;
            }
            else
            {
                options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
                options.SlidingExpiration = TimeSpan.FromMinutes(5);
            }

            var serializedData = JsonSerializer.Serialize(value, _jsonOptions);
            await _cache.SetStringAsync(cacheKey, serializedData, options);
            
            _logger.LogDebug("Cached value in Redis for key: {CacheKey}", cacheKey);
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error setting value in Redis for key: {CacheKey}", cacheKey);
        }
    }

    public async Task RemoveAsync(string key, Guid tenantId)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        
        try
        {
            await _cache.RemoveAsync(cacheKey);
            _logger.LogDebug("Removed from Redis cache: {CacheKey}", cacheKey);
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error removing from Redis for key: {CacheKey}", cacheKey);
        }
    }

    public async Task RemoveAllForTenantAsync(Guid tenantId)
    {
        // Redis doesn't support wildcard removal directly via IDistributedCache
        // You would need to use StackExchange.Redis directly for pattern matching
        
        // For now, remove known keys
        var settingsCacheKey = GenerateSettingsCacheKey(tenantId);
        await _cache.RemoveAsync(settingsCacheKey);
        
        var categories = new[] { "Genel", "Güvenlik", "E-posta", "Fatura", "Yerelleştirme" };
        foreach (var category in categories)
        {
            var categoryCacheKey = GenerateSettingsCacheKey(tenantId, category);
            await _cache.RemoveAsync(categoryCacheKey);
        }
        
        _logger.LogDebug("Removed all cache entries for tenant: {TenantId}", tenantId);
    }

    public async Task<List<SettingDto>?> GetSettingsAsync(Guid tenantId, string? category = null)
    {
        var cacheKey = GenerateSettingsCacheKey(tenantId, category);
        
        try
        {
            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (cachedData != null)
            {
                _logger.LogDebug("Settings cache hit in Redis for tenant: {TenantId}, category: {Category}", 
                    tenantId, category ?? "all");
                return JsonSerializer.Deserialize<List<SettingDto>>(cachedData, _jsonOptions);
            }
            
            _logger.LogDebug("Settings cache miss in Redis for tenant: {TenantId}, category: {Category}", 
                tenantId, category ?? "all");
            return null;
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error getting settings from Redis for tenant: {TenantId}", tenantId);
            return null;
        }
    }

    public async Task SetSettingsAsync(Guid tenantId, List<SettingDto> settings, string? category = null)
    {
        var cacheKey = GenerateSettingsCacheKey(tenantId, category);
        
        try
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30),
                SlidingExpiration = TimeSpan.FromMinutes(10)
            };
            
            var serializedData = JsonSerializer.Serialize(settings, _jsonOptions);
            await _cache.SetStringAsync(cacheKey, serializedData, options);
            
            _logger.LogDebug("Cached {Count} settings in Redis for tenant: {TenantId}, category: {Category}", 
                settings.Count, tenantId, category ?? "all");
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error setting settings in Redis for tenant: {TenantId}", tenantId);
        }
    }

    public async Task InvalidateSettingsAsync(Guid tenantId)
    {
        await RemoveAllForTenantAsync(tenantId);
        _logger.LogInformation("Invalidated all settings cache in Redis for tenant: {TenantId}", tenantId);
    }

    public async Task ClearTenantSettingsAsync(Guid tenantId)
    {
        await RemoveAllForTenantAsync(tenantId);
        _logger.LogInformation("Cleared all settings cache in Redis for tenant: {TenantId}", tenantId);
    }

    public async Task InvalidateSettingAsync(Guid tenantId, string settingKey)
    {
        var cacheKey = GenerateCacheKey(settingKey, tenantId);
        await _cache.RemoveAsync(cacheKey);
        _logger.LogDebug("Invalidated setting cache in Redis for tenant: {TenantId}, key: {SettingKey}", tenantId, settingKey);
    }

    #region ICacheService Implementation

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var cachedData = await _cache.GetStringAsync(key, cancellationToken);
            if (cachedData != null)
            {
                _logger.LogDebug("Cache hit for key: {CacheKey}", key);
                return JsonSerializer.Deserialize<T>(cachedData, _jsonOptions);
            }
            
            _logger.LogDebug("Cache miss for key: {CacheKey}", key);
            return default;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error getting value from cache for key: {Key}", key);
            return default;
        }
    }

    public async Task<string?> GetStringAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _cache.GetStringAsync(key, cancellationToken);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error getting string from cache for key: {Key}", key);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var options = new DistributedCacheEntryOptions();
            if (expiry.HasValue)
            {
                options.AbsoluteExpirationRelativeToNow = expiry;
            }
            else
            {
                options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
                options.SlidingExpiration = TimeSpan.FromMinutes(5);
            }

            var serializedData = JsonSerializer.Serialize(value, _jsonOptions);
            await _cache.SetStringAsync(key, serializedData, options, cancellationToken);
            
            _logger.LogDebug("Cached value for key: {Key}", key);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error setting value in cache for key: {Key}", key);
        }
    }

    public async Task SetStringAsync(string key, string value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var options = new DistributedCacheEntryOptions();
            if (expiry.HasValue)
            {
                options.AbsoluteExpirationRelativeToNow = expiry;
            }
            else
            {
                options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
                options.SlidingExpiration = TimeSpan.FromMinutes(5);
            }

            await _cache.SetStringAsync(key, value, options, cancellationToken);
            _logger.LogDebug("Cached string for key: {Key}", key);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error setting string in cache for key: {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await _cache.RemoveAsync(key, cancellationToken);
            _logger.LogDebug("Removed cache entry for key: {Key}", key);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error removing value from cache for key: {Key}", key);
        }
    }

    public async Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        // Note: IDistributedCache doesn't support pattern-based removal
        // This would require direct Redis access through IConnectionMultiplexer
        _logger.LogWarning("Pattern-based removal not implemented for IDistributedCache");
        await Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var value = await _cache.GetAsync(key, cancellationToken);
            return value != null;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error checking if key exists: {Key}", key);
            return false;
        }
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        var cached = await GetAsync<T>(key, cancellationToken);
        if (cached != null)
        {
            return cached;
        }

        var value = await factory();
        await SetAsync(key, value, expiry, cancellationToken);
        return value;
    }

    public async Task RefreshAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await _cache.RefreshAsync(key, cancellationToken);
            _logger.LogDebug("Refreshed cache expiry for key: {Key}", key);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error refreshing cache for key: {Key}", key);
        }
    }

    #endregion

    private string GenerateCacheKey(string key, Guid tenantId)
    {
        return $"tenant:{tenantId}:setting:{key}";
    }

    private string GenerateSettingsCacheKey(Guid tenantId, string? category = null)
    {
        return string.IsNullOrEmpty(category)
            ? $"tenant:{tenantId}:settings:all"
            : $"tenant:{tenantId}:settings:category:{category}";
    }
}