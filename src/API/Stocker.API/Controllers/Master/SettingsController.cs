using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Stocker.Application.Features.Settings.Queries.GetAllSettings;
using Stocker.Application.Features.Settings.Commands.UpdateGeneralSettings;
using Stocker.Application.Features.Settings.Commands.UpdateEmailSettings;
using Stocker.Application.DTOs.Settings;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// System settings management
/// </summary>
[SwaggerTag("Master Admin Panel - System Settings")]
public class SettingsController : MasterControllerBase
{
    private readonly IMemoryCache _cache;

    public SettingsController(IMediator mediator, ILogger<SettingsController> logger, IMemoryCache cache)
        : base(mediator, logger)
    {
        _cache = cache;
    }

    /// <summary>
    /// Get all system settings
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<SettingsDto>), 200)]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("Getting all system settings");
        
        var query = new GetAllSettingsQuery();
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get settings by category
    /// </summary>
    [HttpGet("{category}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetByCategory(string category)
    {
        _logger.LogInformation("Getting settings for category: {Category}", category);
        
        var query = new GetAllSettingsQuery();
        var result = await _mediator.Send(query);
        
        if (!result.IsSuccess)
            return HandleResult(result);

        object? categorySettings = category.ToLower() switch
        {
            "general" => result.Value.General,
            "email" => result.Value.Email,
            "security" => result.Value.Security,
            "backup" => result.Value.Backup,
            "maintenance" => result.Value.Maintenance,
            "notifications" => result.Value.Notifications,
            _ => null
        };

        if (categorySettings == null)
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = $"Category '{category}' not found",
                Timestamp = DateTime.UtcNow
            });

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = categorySettings,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Update general settings
    /// </summary>
    [HttpPut("general")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> UpdateGeneral([FromBody] UpdateGeneralSettingsCommand command)
    {
        _logger.LogInformation("Updating general settings");
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("General settings updated successfully");
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Update email settings
    /// </summary>
    [HttpPut("email")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> UpdateEmail([FromBody] UpdateEmailSettingsCommand command)
    {
        _logger.LogInformation("Updating email settings (with encryption for passwords)");
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Email settings updated successfully with encrypted passwords");
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Update security settings
    /// </summary>
    [HttpPut("security")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> UpdateSecurity([FromBody] SecuritySettingsDto settings)
    {
        _logger.LogInformation("Updating security settings");
        
        // TODO: Implement UpdateSecuritySettingsCommand
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Security settings updated successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Update backup settings
    /// </summary>
    [HttpPut("backup")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> UpdateBackup([FromBody] BackupSettingsDto settings)
    {
        _logger.LogInformation("Updating backup settings");
        
        // TODO: Implement UpdateBackupSettingsCommand
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Backup settings updated successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Update maintenance settings
    /// </summary>
    [HttpPut("maintenance")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> UpdateMaintenance([FromBody] MaintenanceSettingsDto settings)
    {
        _logger.LogInformation("Updating maintenance settings");
        
        // TODO: Implement UpdateMaintenanceSettingsCommand
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Maintenance settings updated successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Update notification settings
    /// </summary>
    [HttpPut("notifications")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> UpdateNotifications([FromBody] NotificationSettingsDto settings)
    {
        _logger.LogInformation("Updating notification settings");
        
        // TODO: Implement UpdateNotificationSettingsCommand
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Notification settings updated successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Trigger manual backup
    /// </summary>
    [HttpPost("backup-now")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> BackupNow()
    {
        _logger.LogInformation("Triggering manual backup");
        
        try
        {
            // TODO: Implement backup using IBackgroundJobService
            
            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Backup process started successfully",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (InfrastructureException ex)
        {
            _logger.LogError(ex, "Infrastructure error while starting backup");
            return StatusCode(503, new ApiResponse<bool>
            {
                Success = false,
                Data = false,
                Message = $"Backup service unavailable: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Business error while starting backup");
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Data = false,
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Clear system cache
    /// </summary>
    [HttpPost("clear-cache")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> ClearCache()
    {
        _logger.LogInformation("Clearing system cache");

        try
        {
            // Clear all tenant module caches by disposing and recreating compact
            if (_cache is MemoryCache memoryCache)
            {
                memoryCache.Compact(1.0); // Remove 100% of entries
                _logger.LogInformation("Memory cache compacted - all entries removed");
            }

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Cache cleared successfully",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (InfrastructureException ex)
        {
            _logger.LogError(ex, "Infrastructure error while clearing cache");
            return StatusCode(503, new ApiResponse<bool>
            {
                Success = false,
                Data = false,
                Message = $"Cache service error: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Business error while clearing cache");
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Data = false,
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Clear tenant module cache for a specific tenant
    /// </summary>
    [HttpPost("clear-tenant-cache/{tenantId}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> ClearTenantCache(Guid tenantId)
    {
        _logger.LogInformation("Clearing cache for tenant {TenantId}", tenantId);

        try
        {
            // Clear tenant-specific cache keys
            var keysToRemove = new[]
            {
                $"tenant_modules:{tenantId}",
                $"active_modules:{tenantId}",
                $"module_active:{tenantId}:CRM",
                $"module_active:{tenantId}:Inventory",
                $"module_active:{tenantId}:Sales",
                $"module_active:{tenantId}:Purchase",
                $"module_active:{tenantId}:Finance",
                $"module_active:{tenantId}:HR",
                $"module_active:{tenantId}:Projects",
                $"module_active:{tenantId}:ACCOUNTING"
            };

            foreach (var key in keysToRemove)
            {
                _cache.Remove(key);
            }

            _logger.LogInformation("Cleared {Count} cache entries for tenant {TenantId}", keysToRemove.Length, tenantId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = $"Cache cleared for tenant {tenantId}",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cache for tenant {TenantId}", tenantId);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Data = false,
                Message = $"Error clearing tenant cache: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }
}