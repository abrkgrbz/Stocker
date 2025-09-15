using Stocker.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Tenant-specific settings cache service interface
/// </summary>
public interface ITenantSettingsCacheService : ICacheService
{
    /// <summary>
    /// Get tenant settings from cache
    /// </summary>
    Task<List<SettingDto>?> GetSettingsAsync(Guid tenantId, string? category = null);

    /// <summary>
    /// Set tenant settings in cache
    /// </summary>
    Task SetSettingsAsync(Guid tenantId, List<SettingDto> settings, string? category = null);

    /// <summary>
    /// Set a value in cache with tenant-specific key
    /// </summary>
    Task SetAsync<T>(string key, Guid tenantId, T value, TimeSpan? expiry = null);

    /// <summary>
    /// Clear all settings for a tenant
    /// </summary>
    Task ClearTenantSettingsAsync(Guid tenantId);

    /// <summary>
    /// Invalidate specific setting for a tenant
    /// </summary>
    Task InvalidateSettingAsync(Guid tenantId, string settingKey);
}