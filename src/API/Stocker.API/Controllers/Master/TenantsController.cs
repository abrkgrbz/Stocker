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
using Stocker.Application.DTOs.Tenant.AuditLogs;
using Stocker.Application.DTOs.Security;
using Stocker.Application.Features.TenantRegistration.Queries.GetSetupWizard;
using Stocker.Application.Features.TenantRegistration.Queries.GetSetupChecklist;
using Stocker.Application.Features.TenantSetupWizard.Commands.UpdateWizardStep;
using Stocker.Application.Features.TenantSetupChecklist.Commands.UpdateChecklistItem;
using Stocker.Application.Features.Tenants.Queries.GetTenantSettings;
using Stocker.Application.Features.Tenants.Commands.UpdateTenantSettings;
using Stocker.Application.Features.Tenants.Commands.LoginToTenant;
using Stocker.Application.Features.Tenant.AuditLogs.Queries;
using Swashbuckle.AspNetCore.Annotations;
using System.Text;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - Tenant Management")]

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

    // Tenant code validation is now handled via SignalR ValidationHub.ValidateTenantCode

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
    /// Login to tenant (impersonation - generate access token for tenant)
    /// </summary>
    [HttpPost("{id}/login")]
    [ProducesResponseType(typeof(ApiResponse<LoginToTenantResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> LoginToTenant(Guid id)
    {
        _logger.LogWarning("Master user {UserEmail} is logging into tenant {TenantId}", CurrentUserEmail, id);

        var command = new LoginToTenantCommand
        {
            TenantId = id,
            MasterUserId = CurrentUserId,
            MasterUserEmail = CurrentUserEmail
        };

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogWarning(
                "Master user {UserEmail} successfully obtained impersonation token for tenant {TenantCode} ({TenantId})",
                CurrentUserEmail, result.Value!.TenantCode, id);
        }

        return HandleResult(result);
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
    /// Get tenant activities (recent audit logs summary)
    /// </summary>
    [HttpGet("{id}/activities")]
    [ProducesResponseType(typeof(ApiResponse<List<TenantActivityDto>>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetActivities(Guid id, [FromQuery] int limit = 10)
    {
        _logger.LogInformation("Getting activities for tenant {TenantId}", id);

        var query = new GetTenantAuditLogsQuery
        {
            TenantId = id,
            PageNumber = 1,
            PageSize = limit
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return HandleResult(result);

        // Map SecurityAuditLogListDto to TenantActivityDto
        var activities = result.Value!.Logs.Select(log => new TenantActivityDto
        {
            Id = log.Id.ToString(),
            Type = GetActivityType(log.Event),
            Title = GetActivityTitle(log.Event),
            Description = $"{log.Event} - {log.Email ?? "System"}",
            Timestamp = log.Timestamp.ToString("dd.MM.yyyy HH:mm"),
            Icon = GetActivityIcon(log.Event),
            Color = GetActivityColor(log.RiskLevel)
        }).ToList();

        return Ok(new ApiResponse<List<TenantActivityDto>>
        {
            Success = true,
            Data = activities,
            Message = "Activities retrieved successfully"
        });
    }

    private static string GetActivityType(string eventName) => eventName switch
    {
        var e when e.Contains("login", StringComparison.OrdinalIgnoreCase) => "auth",
        var e when e.Contains("user", StringComparison.OrdinalIgnoreCase) => "user",
        var e when e.Contains("payment", StringComparison.OrdinalIgnoreCase) || e.Contains("billing", StringComparison.OrdinalIgnoreCase) => "billing",
        var e when e.Contains("security", StringComparison.OrdinalIgnoreCase) || e.Contains("blocked", StringComparison.OrdinalIgnoreCase) => "security",
        _ => "system"
    };

    private static string GetActivityTitle(string eventName) => eventName switch
    {
        "login_success" => "Kullanıcı Girişi",
        "login_failed" => "Başarısız Giriş",
        "logout" => "Çıkış Yapıldı",
        "user_created" => "Yeni Kullanıcı",
        "user_updated" => "Kullanıcı Güncellendi",
        "password_changed" => "Şifre Değiştirildi",
        "token_refresh" => "Oturum Yenilendi",
        _ => eventName
    };

    private static string GetActivityIcon(string eventName) => eventName switch
    {
        var e when e.Contains("login", StringComparison.OrdinalIgnoreCase) => "LoginOutlined",
        var e when e.Contains("user", StringComparison.OrdinalIgnoreCase) => "UserOutlined",
        var e when e.Contains("payment", StringComparison.OrdinalIgnoreCase) => "DollarOutlined",
        var e when e.Contains("security", StringComparison.OrdinalIgnoreCase) => "SafetyOutlined",
        var e when e.Contains("blocked", StringComparison.OrdinalIgnoreCase) => "StopOutlined",
        _ => "InfoCircleOutlined"
    };

    private static string GetActivityColor(string? riskLevel) => riskLevel switch
    {
        "Critical" => "red",
        "High" => "orange",
        "Medium" => "gold",
        "Low" => "blue",
        _ => "green"
    };

    /// <summary>
    /// Get detailed activity logs for a tenant with filtering and pagination
    /// </summary>
    [HttpGet("{id}/activity-logs")]
    [ProducesResponseType(typeof(ApiResponse<ActivityLogsResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetActivityLogs(
        Guid id,
        [FromQuery] string? category = null,
        [FromQuery] string? severity = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? searchTerm = null)
    {
        _logger.LogInformation(
            "Getting activity logs for tenant {TenantId} with filters - Category: {Category}, Severity: {Severity}, Page: {Page}/{Size}",
            id, category, severity, pageNumber, pageSize);

        var query = new GetTenantAuditLogsQuery
        {
            TenantId = id,
            FromDate = startDate,
            ToDate = endDate,
            Event = category != "all" ? category : null,
            Severity = severity != "all" ? severity : null,
            SearchTerm = searchTerm,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return HandleResult(result);

        // Map to ActivityLogsResponse format
        var logs = result.Value!.Logs.Select(log => new ActivityLogDto
        {
            Id = log.Id.ToString(),
            Timestamp = log.Timestamp,
            Action = log.Event,
            Category = GetActivityType(log.Event),
            Severity = log.RiskLevel?.ToLower() ?? "info",
            User = new ActivityLogUserDto
            {
                Id = Guid.Empty.ToString(),
                Name = log.Email?.Split('@')[0] ?? "System",
                Email = log.Email ?? "system@stocker.app",
                Role = "User"
            },
            Target = "System",
            Description = log.Event,
            IpAddress = log.IpAddress ?? "",
            UserAgent = "",
            Location = null
        }).ToList();

        var response = new ActivityLogsResponse
        {
            Logs = logs,
            TotalCount = result.Value.TotalCount,
            PageNumber = result.Value.PageNumber,
            PageSize = result.Value.PageSize
        };

        return Ok(new ApiResponse<ActivityLogsResponse>
        {
            Success = true,
            Data = response,
            Message = "Activity logs retrieved successfully"
        });
    }

    /// <summary>
    /// Get security events for a tenant (login failures, blocked attempts, etc.)
    /// </summary>
    [HttpGet("{id}/security-events")]
    [ProducesResponseType(typeof(ApiResponse<SecurityEventsResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSecurityEvents(
        Guid id,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? minRiskScore = null,
        [FromQuery] bool? blockedOnly = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        _logger.LogInformation("Getting security events for tenant {TenantId}", id);

        // Query security-related events (login_failed, blocked, high risk, etc.)
        var query = new GetTenantAuditLogsQuery
        {
            TenantId = id,
            FromDate = startDate,
            ToDate = endDate,
            MinRiskScore = minRiskScore ?? 50, // Default: only medium+ risk events
            Blocked = blockedOnly,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return HandleResult(result);

        // Filter and map to security events
        var securityEvents = result.Value!.Logs
            .Where(log => IsSecurityEvent(log.Event, log.RiskScore ?? 0))
            .Select(log => new SecurityEventDto
            {
                Id = log.Id.ToString(),
                Timestamp = log.Timestamp,
                EventType = log.Event,
                Severity = MapRiskToSeverity(log.RiskScore ?? 0),
                Email = log.Email ?? "Unknown",
                IpAddress = log.IpAddress ?? "Unknown",
                RiskScore = log.RiskScore ?? 0,
                Blocked = log.Blocked,
                Description = GetSecurityEventDescription(log.Event, log.Email, log.IpAddress),
                Location = null // SecurityAuditLogListDto does not include location data
            }).ToList();

        var response = new SecurityEventsResponse
        {
            Events = securityEvents,
            TotalCount = result.Value.TotalCount,
            PageNumber = result.Value.PageNumber,
            PageSize = result.Value.PageSize,
            Summary = new SecurityEventsSummary
            {
                TotalEvents = securityEvents.Count,
                BlockedAttempts = securityEvents.Count(e => e.Blocked),
                HighRiskEvents = securityEvents.Count(e => e.RiskScore >= 70),
                FailedLogins = securityEvents.Count(e => e.EventType.Contains("failed", StringComparison.OrdinalIgnoreCase))
            }
        };

        return Ok(new ApiResponse<SecurityEventsResponse>
        {
            Success = true,
            Data = response,
            Message = "Security events retrieved successfully"
        });
    }

    private static bool IsSecurityEvent(string eventName, int riskScore)
    {
        // High risk events are always security events
        if (riskScore >= 50) return true;

        // Security-related event names
        var securityKeywords = new[] { "failed", "blocked", "invalid", "expired", "unauthorized", "suspicious", "attack", "brute" };
        return securityKeywords.Any(keyword => eventName.Contains(keyword, StringComparison.OrdinalIgnoreCase));
    }

    private static string MapRiskToSeverity(int riskScore) => riskScore switch
    {
        >= 80 => "critical",
        >= 60 => "high",
        >= 40 => "medium",
        >= 20 => "low",
        _ => "info"
    };

    private static string GetSecurityEventDescription(string eventName, string? email, string? ipAddress)
    {
        var user = email ?? "Unknown user";
        var ip = ipAddress ?? "unknown IP";

        return eventName.ToLower() switch
        {
            "login_failed" => $"Failed login attempt for {user} from {ip}",
            "login_blocked" => $"Login blocked for {user} from {ip}",
            "brute_force_detected" => $"Brute force attack detected from {ip}",
            "invalid_token" => $"Invalid token used by {user}",
            "token_expired" => $"Expired token used by {user}",
            "suspicious_activity" => $"Suspicious activity detected for {user} from {ip}",
            "unauthorized_access" => $"Unauthorized access attempt by {user}",
            _ => $"{eventName} - {user} from {ip}"
        };
    }

    /// <summary>
    /// Export activity logs to CSV file
    /// </summary>
    [HttpGet("{id}/activity-logs/export")]
    [ProducesResponseType(typeof(FileResult), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ExportActivityLogs(
        Guid id,
        [FromQuery] string? category = null,
        [FromQuery] string? severity = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string format = "csv")
    {
        _logger.LogInformation("Exporting activity logs for tenant {TenantId} in {Format} format", id, format);

        // Get all activity logs for export (use larger page size)
        var query = new GetTenantAuditLogsQuery
        {
            TenantId = id,
            FromDate = startDate ?? DateTime.UtcNow.AddMonths(-1),
            ToDate = endDate ?? DateTime.UtcNow,
            Event = category != "all" ? category : null,
            Severity = severity != "all" ? severity : null,
            PageNumber = 1,
            PageSize = 10000 // Max export size
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return HandleResult(result);

        var logs = result.Value!.Logs;

        // Generate CSV content
        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("ID,Timestamp,Event,Category,Severity,Email,IP Address,Risk Score,Blocked,Tenant Code");

        foreach (var log in logs)
        {
            csvBuilder.AppendLine($"\"{log.Id}\",\"{log.Timestamp:yyyy-MM-dd HH:mm:ss}\",\"{EscapeCsvField(log.Event)}\",\"{GetActivityType(log.Event)}\",\"{log.RiskLevel ?? "info"}\",\"{EscapeCsvField(log.Email ?? "")}\",\"{log.IpAddress ?? ""}\",{log.RiskScore ?? 0},{log.Blocked},\"{EscapeCsvField(log.TenantCode ?? "")}\"");
        }

        var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
        var fileName = $"activity_logs_{id}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        return File(bytes, "text/csv", fileName);
    }

    private static string EscapeCsvField(string field)
    {
        if (string.IsNullOrEmpty(field)) return "";
        return field.Replace("\"", "\"\"");
    }

    /// <summary>
    /// Get tenant settings
    /// </summary>
    [HttpGet("{id}/settings")]
    [ProducesResponseType(typeof(ApiResponse<GetTenantSettingsResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSettings(Guid id)
    {
        _logger.LogInformation("Getting settings for tenant {TenantId}", id);

        var query = new GetTenantSettingsQuery { TenantId = id };
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Update tenant settings
    /// </summary>
    [HttpPut("{id}/settings")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateSettings(Guid id, [FromBody] UpdateTenantSettingsCommand command)
    {
        _logger.LogInformation("Updating settings for tenant {TenantId}", id);

        command = command with { TenantId = id };
        var result = await _mediator.Send(command);

        return HandleResult(result);
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

// Activity Log DTOs
public class ActivityLogDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // auth, user, data, system, billing, security, api
    public string Severity { get; set; } = string.Empty; // info, warning, error, success
    public ActivityLogUserDto User { get; set; } = new();
    public string? Target { get; set; }
    public string Description { get; set; } = string.Empty;
    public object? Details { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? SessionId { get; set; }
}

public class ActivityLogUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class ActivityLogsResponse
{
    public List<ActivityLogDto> Logs { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
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

// Security Event DTOs
public class SecurityEventDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty; // critical, high, medium, low, info
    public string Email { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public bool Blocked { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
}

public class SecurityEventsResponse
{
    public List<SecurityEventDto> Events { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public SecurityEventsSummary Summary { get; set; } = new();
}

public class SecurityEventsSummary
{
    public int TotalEvents { get; set; }
    public int BlockedAttempts { get; set; }
    public int HighRiskEvents { get; set; }
    public int FailedLogins { get; set; }
}
