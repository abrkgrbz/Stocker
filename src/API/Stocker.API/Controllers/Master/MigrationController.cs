using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Migrations.Commands.ApplyMigration;
using Stocker.Application.Features.Migrations.Commands.ApplyMigrationsToAllTenants;
using Stocker.Application.Features.Migrations.Commands.CancelScheduledMigration;
using Stocker.Application.Features.Migrations.Commands.RollbackMigration;
using Stocker.Application.Features.Migrations.Commands.ScheduleMigration;
using Stocker.Application.Features.Migrations.Commands.UpdateMigrationSettings;
using Stocker.Application.Features.Migrations.Queries.GetMigrationHistory;
using Stocker.Application.Features.Migrations.Queries.GetMigrationScriptPreview;
using Stocker.Application.Features.Migrations.Queries.GetMigrationSettings;
using Stocker.Application.Features.Migrations.Queries.GetPendingMigrations;
using Stocker.Application.Features.Migrations.Queries.GetScheduledMigrations;
using Stocker.SharedKernel.DTOs.Migration;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[Authorize(Policy = "RequireMasterAccess")]
[ApiController]
[Route("api/master/migrations")]
[SwaggerTag("Master Admin Panel - Database Migrations")]
public class MigrationController : ApiController
{
    private readonly ISender _sender;
    private readonly ILogger<MigrationController> _logger;
    private readonly IMigrationService _migrationService;

    public MigrationController(ISender sender, ILogger<MigrationController> logger, IMigrationService migrationService)
    {
        _sender = sender;
        _logger = logger;
        _migrationService = migrationService;
    }

    /// <summary>
    /// Get pending migrations for master database
    /// </summary>
    [HttpGet("master/pending")]
    public async Task<IActionResult> GetMasterPendingMigrations()
    {
        try
        {
            var result = await _migrationService.GetMasterPendingMigrationsAsync();

            return Ok(new
            {
                success = true,
                data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting master pending migrations");
            return StatusCode(503, new
            {
                message = "Master veritabanı migration bilgisi alınamadı",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Apply migrations to master database
    /// </summary>
    [HttpPost("master/apply")]
    public async Task<IActionResult> ApplyMasterMigration()
    {
        try
        {
            _logger.LogInformation("Applying master migrations...");

            var result = await _migrationService.ApplyMasterMigrationAsync();

            return Ok(new
            {
                success = result.Success,
                data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying master migrations");
            return StatusCode(503, new
            {
                message = "Master migration uygulanamadı",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Get pending migrations for all tenants
    /// </summary>
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingMigrations()
    {
        var result = await _sender.Send(new GetPendingMigrationsQuery());

        if (!result.IsSuccess)
        {
            return StatusCode(503, new
            {
                message = "Veritabanı bağlantı hatası",
                error = result.Error?.Description
            });
        }

        var tenants = result.Value!;

        // DEBUG: Log tenant IDs and full object
        foreach (var tenant in tenants)
        {
            _logger.LogWarning("DEBUG GetPendingMigrations: TenantId={TenantId} (Length={Length}), TenantName={TenantName}",
                tenant.TenantId, tenant.TenantId.ToString().Length, tenant.TenantName);
        }

        var response = new
        {
            success = true,
            data = tenants
        };

        _logger.LogWarning("DEBUG GetPendingMigrations: Returning {Count} tenants", tenants.Count);

        return Ok(response);
    }

    /// <summary>
    /// Apply migrations to specific tenant
    /// </summary>
    [HttpPost("apply/{tenantId}")]
    public async Task<IActionResult> ApplyMigrationToTenant(Guid tenantId)
    {
        _logger.LogWarning("DEBUG ApplyMigration: Received tenantId parameter: {TenantId}", tenantId);

        var result = await _sender.Send(new ApplyMigrationCommand { TenantId = tenantId });

        if (!result.IsSuccess)
        {
            if (result.Error?.Code == "Tenant.NotFound")
            {
                return NotFound(new { message = "Tenant bulunamadı" });
            }

            return StatusCode(503, new
            {
                message = "Veritabanı migration hatası",
                error = result.Error?.Description
            });
        }

        var migrationResult = result.Value!;

        return Ok(new
        {
            success = true,
            data = migrationResult
        });
    }

    /// <summary>
    /// Apply migrations to all tenants
    /// </summary>
    [HttpPost("apply-all")]
    public async Task<IActionResult> ApplyMigrationsToAllTenants()
    {
        var result = await _sender.Send(new ApplyMigrationsToAllTenantsCommand());

        if (!result.IsSuccess)
        {
            return StatusCode(503, new
            {
                message = "Veritabanı bağlantı hatası",
                error = result.Error?.Description
            });
        }

        var results = result.Value!;
        var successCount = results.Count(r => r.Success);
        var failureCount = results.Count(r => !r.Success);

        return Ok(new
        {
            success = true,
            data = results
        });
    }

    /// <summary>
    /// Get migration history for specific tenant
    /// </summary>
    [HttpGet("history/{tenantId}")]
    public async Task<IActionResult> GetMigrationHistory(Guid tenantId)
    {
        var result = await _sender.Send(new GetMigrationHistoryQuery(tenantId));

        if (!result.IsSuccess)
        {
            if (result.Error?.Code == "Tenant.NotFound")
            {
                return NotFound(new { message = "Tenant bulunamadı" });
            }

            return StatusCode(503, new
            {
                message = "Veritabanı bağlantı hatası",
                error = result.Error?.Description
            });
        }

        var history = result.Value!;

        return Ok(new
        {
            success = true,
            data = history
        });
    }

    /// <summary>
    /// Get SQL script preview for a specific migration
    /// </summary>
    [HttpGet("preview/{tenantId}/{moduleName}/{migrationName}")]
    public async Task<IActionResult> GetMigrationScriptPreview(
        Guid tenantId,
        string moduleName,
        string migrationName)
    {
        var result = await _sender.Send(new GetMigrationScriptPreviewQuery(
            tenantId,
            migrationName,
            moduleName));

        if (!result.IsSuccess)
        {
            return StatusCode(503, new
            {
                message = "Migration preview alınamadı",
                error = result.Error?.Description
            });
        }

        var preview = result.Value!;

        return Ok(new
        {
            success = true,
            data = preview
        });
    }

    /// <summary>
    /// Rollback a specific migration
    /// </summary>
    [HttpPost("rollback/{tenantId}/{moduleName}/{migrationName}")]
    public async Task<IActionResult> RollbackMigration(
        Guid tenantId,
        string moduleName,
        string migrationName)
    {
        var result = await _sender.Send(new RollbackMigrationCommand(
            tenantId,
            migrationName,
            moduleName));

        if (!result.IsSuccess)
        {
            return StatusCode(503, new
            {
                message = "Migration geri alınamadı",
                error = result.Error?.Description
            });
        }

        var rollbackResult = result.Value!;

        return Ok(new
        {
            success = true,
            data = rollbackResult
        });
    }

    /// <summary>
    /// Schedule a migration for a specific time
    /// </summary>
    [HttpPost("schedule")]
    public async Task<IActionResult> ScheduleMigration([FromBody] ScheduleMigrationRequest request)
    {
        var result = await _sender.Send(new ScheduleMigrationCommand(
            request.TenantId,
            request.ScheduledTime,
            request.MigrationName,
            request.ModuleName));

        if (!result.IsSuccess)
        {
            return StatusCode(503, new
            {
                message = "Migration zamanlanamadı",
                error = result.Error?.Description
            });
        }

        var scheduleResult = result.Value!;

        return Ok(new
        {
            success = true,
            data = scheduleResult
        });
    }

    /// <summary>
    /// Get all scheduled migrations
    /// </summary>
    [HttpGet("scheduled")]
    public async Task<IActionResult> GetScheduledMigrations()
    {
        var result = await _sender.Send(new GetScheduledMigrationsQuery());

        if (!result.IsSuccess)
        {
            return StatusCode(503, new
            {
                message = "Zamanlanmış migrationlar alınamadı",
                error = result.Error?.Description
            });
        }

        var scheduled = result.Value!;

        return Ok(new
        {
            success = true,
            data = scheduled
        });
    }

    /// <summary>
    /// Cancel a scheduled migration
    /// </summary>
    [HttpDelete("scheduled/{scheduleId}")]
    public async Task<IActionResult> CancelScheduledMigration(Guid scheduleId)
    {
        var result = await _sender.Send(new CancelScheduledMigrationCommand(scheduleId));

        if (!result.IsSuccess)
        {
            return StatusCode(503, new
            {
                message = "Zamanlanmış migration iptal edilemedi",
                error = result.Error?.Description
            });
        }

        var cancelled = result.Value;

        return Ok(new
        {
            success = true,
            data = cancelled
        });
    }

    /// <summary>
    /// Get migration settings
    /// </summary>
    [HttpGet("settings")]
    public async Task<IActionResult> GetMigrationSettings()
    {
        var result = await _sender.Send(new GetMigrationSettingsQuery());

        if (!result.IsSuccess)
        {
            return StatusCode(503, new
            {
                message = "Migration ayarları alınamadı",
                error = result.Error?.Description
            });
        }

        var settings = result.Value!;

        return Ok(new
        {
            success = true,
            data = settings
        });
    }

    /// <summary>
    /// Update migration settings
    /// </summary>
    [HttpPut("settings")]
    public async Task<IActionResult> UpdateMigrationSettings([FromBody] MigrationSettingsDto settings)
    {
        var result = await _sender.Send(new UpdateMigrationSettingsCommand(settings));

        if (!result.IsSuccess)
        {
            return StatusCode(503, new
            {
                message = "Migration ayarları güncellenemedi",
                error = result.Error?.Description
            });
        }

        var updatedSettings = result.Value!;

        return Ok(new
        {
            success = true,
            data = updatedSettings
        });
    }
}

public record ScheduleMigrationRequest(
    Guid TenantId,
    DateTime ScheduledTime,
    string? MigrationName = null,
    string? ModuleName = null);

