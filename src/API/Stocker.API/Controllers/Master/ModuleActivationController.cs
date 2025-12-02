using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Services;

namespace Stocker.API.Controllers.Master;

[ApiController]
[Route("api/master/[controller]")]
[Authorize(Policy = "RequireMasterAccess")]
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

    /// <summary>
    /// Get all available modules in the system
    /// </summary>
    [HttpGet("available-modules")]
    public async Task<IActionResult> GetAvailableModules()
    {
        var modules = await _moduleActivationService.GetAllAvailableModulesAsync();
        return Ok(new { success = true, modules });
    }

    /// <summary>
    /// Get tenant module status with package availability info
    /// </summary>
    [HttpGet("{tenantId}/status")]
    public async Task<IActionResult> GetTenantModuleStatus(Guid tenantId)
    {
        try
        {
            var status = await _moduleActivationService.GetTenantModuleStatusAsync(tenantId);
            return Ok(new { success = true, data = status });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Activate a module for tenant
    /// </summary>
    [HttpPost("{tenantId}/modules/{moduleName}/activate")]
    public async Task<IActionResult> ActivateModule(Guid tenantId, string moduleName)
    {
        var result = await _moduleActivationService.ActivateModuleForTenantAsync(tenantId, moduleName);

        if (result)
        {
            return Ok(new { success = true, message = $"Module {moduleName} activated successfully for tenant {tenantId}" });
        }

        return BadRequest(new { success = false, message = $"Failed to activate module {moduleName} for tenant {tenantId}. Module might not be included in tenant's package." });
    }

    /// <summary>
    /// Deactivate a module for tenant
    /// </summary>
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

    /// <summary>
    /// Get single module status for tenant
    /// </summary>
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

    /// <summary>
    /// Get list of active modules for tenant
    /// </summary>
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

    /// <summary>
    /// Initialize CRM module with default data
    /// </summary>
    [HttpPost("{tenantId}/modules/crm/initialize")]
    public async Task<IActionResult> InitializeCRMModule(Guid tenantId)
    {
        // First activate the module
        var activationResult = await _moduleActivationService.ActivateModuleForTenantAsync(tenantId, "CRM");

        if (!activationResult)
        {
            return BadRequest(new { success = false, message = "Failed to activate CRM module. Make sure CRM is included in tenant's package." });
        }

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