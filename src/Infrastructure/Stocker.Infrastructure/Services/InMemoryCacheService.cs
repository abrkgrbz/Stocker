using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs;
using System.Text.Json;

namespace Stocker.Infrastructure.Services;

public class InMemoryCacheService : ICacheService, ITenantSettingsCacheService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<InMemoryCacheService> _logger;
    private readonly MemoryCacheEntryOptions _defaultOptions;

    public InMemoryCacheService(
        IMemoryCache cache,
        ILogger<InMemoryCacheService> logger)
    {
        _cache = cache;
        _logger = logger;
        _defaultOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15),
            SlidingExpiration = TimeSpan.FromMinutes(5)
        };
    }

    #region ITenantSettingsCacheService Implementation

    public Task<T?> GetAsync<T>(string key, Guid tenantId)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        var value = _cache.Get<T>(cacheKey);
        
        if (value != null)
        {
            _logger.LogDebug("Memory cache hit for key: {CacheKey}", cacheKey);
        }
        else
        {
            _logger.LogDebug("Memory cache miss for key: {CacheKey}", cacheKey);
        }
        
        return Task.FromResult(value);
    }

    public Task SetAsync<T>(string key, Guid tenantId, T value, TimeSpan? expiry = null)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        
        var options = new MemoryCacheEntryOptions();
        if (expiry.HasValue)
        {
            options.AbsoluteExpirationRelativeToNow = expiry;
        }
        else
        {
            options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
            options.SlidingExpiration = TimeSpan.FromMinutes(5);
        }
        
        _cache.Set(cacheKey, value, options);
        _logger.LogDebug("Set memory cache for key: {CacheKey}", cacheKey);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, Guid tenantId)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        _cache.Remove(cacheKey);
        _logger.LogDebug("Removed memory cache for key: {CacheKey}", cacheKey);
        return Task.CompletedTask;
    }

    public Task RemoveAllForTenantAsync(Guid tenantId)
    {
        // In-memory cache doesn't support pattern-based removal
        // We'd need to track keys separately for this functionality
        _logger.LogWarning("Pattern-based removal not supported in memory cache");
        return Task.CompletedTask;
    }

    public Task<List<SettingDto>?> GetSettingsAsync(Guid tenantId, string? category = null)
    {
        var cacheKey = GenerateSettingsCacheKey(tenantId, category);
        var settings = _cache.Get<List<SettingDto>>(cacheKey);
        
        if (settings != null)
        {
            _logger.LogDebug("Got {Count} settings from memory cache for tenant: {TenantId}", 
                settings.Count, tenantId);
        }
        
        return Task.FromResult(settings);
    }

    public Task SetSettingsAsync(Guid tenantId, List<SettingDto> settings, string? category = null)
    {
        var cacheKey = GenerateSettingsCacheKey(tenantId, category);
        
        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30),
            SlidingExpiration = TimeSpan.FromMinutes(10)
        };
        
        _cache.Set(cacheKey, settings, options);
        
        _logger.LogDebug("Cached {Count} settings in memory for tenant: {TenantId}, category: {Category}", 
            settings.Count, tenantId, category ?? "all");
        
        return Task.CompletedTask;
    }

    public Task InvalidateSettingsAsync(Guid tenantId)
    {
        // Can't easily invalidate all tenant settings without tracking keys
        _logger.LogWarning("Settings invalidation not fully supported in memory cache");
        return Task.CompletedTask;
    }

    public Task ClearTenantSettingsAsync(Guid tenantId)
    {
        // Can't easily clear all tenant settings without tracking keys
        _logger.LogWarning("Clearing tenant settings not fully supported in memory cache");
        return Task.CompletedTask;
    }

    public Task InvalidateSettingAsync(Guid tenantId, string settingKey)
    {
        var cacheKey = GenerateCacheKey(settingKey, tenantId);
        _cache.Remove(cacheKey);
        _logger.LogDebug("Invalidated setting cache in memory for tenant: {TenantId}, key: {SettingKey}", tenantId, settingKey);
        return Task.CompletedTask;
    }

    #endregion

    #region ICacheService Implementation

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        var value = _cache.Get<T>(key);
        
        if (value != null)
        {
            _logger.LogDebug("Cache hit for key: {Key}", key);
        }
        else
        {
            _logger.LogDebug("Cache miss for key: {Key}", key);
        }
        
        return Task.FromResult(value);
    }

    public Task<string?> GetStringAsync(string key, CancellationToken cancellationToken = default)
    {
        var value = _cache.Get<string>(key);
        return Task.FromResult(value);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        var options = new MemoryCacheEntryOptions();
        
        if (expiry.HasValue)
        {
            options.AbsoluteExpirationRelativeToNow = expiry;
        }
        else
        {
            options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
            options.SlidingExpiration = TimeSpan.FromMinutes(5);
        }
        
        _cache.Set(key, value, options);
        _logger.LogDebug("Cached value for key: {Key}", key);
        
        return Task.CompletedTask;
    }

    public Task SetStringAsync(string key, string value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        var options = new MemoryCacheEntryOptions();
        
        if (expiry.HasValue)
        {
            options.AbsoluteExpirationRelativeToNow = expiry;
        }
        else
        {
            options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
            options.SlidingExpiration = TimeSpan.FromMinutes(5);
        }
        
        _cache.Set(key, value, options);
        _logger.LogDebug("Cached string for key: {Key}", key);
        
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        _cache.Remove(key);
        _logger.LogDebug("Removed cache entry for key: {Key}", key);
        return Task.CompletedTask;
    }

    public Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        // Memory cache doesn't support pattern-based removal
        _logger.LogWarning("Pattern-based removal not supported in memory cache");
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_cache.TryGetValue(key, out _));
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue<T>(key, out var cached))
        {
            return cached!;
        }

        var value = await factory();
        await SetAsync(key, value, expiry, cancellationToken);
        return value;
    }

    public Task RefreshAsync(string key, CancellationToken cancellationToken = default)
    {
        // Memory cache doesn't support refresh without getting the value
        if (_cache.TryGetValue(key, out var value))
        {
            // Re-set with same value to refresh expiry
            _cache.Set(key, value, _defaultOptions);
            _logger.LogDebug("Refreshed cache expiry for key: {Key}", key);
        }
        
        return Task.CompletedTask;
    }

    #endregion

    private string GenerateCacheKey(string key, Guid tenantId)
    {
        return $"tenant:{tenantId}:setting:{key}";
    }

    private string GenerateSettingsCacheKey(Guid tenantId, string? category)
    {
        return category != null 
            ? $"tenant:{tenantId}:settings:{category}"
            : $"tenant:{tenantId}:settings:all";
    }
}