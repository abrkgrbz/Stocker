using Stocker.Application.DTOs.Tenant.Settings;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Application.Interfaces.Repositories;

public interface ISettingsRepository
{
    // Tenant Settings
    Task<List<TenantSettings>> GetTenantSettingsAsync(Guid tenantId, string? category = null, CancellationToken cancellationToken = default);
    Task<TenantSettings?> GetTenantSettingByKeyAsync(Guid tenantId, string key, CancellationToken cancellationToken = default);
    Task<TenantSettings> CreateTenantSettingAsync(TenantSettings setting, CancellationToken cancellationToken = default);
    Task<TenantSettings?> UpdateTenantSettingAsync(Guid tenantId, string key, string value, CancellationToken cancellationToken = default);
    Task<bool> DeleteTenantSettingAsync(Guid tenantId, string key, CancellationToken cancellationToken = default);
    Task<List<SettingCategoryDto>> GetGroupedSettingsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<bool> BulkUpdateSettingsAsync(Guid tenantId, Dictionary<string, string> settings, CancellationToken cancellationToken = default);
    
    // Tenant Modules
    Task<List<TenantModules>> GetTenantModulesAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<TenantModules?> GetTenantModuleAsync(Guid tenantId, string moduleCode, CancellationToken cancellationToken = default);
    Task<bool> ToggleModuleAsync(Guid tenantId, string moduleCode, CancellationToken cancellationToken = default);
    Task<bool> UpdateModuleSettingsAsync(Guid tenantId, string moduleCode, string settings, CancellationToken cancellationToken = default);
    
    // Master/System Settings
    Task<object> GetSystemSettingsAsync(CancellationToken cancellationToken = default);
    Task<bool> UpdateSystemSettingAsync(string key, string value, CancellationToken cancellationToken = default);
    Task<object> GetEmailSettingsAsync(CancellationToken cancellationToken = default);
    Task<object> GetSecuritySettingsAsync(CancellationToken cancellationToken = default);
    Task<object> GetGeneralSettingsAsync(CancellationToken cancellationToken = default);
}