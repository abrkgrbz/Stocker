using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Extensions;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Application.Services;

/// <summary>
/// DTO for available module information
/// </summary>
public class AvailableModuleDto
{
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public bool IsAvailableInPackage { get; set; }
    public int? RecordLimit { get; set; }
    public DateTime? EnabledDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsTrial { get; set; }
}

/// <summary>
/// DTO for tenant module status
/// </summary>
public class TenantModuleStatusDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public List<AvailableModuleDto> Modules { get; set; } = new();
}

public interface IModuleActivationService
{
    Task<bool> ActivateModuleForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default);
    Task<bool> DeactivateModuleForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default);
    Task<bool> IsModuleActiveForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default);
    Task<List<string>> GetActiveModulesForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<TenantModuleStatusDto> GetTenantModuleStatusAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<AvailableModuleDto>> GetAllAvailableModulesAsync(CancellationToken cancellationToken = default);
}

public class ModuleActivationService : IModuleActivationService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ModuleActivationService> _logger;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    // All available modules in the system
    private static readonly Dictionary<string, (string Name, string Description)> AvailableModules = new()
    {
        ["CRM"] = ("CRM Modülü", "Müşteri ilişkileri yönetimi, potansiyel müşteriler, fırsatlar ve kampanyalar"),
        ["Inventory"] = ("Stok Yönetimi", "Depo, ürün, stok hareketleri ve envanter yönetimi"),
        ["Sales"] = ("Satış Modülü", "Satış siparişleri, faturalar ve satış raporları"),
        ["Purchase"] = ("Satın Alma", "Tedarikçi yönetimi, satın alma siparişleri ve gider takibi"),
        ["Finance"] = ("Finans Modülü", "Muhasebe, nakit akışı ve finansal raporlama"),
        ["HR"] = ("İnsan Kaynakları", "Personel yönetimi, izin takibi ve bordro"),
        ["Projects"] = ("Proje Yönetimi", "Proje planlama, görev yönetimi ve zaman takibi"),
        ["ACCOUNTING"] = ("Muhasebe Modülü", "Genel muhasebe, hesap planı ve mali raporlar")
    };

    public ModuleActivationService(
        IServiceProvider serviceProvider,
        ILogger<ModuleActivationService> logger,
        IMemoryCache cache)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _cache = cache;
    }

    public Task<List<AvailableModuleDto>> GetAllAvailableModulesAsync(CancellationToken cancellationToken = default)
    {
        var modules = AvailableModules.Select(m => new AvailableModuleDto
        {
            ModuleCode = m.Key,
            ModuleName = m.Value.Name,
            Description = m.Value.Description,
            IsActive = false,
            IsAvailableInPackage = false
        }).ToList();

        return Task.FromResult(modules);
    }

    public async Task<TenantModuleStatusDto> GetTenantModuleStatusAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<IMasterUnitOfWork>();
        var tenantDbContextFactory = scope.ServiceProvider.GetRequiredService<ITenantDbContextFactory>();

        // Get tenant info
        var tenant = await masterUnitOfWork.Tenants()
            .AsQueryable()
            .AsNoTracking()
            .Where(t => t.Id == tenantId)
            .Select(t => new { t.Id, t.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant with ID {tenantId} not found");
        }

        // Get package modules (what's included in subscription)
        var subscriptionRepo = masterUnitOfWork.Repository<Subscription>();
        var packageModules = await subscriptionRepo
            .AsQueryable()
            .AsNoTracking()
            .Where(s => s.TenantId == tenantId &&
                       (s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif ||
                        s.Status == Domain.Master.Enums.SubscriptionStatus.Deneme))
            .OrderByDescending(s => s.StartDate)
            .SelectMany(s => s.Package.Modules)
            .Select(pm => new { pm.ModuleCode, pm.ModuleName, pm.MaxEntities, pm.IsIncluded })
            .ToListAsync(cancellationToken);

        // Get active modules from TenantModules table
        List<TenantModules> activeTenantModules = new();
        try
        {
            await using var tenantDbContext = await tenantDbContextFactory.CreateDbContextAsync(tenantId);
            activeTenantModules = await tenantDbContext.TenantModules
                .AsNoTracking()
                .Where(m => m.TenantId == tenantId)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not read TenantModules for tenant {TenantId}, table might not exist yet", tenantId);
        }

        // Build module status list
        var modules = new List<AvailableModuleDto>();

        foreach (var availableModule in AvailableModules)
        {
            var packageModule = packageModules.FirstOrDefault(pm =>
                pm.ModuleCode.Equals(availableModule.Key, StringComparison.OrdinalIgnoreCase));

            var tenantModule = activeTenantModules.FirstOrDefault(tm =>
                tm.ModuleCode.Equals(availableModule.Key, StringComparison.OrdinalIgnoreCase));

            modules.Add(new AvailableModuleDto
            {
                ModuleCode = availableModule.Key,
                ModuleName = availableModule.Value.Name,
                Description = availableModule.Value.Description,
                IsAvailableInPackage = packageModule?.IsIncluded ?? false,
                IsActive = tenantModule?.IsEnabled ?? false,
                RecordLimit = packageModule?.MaxEntities ?? tenantModule?.RecordLimit,
                EnabledDate = tenantModule?.EnabledDate,
                ExpiryDate = tenantModule?.ExpiryDate,
                IsTrial = tenantModule?.IsTrial ?? false
            });
        }

        return new TenantModuleStatusDto
        {
            TenantId = tenantId,
            TenantName = tenant.Name,
            Modules = modules
        };
    }

    public async Task<bool> ActivateModuleForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Activating module {Module} for tenant {TenantId}", moduleName, tenantId);

            if (!AvailableModules.ContainsKey(moduleName))
            {
                _logger.LogWarning("Module {Module} is not a valid module", moduleName);
                return false;
            }

            using var scope = _serviceProvider.CreateScope();
            var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<IMasterUnitOfWork>();
            var tenantDbContextFactory = scope.ServiceProvider.GetRequiredService<ITenantDbContextFactory>();

            // Check if module is in package
            var subscriptionRepo = masterUnitOfWork.Repository<Subscription>();
            var hasModuleInPackage = await subscriptionRepo
                .AsQueryable()
                .AsNoTracking()
                .Where(s => s.TenantId == tenantId &&
                           (s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif ||
                            s.Status == Domain.Master.Enums.SubscriptionStatus.Deneme))
                .SelectMany(s => s.Package.Modules)
                .AnyAsync(pm => pm.ModuleCode == moduleName && pm.IsIncluded, cancellationToken);

            if (!hasModuleInPackage)
            {
                _logger.LogWarning("Module {Module} is not included in tenant's package", moduleName);
                return false;
            }

            // Get package module info for limits
            var packageModule = await subscriptionRepo
                .AsQueryable()
                .AsNoTracking()
                .Where(s => s.TenantId == tenantId &&
                           (s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif ||
                            s.Status == Domain.Master.Enums.SubscriptionStatus.Deneme))
                .SelectMany(s => s.Package.Modules)
                .FirstOrDefaultAsync(pm => pm.ModuleCode == moduleName, cancellationToken);

            // Create or update TenantModules record
            await using var tenantDbContext = await tenantDbContextFactory.CreateDbContextAsync(tenantId);

            var existingModule = await tenantDbContext.TenantModules
                .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.ModuleCode == moduleName, cancellationToken);

            if (existingModule != null)
            {
                if (!existingModule.IsEnabled)
                {
                    existingModule.Enable();
                    _logger.LogInformation("Re-enabled existing module {Module} for tenant {TenantId}", moduleName, tenantId);
                }
                else
                {
                    _logger.LogInformation("Module {Module} is already enabled for tenant {TenantId}", moduleName, tenantId);
                    return true;
                }
            }
            else
            {
                var moduleInfo = AvailableModules[moduleName];
                var newModule = TenantModules.Create(
                    tenantId: tenantId,
                    moduleName: moduleInfo.Name,
                    moduleCode: moduleName,
                    description: moduleInfo.Description,
                    isEnabled: true,
                    recordLimit: packageModule?.MaxEntities
                );
                tenantDbContext.TenantModules.Add(newModule);
                _logger.LogInformation("Created new module record {Module} for tenant {TenantId}", moduleName, tenantId);
            }

            await tenantDbContext.SaveChangesAsync(cancellationToken);

            // Invalidate cache
            InvalidateCache(tenantId);

            _logger.LogInformation("Module {Module} activated successfully for tenant {TenantId}", moduleName, tenantId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating module {Module} for tenant {TenantId}", moduleName, tenantId);
            return false;
        }
    }

    public async Task<bool> DeactivateModuleForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Deactivating module {Module} for tenant {TenantId}", moduleName, tenantId);

            using var scope = _serviceProvider.CreateScope();
            var tenantDbContextFactory = scope.ServiceProvider.GetRequiredService<ITenantDbContextFactory>();

            // Update TenantModules record
            await using var tenantDbContext = await tenantDbContextFactory.CreateDbContextAsync(tenantId);

            var existingModule = await tenantDbContext.TenantModules
                .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.ModuleCode == moduleName, cancellationToken);

            if (existingModule == null)
            {
                _logger.LogWarning("Module {Module} not found for tenant {TenantId}", moduleName, tenantId);
                return false;
            }

            if (existingModule.IsEnabled)
            {
                existingModule.Disable();
                await tenantDbContext.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Module {Module} disabled for tenant {TenantId}", moduleName, tenantId);
            }
            else
            {
                _logger.LogInformation("Module {Module} is already disabled for tenant {TenantId}", moduleName, tenantId);
            }

            // Invalidate cache
            InvalidateCache(tenantId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating module {Module} for tenant {TenantId}", moduleName, tenantId);
            return false;
        }
    }

    public async Task<bool> IsModuleActiveForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default)
    {
        try
        {
            var cacheKey = $"module_active:{tenantId}:{moduleName}";
            if (_cache.TryGetValue<bool>(cacheKey, out var isActive))
            {
                return isActive;
            }

            using var scope = _serviceProvider.CreateScope();
            var tenantDbContextFactory = scope.ServiceProvider.GetRequiredService<ITenantDbContextFactory>();

            await using var tenantDbContext = await tenantDbContextFactory.CreateDbContextAsync(tenantId);

            isActive = await tenantDbContext.TenantModules
                .AsNoTracking()
                .AnyAsync(m => m.TenantId == tenantId &&
                              m.ModuleCode == moduleName &&
                              m.IsEnabled, cancellationToken);

            _cache.Set(cacheKey, isActive, CacheDuration);
            return isActive;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking module {Module} status for tenant {TenantId}", moduleName, tenantId);
            return false;
        }
    }

    public async Task<List<string>> GetActiveModulesForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var cacheKey = $"active_modules:{tenantId}";
            if (_cache.TryGetValue<List<string>>(cacheKey, out var modules))
            {
                return modules ?? new List<string>();
            }

            using var scope = _serviceProvider.CreateScope();
            var tenantDbContextFactory = scope.ServiceProvider.GetRequiredService<ITenantDbContextFactory>();

            await using var tenantDbContext = await tenantDbContextFactory.CreateDbContextAsync(tenantId);

            var activeModules = await tenantDbContext.TenantModules
                .AsNoTracking()
                .Where(m => m.TenantId == tenantId && m.IsEnabled)
                .Select(m => m.ModuleCode)
                .ToListAsync(cancellationToken);

            _cache.Set(cacheKey, activeModules, CacheDuration);
            return activeModules;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active modules for tenant {TenantId}", tenantId);
            return new List<string>();
        }
    }

    private void InvalidateCache(Guid tenantId)
    {
        _cache.Remove($"active_modules:{tenantId}");
        _cache.Remove($"tenant_modules:{tenantId}");
        foreach (var module in AvailableModules.Keys)
        {
            _cache.Remove($"module_active:{tenantId}:{module}");
        }
    }
}
