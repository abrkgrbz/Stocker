using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Services;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;

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
        var result = await _moduleActivationService.ActivateModuleForTenantAsync(tenantId, moduleName);
        
        if (result)
        {
            return Ok(new { success = true, message = $"Module {moduleName} activated successfully for tenant {tenantId}" });
        }
        
        return BadRequest(new { success = false, message = $"Failed to activate module {moduleName} for tenant {tenantId}" });
    }

    [HttpPost("{tenantId}/modules/{moduleName}/deactivate")]
    public async Task<IActionResult> DeactivateModule(Guid tenantId, string moduleName)
    {
        var result = await _moduleActivationService.DeactivateModuleForTenantAsync(tenantId, moduleName);
        
        if (result)
        {
            return Ok(new { success = true, message = $"Module {moduleName} deactivated successfully for tenant {tenantId}" });
        }
        
        return BadRequest(new { success = false, message = $"Failed to deactivate module {moduleName} for tenant {tenantId}" });
    }

    [HttpGet("{tenantId}/modules/{moduleName}/status")]
    public async Task<IActionResult> GetModuleStatus(Guid tenantId, string moduleName)
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

    [HttpGet("{tenantId}/modules")]
    public async Task<IActionResult> GetActiveModules(Guid tenantId)
    {
        var activeModules = await _moduleActivationService.GetActiveModulesForTenantAsync(tenantId);
        
        return Ok(new 
        { 
            success = true, 
            tenantId = tenantId,
            activeModules = activeModules
        });
    }

    [HttpPost("{tenantId}/modules/crm/initialize")]
    public async Task<IActionResult> InitializeCRMModule(Guid tenantId)
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
}