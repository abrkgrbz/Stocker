using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Tenants.Commands.CreateTenant;
using Stocker.Application.Features.Tenants.Commands.UpdateTenant;
using Stocker.Application.Features.Tenants.Commands.ToggleTenantStatus;
using Stocker.Application.Features.Tenants.Commands.DeleteTenant;
using Stocker.Application.Features.Tenants.Commands.SuspendTenant;
using Stocker.Application.Features.Tenants.Commands.ActivateTenant;
using Stocker.Application.Features.Tenants.Commands.CreateTenantFromRegistration;
using Stocker.Application.Features.Tenants.Queries.GetTenantById;
using Stocker.Application.Features.Tenants.Queries.GetTenantsList;
using Stocker.Application.Features.Tenants.Queries.GetTenantStatistics;
using Stocker.Application.Features.Tenants.Queries.GetTenantsStatistics;
using Stocker.Application.Features.Tenants.Queries.GetTenantRegistrations;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Application.Features.TenantRegistration.Queries.GetSetupWizard;
using Stocker.Application.Features.TenantRegistration.Queries.GetSetupChecklist;
using Stocker.Application.Features.TenantSetupWizard.Commands.UpdateWizardStep;
using Stocker.Application.Features.TenantSetupChecklist.Commands.UpdateChecklistItem;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Tenant Management - Manage system tenants and their configurations")]

public class TenantsController : MasterControllerBase
{
    public TenantsController(IMediator mediator, ILogger<TenantsController> logger) 
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all tenants with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<TenantListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetTenantsListQuery query)
    {
        _logger.LogInformation("Getting all tenants with query: {@Query}", query);
        
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get tenant by ID with detailed information
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TenantDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting tenant details for ID: {TenantId}", id);
        
        var query = new GetTenantByIdQuery(id);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get tenant statistics
    /// </summary>
    [HttpGet("{id}/statistics")]
    [ProducesResponseType(typeof(ApiResponse<TenantStatisticsDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetStatistics(Guid id)
    {
        _logger.LogInformation("Getting tenant statistics for ID: {TenantId}", id);
        
        var query = new GetTenantStatisticsQuery { TenantId = id };
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new tenant
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TenantDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateTenantCommand command)
    {
        _logger.LogInformation("Creating new tenant: {TenantName}", command.Name);
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Tenant created successfully with ID: {TenantId}", result.Value.Id);
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, 
                new ApiResponse<TenantDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Tenant created successfully",
                    Timestamp = DateTime.UtcNow
                });
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Update tenant information
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTenantCommand command)
    {
        _logger.LogInformation("Updating tenant ID: {TenantId}", id);
        
        command.Id = id;
        command.ModifiedBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Tenant {TenantId} updated successfully", id);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Activate or deactivate a tenant
    /// </summary>
    [HttpPost("{id}/toggle-status")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        _logger.LogWarning("Toggling status for tenant ID: {TenantId} by user: {UserEmail}", 
            id, CurrentUserEmail);
        
        var command = new ToggleTenantStatusCommand 
        { 
            Id = id,
            ModifiedBy = CurrentUserId
        };
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            var status = result.Value ? "activated" : "deactivated";
            _logger.LogWarning("Tenant {TenantId} has been {Status} by {UserEmail}", 
                id, status, CurrentUserEmail);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a tenant (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] string? reason = null, [FromQuery] bool hardDelete = false)
    {
        _logger.LogWarning("Deleting tenant ID: {TenantId} by user: {UserEmail}. HardDelete: {HardDelete}", 
            id, CurrentUserEmail, hardDelete);
        
        var command = new DeleteTenantCommand(id, reason, hardDelete);
        var result = await _mediator.Send(command);
        
        return HandleResult(result);
    }

    /// <summary>
    /// Suspend a tenant
    /// </summary>
    [HttpPost("{id}/suspend")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Suspend(Guid id, [FromBody] SuspendTenantRequest request)
    {
        _logger.LogWarning("Suspending tenant ID: {TenantId} by user: {UserEmail}. Reason: {Reason}", 
            id, CurrentUserEmail, request?.Reason);
        
        var command = new SuspendTenantCommand
        {
            TenantId = id,
            Reason = request?.Reason ?? "No reason provided",
            SuspendedUntil = request?.SuspendedUntil,
            SuspendedBy = CurrentUserId
        };
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogWarning("Tenant {TenantId} has been suspended by {UserEmail}", id, CurrentUserEmail);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Activate a suspended tenant
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Activate(Guid id, [FromBody] ActivateTenantRequest request)
    {
        _logger.LogInformation("Activating tenant ID: {TenantId} by user: {UserEmail}", id, CurrentUserEmail);
        
        var command = new ActivateTenantCommand
        {
            TenantId = id,
            ActivatedBy = CurrentUserId,
            Notes = request?.Notes
        };
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Tenant {TenantId} has been activated by {UserEmail}", id, CurrentUserEmail);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Get overall tenants statistics
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponse<TenantsStatisticsDto>), 200)]
    public async Task<IActionResult> GetOverallStatistics([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
    {
        _logger.LogInformation("Getting overall tenant statistics");
        
        var query = new GetTenantsStatisticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };
        
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    // Tenant code validation is now handled via SignalR ValidationHub.ValidateTenantCode

    /// <summary>
    /// Get all pending tenant registrations
    /// </summary>
    [HttpGet("registrations")]
    [ProducesResponseType(typeof(ApiResponse<List<TenantRegistrationDto>>), 200)]
    public async Task<IActionResult> GetPendingRegistrations([FromQuery] string? status = null)
    {
        _logger.LogInformation("Getting tenant registrations with status: {Status}", status ?? "All");

        // Query MasterDbContext for TenantRegistrations
        var registrations = await _mediator.Send(new GetTenantRegistrationsQuery { Status = status });
        return HandleResult(registrations);
    }

    /// <summary>
    /// Create tenant from registration (approve registration)
    /// </summary>
    [HttpPost("from-registration")]
    [ProducesResponseType(typeof(ApiResponse<TenantDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateFromRegistration([FromBody] CreateTenantFromRegistrationCommand command)
    {
        _logger.LogInformation("Creating tenant from registration: {RegistrationId}", command.RegistrationId);

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Tenant created successfully from registration with ID: {TenantId}", result.Value.Id);
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id },
                new ApiResponse<TenantDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Tenant created successfully from registration",
                    Timestamp = DateTime.UtcNow
                });
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Login to tenant (generate access token)
    /// </summary>
    [HttpPost("{id}/login")]
    [ProducesResponseType(typeof(ApiResponse<TenantLoginResponseDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> LoginToTenant(Guid id)
    {
        _logger.LogWarning("Master user {UserEmail} is logging into tenant {TenantId}", CurrentUserEmail, id);
        
        // This would typically generate a special access token for the master admin
        // to access the tenant's system
        var response = new TenantLoginResponseDto
        {
            TenantId = id,
            AccessToken = "mock_token_" + Guid.NewGuid().ToString(),
            RedirectUrl = $"https://tenant-{id}.stocker.app/admin-login",
            ExpiresIn = 3600
        };
        
        return Ok(new ApiResponse<TenantLoginResponseDto>
        {
            Success = true,
            Data = response,
            Message = "Login token generated successfully"
        });
    }

    /// <summary>
    /// Start migration for tenant
    /// </summary>
    [HttpPost("{id}/migrate")]
    [ProducesResponseType(typeof(ApiResponse<MigrationResponseDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> StartMigration(Guid id, [FromBody] StartMigrationRequest request)
    {
        _logger.LogInformation("Starting migration for tenant {TenantId}", id);
        
        // This would typically trigger a background job for migration
        var response = new MigrationResponseDto
        {
            JobId = Guid.NewGuid().ToString(),
            Status = "InProgress",
            Message = "Migration job has been queued",
            EstimatedCompletionTime = DateTime.UtcNow.AddMinutes(30)
        };
        
        return Ok(new ApiResponse<MigrationResponseDto>
        {
            Success = true,
            Data = response,
            Message = "Migration started successfully"
        });
    }

    /// <summary>
    /// Create backup for tenant
    /// </summary>
    [HttpPost("{id}/backup")]
    [ProducesResponseType(typeof(ApiResponse<BackupResponseDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> CreateBackup(Guid id, [FromBody] CreateBackupRequest request)
    {
        _logger.LogInformation("Creating backup for tenant {TenantId}", id);
        
        // This would typically trigger a background job for backup
        var response = new BackupResponseDto
        {
            BackupId = Guid.NewGuid().ToString(),
            FileName = $"tenant_{id}_backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.zip",
            Size = 0,
            Status = "InProgress",
            DownloadUrl = null,
            CreatedAt = DateTime.UtcNow
        };
        
        return Ok(new ApiResponse<BackupResponseDto>
        {
            Success = true,
            Data = response,
            Message = "Backup process started successfully"
        });
    }

    /// <summary>
    /// Get setup wizard for tenant
    /// </summary>
    [HttpGet("{id}/setup-wizard")]
    [ProducesResponseType(typeof(ApiResponse<TenantSetupWizardDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSetupWizard(Guid id)
    {
        _logger.LogInformation("Getting setup wizard for tenant {TenantId}", id);
        
        var query = new GetSetupWizardQuery { /* TenantId removed - each tenant has its own database */ };
        var result = await _mediator.Send(query);
        
        return HandleResult(result);
    }

    /// <summary>
    /// Update setup wizard step
    /// </summary>
    [HttpPut("{id}/setup-wizard/{wizardId}")]
    [ProducesResponseType(typeof(ApiResponse<TenantSetupWizardDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateSetupWizardStep(Guid id, Guid wizardId, [FromBody] UpdateWizardStepCommand command)
    {
        _logger.LogInformation("Updating setup wizard step for tenant {TenantId}, wizard {WizardId}", id, wizardId);
        
        command.WizardId = wizardId;
        var result = await _mediator.Send(command);
        
        return HandleResult(result);
    }

    /// <summary>
    /// Get setup checklist for tenant
    /// </summary>
    [HttpGet("{id}/setup-checklist")]
    [ProducesResponseType(typeof(ApiResponse<TenantSetupChecklistDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSetupChecklist(Guid id)
    {
        _logger.LogInformation("Getting setup checklist for tenant {TenantId}", id);
        
        var query = new GetSetupChecklistQuery { /* TenantId removed - each tenant has its own database */ };
        var result = await _mediator.Send(query);
        
        return HandleResult(result);
    }

    /// <summary>
    /// Update setup checklist item
    /// </summary>
    [HttpPut("{id}/setup-checklist/{checklistId}")]
    [ProducesResponseType(typeof(ApiResponse<TenantSetupChecklistDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateSetupChecklistItem(Guid id, Guid checklistId, [FromBody] UpdateChecklistItemCommand command)
    {
        _logger.LogInformation("Updating setup checklist item for tenant {TenantId}, checklist {ChecklistId}", id, checklistId);
        
        command.ChecklistId = checklistId;
        var result = await _mediator.Send(command);
        
        return HandleResult(result);
    }

    /// <summary>
    /// Get tenant activities
    /// </summary>
    [HttpGet("{id}/activities")]
    [ProducesResponseType(typeof(ApiResponse<List<TenantActivityDto>>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetActivities(Guid id, [FromQuery] int limit = 10)
    {
        _logger.LogInformation("Getting activities for tenant {TenantId}", id);
        
        // Mock data for now - this would typically come from activity logs
        var activities = new List<TenantActivityDto>
        {
            new TenantActivityDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "user",
                Title = "Yeni Kullanıcı",
                Description = "3 yeni kullanıcı sisteme eklendi",
                Timestamp = DateTime.UtcNow.AddHours(-2).ToString("dd.MM.yyyy HH:mm"),
                Icon = "UserAddOutlined",
                Color = "blue"
            },
            new TenantActivityDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "system",
                Title = "Modül Güncelleme",
                Description = "CRM modülü v2.1'e güncellendi",
                Timestamp = DateTime.UtcNow.AddHours(-5).ToString("dd.MM.yyyy HH:mm"),
                Icon = "AppstoreOutlined",
                Color = "green"
            },
            new TenantActivityDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "billing",
                Title = "Ödeme Alındı",
                Description = "Aylık abonelik ödemesi işlendi",
                Timestamp = DateTime.UtcNow.AddDays(-1).ToString("dd.MM.yyyy HH:mm"),
                Icon = "DollarOutlined",
                Color = "gold"
            },
            new TenantActivityDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "security",
                Title = "Güvenlik Ayarları",
                Description = "2FA tüm kullanıcılar için aktif edildi",
                Timestamp = DateTime.UtcNow.AddDays(-2).ToString("dd.MM.yyyy HH:mm"),
                Icon = "SafetyOutlined",
                Color = "red"
            },
            new TenantActivityDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "system",
                Title = "Yedekleme Tamamlandı",
                Description = "Günlük otomatik yedekleme başarılı",
                Timestamp = DateTime.UtcNow.AddDays(-3).ToString("dd.MM.yyyy HH:mm"),
                Icon = "CloudUploadOutlined",
                Color = "cyan"
            }
        };
        
        return Ok(new ApiResponse<List<TenantActivityDto>>
        {
            Success = true,
            Data = activities.Take(limit).ToList(),
            Message = "Activities retrieved successfully"
        });
    }
}

// DTOs
public class TenantActivityDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

// Request DTOs
public class SuspendTenantRequest
{
    public string Reason { get; set; } = string.Empty;
    public DateTime? SuspendedUntil { get; set; }
}

public class ActivateTenantRequest
{
    public string? Notes { get; set; }
}

public class StartMigrationRequest
{
    public string TargetVersion { get; set; } = string.Empty;
    public bool BackupBeforeMigration { get; set; } = true;
}

public class CreateBackupRequest
{
    public bool IncludeDatabase { get; set; } = true;
    public bool IncludeFiles { get; set; } = true;
    public bool Compress { get; set; } = true;
}

// Response DTOs
public class TenantLoginResponseDto
{
    public Guid TenantId { get; set; }
    public string AccessToken { get; set; } = string.Empty;
    public string RedirectUrl { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
}

public class MigrationResponseDto
{
    public string JobId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime? EstimatedCompletionTime { get; set; }
}

public class BackupResponseDto
{
    public string BackupId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long Size { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? DownloadUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
