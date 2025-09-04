using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Services;

namespace Stocker.API.Controllers.Master;

[ApiController]
[Route("api/master/[controller]")]
[Authorize(Policy = "MasterOnly")]
public class ModuleActivationController : ControllerBase
{
    private readonly IModuleActivationService _moduleActivationService;
    private readonly ILogger<ModuleActivationController> _logger;

    public ModuleActivationController(
        IModuleActivationService moduleActivationService,
        ILogger<ModuleActivationController> logger)
    {
        _moduleActivationService = moduleActivationService;
        _logger = logger;
    }

    [HttpPost("{tenantId}/modules/{moduleName}/activate")]
    public async Task<IActionResult> ActivateModule(Guid tenantId, string moduleName)
    {
        try
        {
            var result = await _moduleActivationService.ActivateModuleForTenantAsync(tenantId, moduleName);
            
            if (result)
            {
                return Ok(new { success = true, message = $"Module {moduleName} activated successfully for tenant {tenantId}" });
            }
            
            return BadRequest(new { success = false, message = $"Failed to activate module {moduleName} for tenant {tenantId}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating module {ModuleName} for tenant {TenantId}", moduleName, tenantId);
            return StatusCode(500, new { success = false, message = "An error occurred while activating the module" });
        }
    }

    [HttpPost("{tenantId}/modules/{moduleName}/deactivate")]
    public async Task<IActionResult> DeactivateModule(Guid tenantId, string moduleName)
    {
        try
        {
            var result = await _moduleActivationService.DeactivateModuleForTenantAsync(tenantId, moduleName);
            
            if (result)
            {
                return Ok(new { success = true, message = $"Module {moduleName} deactivated successfully for tenant {tenantId}" });
            }
            
            return BadRequest(new { success = false, message = $"Failed to deactivate module {moduleName} for tenant {tenantId}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating module {ModuleName} for tenant {TenantId}", moduleName, tenantId);
            return StatusCode(500, new { success = false, message = "An error occurred while deactivating the module" });
        }
    }

    [HttpGet("{tenantId}/modules/{moduleName}/status")]
    public async Task<IActionResult> GetModuleStatus(Guid tenantId, string moduleName)
    {
        try
        {
            var isActive = await _moduleActivationService.IsModuleActiveForTenantAsync(tenantId, moduleName);
            
            return Ok(new 
            { 
                success = true, 
                tenantId = tenantId,
                moduleName = moduleName,
                isActive = isActive
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking module {ModuleName} status for tenant {TenantId}", moduleName, tenantId);
            return StatusCode(500, new { success = false, message = "An error occurred while checking module status" });
        }
    }

    [HttpGet("{tenantId}/modules")]
    public async Task<IActionResult> GetActiveModules(Guid tenantId)
    {
        try
        {
            var activeModules = await _moduleActivationService.GetActiveModulesForTenantAsync(tenantId);
            
            return Ok(new 
            { 
                success = true, 
                tenantId = tenantId,
                activeModules = activeModules
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active modules for tenant {TenantId}", tenantId);
            return StatusCode(500, new { success = false, message = "An error occurred while getting active modules" });
        }
    }

    [HttpPost("{tenantId}/modules/crm/initialize")]
    public async Task<IActionResult> InitializeCRMModule(Guid tenantId)
    {
        try
        {
            // First activate the module
            var activationResult = await _moduleActivationService.ActivateModuleForTenantAsync(tenantId, "CRM");
            
            if (!activationResult)
            {
                return BadRequest(new { success = false, message = "Failed to activate CRM module" });
            }
            
            // Additional CRM-specific initialization can be done here
            // For example, creating default pipelines, lead sources, etc.
            
            return Ok(new 
            { 
                success = true, 
                message = "CRM module initialized successfully",
                tenantId = tenantId,
                module = "CRM",
                features = new[]
                {
                    "Lead Management",
                    "Contact Management",
                    "Opportunity Tracking",
                    "Deal Management",
                    "Campaign Management",
                    "Activity Tracking",
                    "Pipeline Management",
                    "Lead Scoring"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing CRM module for tenant {TenantId}", tenantId);
            return StatusCode(500, new { success = false, message = "An error occurred while initializing CRM module" });
        }
    }
}