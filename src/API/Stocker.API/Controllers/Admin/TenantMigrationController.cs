using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.API.Controllers.Admin;

[ApiController]
[Route("api/admin/tenant-migration")]
[Authorize(Policy = "RequireMasterAccess")]
[SwaggerTag("Tenant Migration - Manage tenant database migrations")]
public class TenantMigrationController : ControllerBase
{
    private readonly IMigrationService _migrationService;
    private readonly ILogger<TenantMigrationController> _logger;

    public TenantMigrationController(
        IMigrationService migrationService,
        ILogger<TenantMigrationController> logger)
    {
        _migrationService = migrationService;
        _logger = logger;
    }

    [HttpPost("{tenantId}/migrate")]
    public async Task<IActionResult> MigrateTenant(Guid tenantId)
    {
        try
        {
            _logger.LogInformation("Starting migration for tenant {TenantId}", tenantId);
            
            await _migrationService.MigrateTenantDatabaseAsync(tenantId);
            await _migrationService.SeedTenantDataAsync(tenantId);
            
            return Ok(new { success = true, message = $"Tenant {tenantId} database migrated successfully" });
        }
        catch (Application.Common.Exceptions.NotFoundException ex)
        {
            _logger.LogError(ex, "Tenant not found: {TenantId}", tenantId);
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (DatabaseException ex)
        {
            _logger.LogError(ex, "Database error migrating tenant {TenantId}", tenantId);
            return StatusCode(503, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("migrate-all")]
    public async Task<IActionResult> MigrateAllTenants()
    {
        try
        {
            _logger.LogInformation("Starting migration for all tenants");
            
            await _migrationService.MigrateAllTenantDatabasesAsync();
            
            return Ok(new { success = true, message = "All tenant databases migrated successfully" });
        }
        catch (DatabaseException ex)
        {
            _logger.LogError(ex, "Database error migrating all tenants");
            return StatusCode(503, new { success = false, message = ex.Message });
        }
    }
}