using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
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
    private readonly ICurrentUserService _currentUserService;

    public BackupController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
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
        [FromQuery] bool sortDescending = true)
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
            SortDescending = sortDescending
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
