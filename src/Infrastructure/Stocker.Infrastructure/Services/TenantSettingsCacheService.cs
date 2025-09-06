using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Tenant.Settings;
using System.Collections.Concurrent;

namespace Stocker.Infrastructure.Services;

public interface ITenantSettingsCacheService
{
    Task<T?> GetAsync<T>(string key, Guid tenantId);
    Task SetAsync<T>(string key, Guid tenantId, T value, TimeSpan? expiration = null);
    Task RemoveAsync(string key, Guid tenantId);
    Task RemoveAllForTenantAsync(Guid tenantId);
    Task<List<SettingDto>?> GetSettingsAsync(Guid tenantId, string? category = null);
    Task SetSettingsAsync(Guid tenantId, List<SettingDto> settings, string? category = null);
    Task InvalidateSettingsAsync(Guid tenantId);
}

public class TenantSettingsCacheService : ITenantSettingsCacheService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<TenantSettingsCacheService> _logger;
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks;
    private readonly TimeSpan _defaultExpiration = TimeSpan.FromMinutes(15);

    public TenantSettingsCacheService(
        IMemoryCache cache,
        ILogger<TenantSettingsCacheService> logger)
    {
        _cache = cache;
        _logger = logger;
        _locks = new ConcurrentDictionary<string, SemaphoreSlim>();
    }

    public async Task<T?> GetAsync<T>(string key, Guid tenantId)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        
        if (_cache.TryGetValue(cacheKey, out T? cachedValue))
        {
            _logger.LogDebug("Cache hit for key: {CacheKey}", cacheKey);
            return cachedValue;
        }

        _logger.LogDebug("Cache miss for key: {CacheKey}", cacheKey);
        return default;
    }

    public async Task SetAsync<T>(string key, Guid tenantId, T value, TimeSpan? expiration = null)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        var expirationTime = expiration ?? _defaultExpiration;

        var cacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expirationTime,
            SlidingExpiration = TimeSpan.FromMinutes(5),
            Priority = CacheItemPriority.Normal
        };

        _cache.Set(cacheKey, value, cacheOptions);
        _logger.LogDebug("Cached value for key: {CacheKey} with expiration: {Expiration}", 
            cacheKey, expirationTime);
    }

    public async Task RemoveAsync(string key, Guid tenantId)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        _cache.Remove(cacheKey);
        _logger.LogDebug("Removed cache for key: {CacheKey}", cacheKey);
    }

    public async Task RemoveAllForTenantAsync(Guid tenantId)
    {
        // Remove settings cache
        var settingsCacheKey = GenerateSettingsCacheKey(tenantId);
        _cache.Remove(settingsCacheKey);

        // Remove category-specific caches
        var categories = new[] { "Genel", "Güvenlik", "E-posta", "Fatura", "Yerelleştirme" };
        foreach (var category in categories)
        {
            var categoryCacheKey = GenerateSettingsCacheKey(tenantId, category);
            _cache.Remove(categoryCacheKey);
        }

        _logger.LogDebug("Removed all cache entries for tenant: {TenantId}", tenantId);
    }

    public async Task<List<SettingDto>?> GetSettingsAsync(Guid tenantId, string? category = null)
    {
        var cacheKey = GenerateSettingsCacheKey(tenantId, category);
        
        if (_cache.TryGetValue(cacheKey, out List<SettingDto>? settings))
        {
            _logger.LogDebug("Settings cache hit for tenant: {TenantId}, category: {Category}", 
                tenantId, category ?? "all");
            return settings;
        }

        _logger.LogDebug("Settings cache miss for tenant: {TenantId}, category: {Category}", 
            tenantId, category ?? "all");
        return null;
    }

    public async Task SetSettingsAsync(Guid tenantId, List<SettingDto> settings, string? category = null)
    {
        var cacheKey = GenerateSettingsCacheKey(tenantId, category);
        
        // Use a lock to prevent cache stampede
        var lockKey = $"lock_{cacheKey}";
        var lockObj = _locks.GetOrAdd(lockKey, _ => new SemaphoreSlim(1, 1));

        await lockObj.WaitAsync();
        try
        {
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30),
                SlidingExpiration = TimeSpan.FromMinutes(10),
                Priority = CacheItemPriority.High,
                PostEvictionCallbacks =
                {
                    new PostEvictionCallbackRegistration
                    {
                        EvictionCallback = (key, value, reason, state) =>
                        {
                            _logger.LogDebug("Settings cache evicted for key: {Key}, reason: {Reason}", 
                                key, reason);
                        }
                    }
                }
            };

            _cache.Set(cacheKey, settings, cacheOptions);
            _logger.LogDebug("Cached {Count} settings for tenant: {TenantId}, category: {Category}", 
                settings.Count, tenantId, category ?? "all");
        }
        finally
        {
            lockObj.Release();
            
            // Clean up lock if no longer needed
            if (lockObj.CurrentCount == 1)
            {
                _locks.TryRemove(lockKey, out _);
            }
        }
    }

    public async Task InvalidateSettingsAsync(Guid tenantId)
    {
        await RemoveAllForTenantAsync(tenantId);
        _logger.LogInformation("Invalidated all settings cache for tenant: {TenantId}", tenantId);
    }

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