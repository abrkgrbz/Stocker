using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Backup;
using Stocker.Application.Features.Tenant.Backup.Commands;
using Stocker.Application.Features.Tenant.Backup.Queries;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.API.Controllers.Tenant;

/// <summary>
/// Controller for tenant backup and restore operations
/// </summary>
[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class BackupController : ApiController
{
    private readonly IMediator _mediator;
    private readonly Stocker.SharedKernel.Interfaces.ICurrentUserService _currentUserService;
    private readonly IBackupStorageService _backupStorageService;
    private readonly IBackupSchedulingService _backupSchedulingService;

    public BackupController(
        IMediator mediator,
        Stocker.SharedKernel.Interfaces.ICurrentUserService currentUserService,
        IBackupStorageService backupStorageService,
        IBackupSchedulingService backupSchedulingService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
        _backupStorageService = backupStorageService;
        _backupSchedulingService = backupSchedulingService;
    }

    /// <summary>
    /// Get paginated list of backups for the current tenant
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<BackupDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    public async Task<IActionResult> GetBackups(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null,
        [FromQuery] string? backupType = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = "CreatedAt",
        [FromQuery] bool sortDescending = true,
        [FromQuery] string? search = null)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetBackupsQuery
        {
            TenantId = tenantId.Value,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Status = status,
            BackupType = backupType,
            FromDate = fromDate,
            ToDate = toDate,
            SortBy = sortBy,
            SortDescending = sortDescending,
            Search = search
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get a specific backup by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<BackupDetailDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetBackupById(Guid id)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetBackupByIdQuery
        {
            TenantId = tenantId.Value,
            BackupId = id
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get backup statistics for the current tenant
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponse<BackupStatisticsDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    public async Task<IActionResult> GetStatistics()
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetBackupStatisticsQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new backup
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<BackupDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> CreateBackup([FromBody] CreateBackupRequest request)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var userEmail = _currentUserService.Email ?? "system";

        var command = new CreateBackupCommand
        {
            TenantId = tenantId.Value,
            BackupName = request.BackupName,
            BackupType = request.BackupType,
            CreatedBy = userEmail,
            IncludeDatabase = request.IncludeDatabase,
            IncludeFiles = request.IncludeFiles,
            IncludeConfiguration = request.IncludeConfiguration,
            Compress = request.Compress,
            Encrypt = request.Encrypt,
            Description = request.Description
        };

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedResponse(result.Value!, nameof(GetBackupById), new { id = result.Value!.Id });
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Delete a backup
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> DeleteBackup(Guid id)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var userEmail = _currentUserService.Email ?? "system";

        var command = new DeleteBackupCommand
        {
            TenantId = tenantId.Value,
            BackupId = id,
            DeletedBy = userEmail
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Restore from a backup
    /// </summary>
    [HttpPost("{id:guid}/restore")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> RestoreBackup(Guid id, [FromBody] RestoreBackupRequest? request = null)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var userEmail = _currentUserService.Email ?? "system";

        var command = new RestoreBackupCommand
        {
            TenantId = tenantId.Value,
            BackupId = id,
            RestoredBy = userEmail,
            Notes = request?.Notes
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Get download URL for a backup
    /// </summary>
    [HttpGet("{id:guid}/download")]
    [ProducesResponseType(typeof(ApiResponse<BackupDownloadDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetDownloadUrl(Guid id, [FromQuery] int expiryMinutes = 60)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        // First get backup details
        var backupQuery = new GetBackupByIdQuery
        {
            TenantId = tenantId.Value,
            BackupId = id
        };

        var backupResult = await _mediator.Send(backupQuery);
        if (backupResult.IsFailure)
        {
            return HandleResult(backupResult);
        }

        var backup = backupResult.Value;
        if (backup == null || backup.Status != "Completed")
        {
            return BadRequestResponse<object>("Yedek dosyası bulunamadı veya henüz tamamlanmadı");
        }

        // List backup files to find the main file
        var filesResult = await _backupStorageService.ListBackupFilesAsync(
            tenantId.Value,
            id);

        if (filesResult.IsFailure || !filesResult.Value.Any())
        {
            return NotFoundResponse<object>("Yedek dosyası bulunamadı");
        }

        var mainFile = filesResult.Value.FirstOrDefault(f => f.FileName.EndsWith(".zip"));
        if (mainFile == null)
        {
            return NotFoundResponse<object>("Yedek arşivi bulunamadı");
        }

        // Generate download URL
        var urlResult = await _backupStorageService.GetDownloadUrlAsync(
            tenantId.Value,
            id,
            mainFile.FileName,
            expiryMinutes);

        if (urlResult.IsFailure)
        {
            return BadRequestResponse<object>(urlResult.Error.Description);
        }

        return OkResponse(new BackupDownloadDto
        {
            BackupId = id,
            FileName = mainFile.FileName,
            DownloadUrl = urlResult.Value,
            SizeInBytes = mainFile.SizeInBytes,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
        });
    }

    #region Schedule Endpoints

    /// <summary>
    /// Get all backup schedules for the current tenant
    /// </summary>
    [HttpGet("schedules")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<BackupScheduleDto>>), 200)]
    public async Task<IActionResult> GetSchedules()
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var result = await _backupSchedulingService.GetSchedulesAsync(tenantId.Value);

        if (result.IsFailure)
        {
            return BadRequestResponse<object>(result.Error.Description);
        }

        var schedules = result.Value.Select(s => new BackupScheduleDto
        {
            Id = s.Id,
            ScheduleName = s.ScheduleName,
            ScheduleType = s.ScheduleType,
            CronExpression = s.CronExpression,
            BackupType = s.BackupType,
            IncludeDatabase = s.IncludeDatabase,
            IncludeFiles = s.IncludeFiles,
            IncludeConfiguration = s.IncludeConfiguration,
            Compress = s.Compress,
            Encrypt = s.Encrypt,
            RetentionDays = s.RetentionDays,
            IsEnabled = s.IsEnabled,
            LastExecutedAt = s.LastExecutedAt,
            NextExecutionAt = s.NextExecutionAt,
            SuccessCount = s.SuccessCount,
            FailureCount = s.FailureCount,
            LastErrorMessage = s.LastErrorMessage,
            CreatedAt = s.CreatedAt
        });

        return OkResponse(schedules);
    }

    /// <summary>
    /// Get a specific backup schedule
    /// </summary>
    [HttpGet("schedules/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<BackupScheduleDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetSchedule(Guid id)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var result = await _backupSchedulingService.GetScheduleAsync(id);

        if (result.IsFailure)
        {
            return NotFoundResponse<object>(result.Error.Description);
        }

        var s = result.Value;
        if (s.TenantId != tenantId.Value)
        {
            return NotFoundResponse<object>("Zamanlama bulunamadı");
        }

        return OkResponse(new BackupScheduleDto
        {
            Id = s.Id,
            ScheduleName = s.ScheduleName,
            ScheduleType = s.ScheduleType,
            CronExpression = s.CronExpression,
            BackupType = s.BackupType,
            IncludeDatabase = s.IncludeDatabase,
            IncludeFiles = s.IncludeFiles,
            IncludeConfiguration = s.IncludeConfiguration,
            Compress = s.Compress,
            Encrypt = s.Encrypt,
            RetentionDays = s.RetentionDays,
            IsEnabled = s.IsEnabled,
            LastExecutedAt = s.LastExecutedAt,
            NextExecutionAt = s.NextExecutionAt,
            SuccessCount = s.SuccessCount,
            FailureCount = s.FailureCount,
            LastErrorMessage = s.LastErrorMessage,
            CreatedAt = s.CreatedAt
        });
    }

    /// <summary>
    /// Create a new backup schedule
    /// </summary>
    [HttpPost("schedules")]
    [ProducesResponseType(typeof(ApiResponse<BackupScheduleDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> CreateSchedule([FromBody] CreateBackupScheduleRequest request)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var userEmail = _currentUserService.Email ?? "system";

        var result = await _backupSchedulingService.CreateScheduleAsync(
            tenantId.Value,
            request.ScheduleName,
            request.ScheduleType,
            request.CronExpression,
            request.BackupType,
            request.IncludeDatabase,
            request.IncludeFiles,
            request.IncludeConfiguration,
            request.Compress,
            request.Encrypt,
            request.RetentionDays,
            userEmail);

        if (result.IsFailure)
        {
            return BadRequestResponse<object>(result.Error.Description);
        }

        var s = result.Value;
        return CreatedResponse(new BackupScheduleDto
        {
            Id = s.Id,
            ScheduleName = s.ScheduleName,
            ScheduleType = s.ScheduleType,
            CronExpression = s.CronExpression,
            BackupType = s.BackupType,
            IncludeDatabase = s.IncludeDatabase,
            IncludeFiles = s.IncludeFiles,
            IncludeConfiguration = s.IncludeConfiguration,
            Compress = s.Compress,
            Encrypt = s.Encrypt,
            RetentionDays = s.RetentionDays,
            IsEnabled = s.IsEnabled,
            LastExecutedAt = s.LastExecutedAt,
            NextExecutionAt = s.NextExecutionAt,
            SuccessCount = s.SuccessCount,
            FailureCount = s.FailureCount,
            CreatedAt = s.CreatedAt
        }, nameof(GetSchedule), new { id = s.Id });
    }

    /// <summary>
    /// Update a backup schedule
    /// </summary>
    [HttpPut("schedules/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> UpdateSchedule(Guid id, [FromBody] UpdateBackupScheduleRequest request)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var userEmail = _currentUserService.Email ?? "system";

        // First verify the schedule belongs to this tenant
        var scheduleResult = await _backupSchedulingService.GetScheduleAsync(id);
        if (scheduleResult.IsFailure || scheduleResult.Value.TenantId != tenantId.Value)
        {
            return NotFoundResponse<object>("Zamanlama bulunamadı");
        }

        var result = await _backupSchedulingService.UpdateScheduleAsync(
            id,
            request.ScheduleName,
            request.ScheduleType,
            request.CronExpression,
            request.BackupType,
            request.IncludeDatabase,
            request.IncludeFiles,
            request.IncludeConfiguration,
            request.Compress,
            request.Encrypt,
            request.RetentionDays,
            userEmail);

        if (result.IsFailure)
        {
            return BadRequestResponse<object>(result.Error.Description);
        }

        return OkResponse<object>(null!, "Zamanlama güncellendi");
    }

    /// <summary>
    /// Delete a backup schedule
    /// </summary>
    [HttpDelete("schedules/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> DeleteSchedule(Guid id)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        // First verify the schedule belongs to this tenant
        var scheduleResult = await _backupSchedulingService.GetScheduleAsync(id);
        if (scheduleResult.IsFailure || scheduleResult.Value.TenantId != tenantId.Value)
        {
            return NotFoundResponse<object>("Zamanlama bulunamadı");
        }

        var result = await _backupSchedulingService.DeleteScheduleAsync(id);

        if (result.IsFailure)
        {
            return BadRequestResponse<object>(result.Error.Description);
        }

        return OkResponse<object>(null!, "Zamanlama silindi");
    }

    /// <summary>
    /// Enable a backup schedule
    /// </summary>
    [HttpPost("schedules/{id:guid}/enable")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> EnableSchedule(Guid id)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        // First verify the schedule belongs to this tenant
        var scheduleResult = await _backupSchedulingService.GetScheduleAsync(id);
        if (scheduleResult.IsFailure || scheduleResult.Value.TenantId != tenantId.Value)
        {
            return NotFoundResponse<object>("Zamanlama bulunamadı");
        }

        var result = await _backupSchedulingService.EnableScheduleAsync(id);

        if (result.IsFailure)
        {
            return BadRequestResponse<object>(result.Error.Description);
        }

        return OkResponse<object>(null!, "Zamanlama etkinleştirildi");
    }

    /// <summary>
    /// Disable a backup schedule
    /// </summary>
    [HttpPost("schedules/{id:guid}/disable")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> DisableSchedule(Guid id)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        // First verify the schedule belongs to this tenant
        var scheduleResult = await _backupSchedulingService.GetScheduleAsync(id);
        if (scheduleResult.IsFailure || scheduleResult.Value.TenantId != tenantId.Value)
        {
            return NotFoundResponse<object>("Zamanlama bulunamadı");
        }

        var result = await _backupSchedulingService.DisableScheduleAsync(id);

        if (result.IsFailure)
        {
            return BadRequestResponse<object>(result.Error.Description);
        }

        return OkResponse<object>(null!, "Zamanlama devre dışı bırakıldı");
    }

    #endregion

    #region Cleanup Endpoints

    /// <summary>
    /// Trigger manual cleanup of old backups
    /// </summary>
    [HttpPost("cleanup")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public IActionResult TriggerCleanup([FromQuery] int retentionDays = 30)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var jobId = _backupSchedulingService.EnqueueCleanup(tenantId.Value, retentionDays);

        return OkResponse(new { JobId = jobId }, "Temizleme işlemi başlatıldı");
    }

    #endregion
}

/// <summary>
/// Request model for creating a backup
/// </summary>
public class CreateBackupRequest
{
    public string BackupName { get; set; } = string.Empty;
    public string BackupType { get; set; } = "Full";
    public bool IncludeDatabase { get; set; } = true;
    public bool IncludeFiles { get; set; } = true;
    public bool IncludeConfiguration { get; set; } = true;
    public bool Compress { get; set; } = true;
    public bool Encrypt { get; set; } = true;
    public string? Description { get; set; }
}

/// <summary>
/// Request model for restoring a backup
/// </summary>
public class RestoreBackupRequest
{
    public string? Notes { get; set; }
}

/// <summary>
/// Request model for creating a backup schedule
/// </summary>
public class CreateBackupScheduleRequest
{
    public string ScheduleName { get; set; } = string.Empty;
    public string ScheduleType { get; set; } = "Daily"; // Daily, Weekly, Monthly, Custom
    public string CronExpression { get; set; } = "0 2 * * *"; // Default: Daily at 2 AM
    public string BackupType { get; set; } = "Full";
    public bool IncludeDatabase { get; set; } = true;
    public bool IncludeFiles { get; set; } = false;
    public bool IncludeConfiguration { get; set; } = true;
    public bool Compress { get; set; } = true;
    public bool Encrypt { get; set; } = false;
    public int RetentionDays { get; set; } = 30;
}

/// <summary>
/// Request model for updating a backup schedule
/// </summary>
public class UpdateBackupScheduleRequest
{
    public string ScheduleName { get; set; } = string.Empty;
    public string ScheduleType { get; set; } = "Daily";
    public string CronExpression { get; set; } = string.Empty;
    public string BackupType { get; set; } = "Full";
    public bool IncludeDatabase { get; set; } = true;
    public bool IncludeFiles { get; set; } = false;
    public bool IncludeConfiguration { get; set; } = true;
    public bool Compress { get; set; } = true;
    public bool Encrypt { get; set; } = false;
    public int RetentionDays { get; set; } = 30;
}
