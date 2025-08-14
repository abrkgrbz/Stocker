using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Persistence.Migrations;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Admin;

[ApiController]
[Route("api/admin/tenant-migration")]
[Authorize(Roles = "SystemAdmin")]
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to migrate tenant {TenantId}", tenantId);
            return StatusCode(500, new { success = false, message = ex.Message });
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to migrate all tenants");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}