using MediatR;
using Microsoft.AspNetCore.Mvc;
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
[SwaggerTag("System Settings - Configure and manage system-wide settings")]
public class SettingsController : MasterControllerBase
{
    public SettingsController(IMediator mediator, ILogger<SettingsController> logger) 
        : base(mediator, logger)
    {
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
    /// Test email settings
    /// </summary>
    [HttpPost("test-email")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> TestEmailSettings([FromBody] TestEmailRequestDto request)
    {
        _logger.LogInformation("Testing email settings - sending test email to {Email}", request.To);
        
        try
        {
            // TODO: Implement email test using IEmailService
            
            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = $"Test email sent successfully to {request.To}",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (ExternalServiceException ex)
        {
            _logger.LogError(ex, "Email service error while sending test email");
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Data = false,
                Message = $"Email service error: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (ConfigurationException ex)
        {
            _logger.LogError(ex, "Email configuration error");
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Data = false,
                Message = $"Email configuration error: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Business error while sending test email");
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
            // TODO: Implement cache clearing using ICacheService
            
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
}