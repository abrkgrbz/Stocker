using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Infrastructure.Services;
using Stocker.SharedKernel.Interfaces;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.API.Controllers.Admin;

/// <summary>
/// Manages tenant-specific module configurations and enablement
/// </summary>
[ApiController]
[Route("api/admin/tenant-modules")]
[Authorize(Roles = "SuperAdmin,Admin")]
[Produces("application/json")]
public class TenantModulesController : ControllerBase
{
    private readonly ITenantCRMDatabaseService _tenantCRMService;
    private readonly ITenantService _tenantService;
    private readonly ILogger<TenantModulesController> _logger;

    public TenantModulesController(
        ITenantCRMDatabaseService tenantCRMService,
        ITenantService tenantService,
        ILogger<TenantModulesController> logger)
    {
        _tenantCRMService = tenantCRMService;
        _tenantService = tenantService;
        _logger = logger;
    }

    /// <summary>
    /// Enable CRM module for a specific tenant
    /// </summary>
    /// <param name="tenantId">The unique identifier of the tenant</param>
    /// <returns>Success message if enabled, error message otherwise</returns>
    /// <response code="200">CRM module enabled successfully</response>
    /// <response code="400">Failed to enable CRM module</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("{tenantId}/crm/enable")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> EnableCRMForTenant(Guid tenantId)
    {
        _logger.LogInformation("Enabling CRM module for tenant {TenantId}", tenantId);

        // Get tenant-specific connection string
        var connectionString = _tenantCRMService.GetTenantConnectionString(tenantId);
        
        // Enable CRM and create tables in tenant's database
        var result = await _tenantCRMService.EnableCRMForTenantAsync(tenantId, connectionString);
        
        if (result)
        {
            _logger.LogInformation("CRM module enabled successfully for tenant {TenantId}", tenantId);
            return Ok(new { Message = $"CRM module enabled for tenant {tenantId}" });
        }

        _logger.LogWarning("Failed to enable CRM module for tenant {TenantId}", tenantId);
        return BadRequest(new { Error = "Failed to enable CRM module" });
    }

    /// <summary>
    /// Disable CRM module for a specific tenant
    /// </summary>
    [HttpPost("{tenantId}/crm/disable")]
    public async Task<IActionResult> DisableCRMForTenant(Guid tenantId)
    {
        _logger.LogInformation("Disabling CRM module for tenant {TenantId}", tenantId);

        var result = await _tenantCRMService.DisableCRMForTenantAsync(tenantId);
        
        if (result)
        {
            _logger.LogInformation("CRM module disabled successfully for tenant {TenantId}", tenantId);
            return Ok(new { Message = $"CRM module disabled for tenant {tenantId}" });
        }

        return BadRequest(new { Error = "Failed to disable CRM module" });
    }

    /// <summary>
    /// Check if CRM module is enabled for a tenant
    /// </summary>
    [HttpGet("{tenantId}/crm/status")]
    public async Task<IActionResult> GetCRMStatus(Guid tenantId)
    {
        // Check if CRM tables exist in tenant's database
        var isEnabled = await _tenantCRMService.EnsureCRMTablesExistAsync(tenantId);
        
        return Ok(new 
        { 
            TenantId = tenantId,
            CRMEnabled = isEnabled,
            DatabaseName = $"Stocker_Tenant_{tenantId:N}"
        });
    }
}