using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Interfaces;
using System.Collections.Generic;

namespace Stocker.Application.Services;

public interface IModuleActivationService
{
    Task<bool> ActivateModuleForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default);
    Task<bool> DeactivateModuleForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default);
    Task<bool> IsModuleActiveForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default);
    Task<List<string>> GetActiveModulesForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

public class ModuleActivationService : IModuleActivationService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ModuleActivationService> _logger;
    private readonly ITenantService _tenantService;
    
    // Module activation handlers registry
    private readonly Dictionary<string, Type> _moduleHandlers = new();

    public ModuleActivationService(
        IServiceProvider serviceProvider,
        ILogger<ModuleActivationService> logger,
        ITenantService tenantService)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _tenantService = tenantService;
        
        // Register module handlers
        RegisterModuleHandlers();
    }
    
    private void RegisterModuleHandlers()
    {
        // Register available modules and their activation handlers
        // These will be resolved from DI container when needed
        _moduleHandlers["CRM"] = typeof(Stocker.Modules.CRM.Infrastructure.Services.ITenantCRMDatabaseService);
        _moduleHandlers["Inventory"] = typeof(object); // Placeholder for future implementation
        _moduleHandlers["Sales"] = typeof(object);
        _moduleHandlers["Purchase"] = typeof(object);
        _moduleHandlers["Finance"] = typeof(object);
        _moduleHandlers["HR"] = typeof(object);
    }

    public async Task<bool> ActivateModuleForTenantAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Activating module {Module} for tenant {TenantId}", moduleName, tenantId);
            
            if (!_moduleHandlers.ContainsKey(moduleName))
            {
                _logger.LogWarning("Module {Module} is not registered", moduleName);
                return false;
            }
            
            var handlerType = _moduleHandlers[moduleName];
            
            // Special handling for CRM module
            if (moduleName == "CRM")
            {
                using var scope = _serviceProvider.CreateScope();
                var crmService = scope.ServiceProvider.GetService(handlerType);
                
                if (crmService is Stocker.Modules.CRM.Infrastructure.Services.ITenantCRMDatabaseService tenantCrmService)
                {
                    var connectionString = GetTenantConnectionString(tenantId);
                    return await tenantCrmService.EnableCRMForTenantAsync(tenantId, connectionString);
                }
            }
            
            // Add similar handlers for other modules as they are implemented
            
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
            
            if (!_moduleHandlers.ContainsKey(moduleName))
            {
                _logger.LogWarning("Module {Module} is not registered", moduleName);
                return false;
            }
            
            var handlerType = _moduleHandlers[moduleName];
            
            // Special handling for CRM module
            if (moduleName == "CRM")
            {
                using var scope = _serviceProvider.CreateScope();
                var crmService = scope.ServiceProvider.GetService(handlerType);
                
                if (crmService is Stocker.Modules.CRM.Infrastructure.Services.ITenantCRMDatabaseService tenantCrmService)
                {
                    return await tenantCrmService.DisableCRMForTenantAsync(tenantId);
                }
            }
            
            _logger.LogInformation("Module {Module} deactivated successfully for tenant {TenantId}", moduleName, tenantId);
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
            // Check from database if module is active for this tenant
            // This would typically check the SubscriptionModule table
            
            using var scope = _serviceProvider.CreateScope();
            
            // For now, return a simplified check
            // In production, this would query the database
            return await Task.FromResult(true);
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
            // Query database for active modules for this tenant
            // This would typically query the SubscriptionModule table
            
            var activeModules = new List<string>();
            
            // For demonstration, return some modules
            // In production, this would be from database
            activeModules.Add("CRM");
            
            return await Task.FromResult(activeModules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active modules for tenant {TenantId}", tenantId);
            return new List<string>();
        }
    }
    
    private string GetTenantConnectionString(Guid tenantId)
    {
        // Get connection string from configuration or database
        // For now, using a pattern-based connection string
        var baseConnectionString = "Server=DESKTOP-A1C2AO3;Database=Stocker_Tenant_{0};Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";
        return string.Format(baseConnectionString, tenantId.ToString("N"));
    }
}