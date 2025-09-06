using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Tenant.Settings;
using System.Text.Json;

namespace Stocker.Infrastructure.Services;

public class RedisCacheService : ITenantSettingsCacheService
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting value from Redis for key: {CacheKey}", cacheKey);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, Guid tenantId, T value, TimeSpan? expiration = null)
    {
        var cacheKey = GenerateCacheKey(key, tenantId);
        
        try
        {
            var options = expiration.HasValue
                ? new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiration.Value,
                    SlidingExpiration = TimeSpan.FromMinutes(5)
                }
                : _defaultOptions;

            var serializedData = JsonSerializer.Serialize(value, _jsonOptions);
            await _cache.SetStringAsync(cacheKey, serializedData, options);
            
            _logger.LogDebug("Cached value in Redis for key: {CacheKey}", cacheKey);
        }
        catch (Exception ex)
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
        catch (Exception ex)
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
        catch (Exception ex)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting settings in Redis for tenant: {TenantId}", tenantId);
        }
    }

    public async Task InvalidateSettingsAsync(Guid tenantId)
    {
        await RemoveAllForTenantAsync(tenantId);
        _logger.LogInformation("Invalidated all settings cache in Redis for tenant: {TenantId}", tenantId);
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