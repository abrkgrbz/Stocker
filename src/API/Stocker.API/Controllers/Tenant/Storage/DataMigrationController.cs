using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Features.Tenant.DataMigration.Commands;
using Stocker.Application.Features.Tenant.DataMigration.Queries;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.API.Controllers.Tenant;

/// <summary>
/// Controller for data migration from external ERP/CRM systems (Logo, ETA, Excel, etc.)
/// </summary>
[Route("api/tenant/data-migration")]
[ApiController]
[Authorize]
public class DataMigrationController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public DataMigrationController(
        IMediator mediator,
        ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    #region Session Management

    /// <summary>
    /// Create a new migration session
    /// </summary>
    [HttpPost("sessions")]
    [ProducesResponseType(typeof(ApiResponse<MigrationSessionResponse>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> CreateSession([FromBody] CreateMigrationSessionRequest request)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var userId = _currentUserService.UserId;
        if (userId == null || userId == Guid.Empty)
        {
            return BadRequestResponse<object>("Kullanıcı bulunamadı");
        }

        var command = new CreateMigrationSessionCommand
        {
            TenantId = tenantId.Value,
            UserId = userId.Value,
            SourceType = request.SourceType,
            SourceName = request.SourceName,
            Entities = request.Entities
        };

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedResponse(result.Value!, nameof(GetSession), new { sessionId = result.Value!.SessionId });
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Get migration session details
    /// </summary>
    [HttpGet("sessions/{sessionId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<MigrationSessionResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetSession(Guid sessionId)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetMigrationSessionQuery
        {
            TenantId = tenantId.Value,
            SessionId = sessionId
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get all migration sessions for the tenant
    /// </summary>
    [HttpGet("sessions")]
    [ProducesResponseType(typeof(ApiResponse<List<MigrationSessionResponse>>), 200)]
    public async Task<IActionResult> GetSessions(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetMigrationSessionsQuery
        {
            TenantId = tenantId.Value,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Status = status
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Cancel a migration session
    /// </summary>
    [HttpPost("sessions/{sessionId:guid}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> CancelSession(Guid sessionId)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new CancelMigrationSessionCommand
        {
            TenantId = tenantId.Value,
            SessionId = sessionId
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a migration session (only completed, failed, or cancelled sessions)
    /// </summary>
    [HttpDelete("sessions/{sessionId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> DeleteSession(Guid sessionId)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new DeleteMigrationSessionCommand
        {
            TenantId = tenantId.Value,
            SessionId = sessionId
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    #endregion

    #region Data Upload

    /// <summary>
    /// Upload a chunk of data to the session
    /// </summary>
    [HttpPost("sessions/{sessionId:guid}/upload")]
    [ProducesResponseType(typeof(ApiResponse<UploadChunkResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> UploadChunk(Guid sessionId, [FromBody] UploadChunkRequest request)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new UploadMigrationChunkCommand
        {
            TenantId = tenantId.Value,
            SessionId = sessionId,
            EntityType = request.EntityType,
            ChunkIndex = request.ChunkIndex,
            TotalChunks = request.TotalChunks,
            Data = request.Data
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Mark upload as complete for the session
    /// </summary>
    [HttpPost("sessions/{sessionId:guid}/upload/complete")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> CompleteUpload(Guid sessionId)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new CompleteMigrationUploadCommand
        {
            TenantId = tenantId.Value,
            SessionId = sessionId
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    #endregion

    #region Mapping Configuration

    /// <summary>
    /// Set field mapping configuration for the session
    /// </summary>
    [HttpPost("sessions/{sessionId:guid}/mapping")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> SetMappingConfig(Guid sessionId, [FromBody] SetMappingConfigRequest request)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new SetMigrationMappingCommand
        {
            TenantId = tenantId.Value,
            SessionId = sessionId,
            MappingConfig = request.MappingConfig
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Get auto-mapping suggestions based on uploaded data
    /// </summary>
    [HttpGet("sessions/{sessionId:guid}/mapping/suggestions")]
    [ProducesResponseType(typeof(ApiResponse<AutoMappingResultDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetMappingSuggestions(Guid sessionId, [FromQuery] string entityType)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetMappingSuggestionsQuery
        {
            TenantId = tenantId.Value,
            SessionId = sessionId,
            EntityType = entityType
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    #endregion

    #region Validation

    /// <summary>
    /// Start validation process for the session
    /// </summary>
    [HttpPost("sessions/{sessionId:guid}/validate")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> StartValidation(Guid sessionId)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new StartMigrationValidationCommand
        {
            TenantId = tenantId.Value,
            SessionId = sessionId
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Get validation preview with errors and warnings
    /// </summary>
    [HttpGet("sessions/{sessionId:guid}/preview")]
    [ProducesResponseType(typeof(ApiResponse<ValidationPreviewResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetValidationPreview(
        Guid sessionId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? status = null,
        [FromQuery] string? entityType = null)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetValidationPreviewQuery
        {
            TenantId = tenantId.Value,
            SessionId = sessionId,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Status = status,
            EntityType = entityType
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Update user action for a validation record (skip, fix, import)
    /// </summary>
    [HttpPatch("sessions/{sessionId:guid}/records/{recordId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> UpdateRecordAction(
        Guid sessionId,
        Guid recordId,
        [FromBody] UpdateRecordActionRequest request)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new UpdateMigrationRecordActionCommand
        {
            TenantId = tenantId.Value,
            SessionId = sessionId,
            RecordId = recordId,
            Action = request.Action,
            FixedData = request.FixedData
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Bulk update user actions for multiple records
    /// </summary>
    [HttpPatch("sessions/{sessionId:guid}/records/bulk")]
    [ProducesResponseType(typeof(ApiResponse<BulkActionResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> BulkUpdateRecordActions(
        Guid sessionId,
        [FromBody] BulkUpdateRecordActionRequest request)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new BulkUpdateMigrationRecordActionCommand
        {
            TenantId = tenantId.Value,
            SessionId = sessionId,
            RecordIds = request.RecordIds,
            Action = request.Action
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    #endregion

    #region Import

    /// <summary>
    /// Commit and start the import process
    /// </summary>
    [HttpPost("sessions/{sessionId:guid}/commit")]
    [ProducesResponseType(typeof(ApiResponse<CommitMigrationResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> CommitMigration(Guid sessionId, [FromBody] CommitMigrationRequest? request = null)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new CommitMigrationCommand
        {
            TenantId = tenantId.Value,
            SessionId = sessionId,
            Options = request?.Options
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Get import progress for a session
    /// </summary>
    [HttpGet("sessions/{sessionId:guid}/progress")]
    [ProducesResponseType(typeof(ApiResponse<ImportProgressDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetImportProgress(Guid sessionId)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetImportProgressQuery
        {
            TenantId = tenantId.Value,
            SessionId = sessionId
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    #endregion

    #region Templates & Helpers

    /// <summary>
    /// Get available mapping templates for a source type
    /// </summary>
    [HttpGet("templates")]
    [ProducesResponseType(typeof(ApiResponse<List<MappingTemplateDto>>), 200)]
    public async Task<IActionResult> GetMappingTemplates([FromQuery] string? sourceType = null)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetMappingTemplatesQuery
        {
            TenantId = tenantId.Value,
            SourceType = sourceType
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get Stocker entity schema for mapping UI
    /// </summary>
    [HttpGet("schema/{entityType}")]
    [ProducesResponseType(typeof(ApiResponse<StockerEntitySchemaDto>), 200)]
    public async Task<IActionResult> GetStockerSchema(string entityType)
    {
        var query = new GetStockerSchemaQuery
        {
            EntityType = entityType
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Download sample Excel template for manual data entry
    /// </summary>
    [HttpGet("templates/excel/{entityType}")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> DownloadExcelTemplate(string entityType)
    {
        var query = new GetExcelTemplateQuery
        {
            EntityType = entityType
        };

        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return File(result.Value!.FileContent, result.Value.ContentType, result.Value.FileName);
        }

        return HandleResult(result);
    }

    #endregion
}

#region Request Models

/// <summary>
/// Request model for updating record action
/// </summary>
public class UpdateRecordActionRequest
{
    /// <summary>Action to take: "import", "skip", or "fix"</summary>
    public string Action { get; set; } = "import";

    /// <summary>Fixed data JSON if action is "fix"</summary>
    public string? FixedData { get; set; }
}

/// <summary>
/// Request model for bulk updating record actions
/// </summary>
public class BulkUpdateRecordActionRequest
{
    /// <summary>List of record IDs to update</summary>
    public List<Guid> RecordIds { get; set; } = new();

    /// <summary>Action to take: "import" or "skip"</summary>
    public string Action { get; set; } = "import";
}

#endregion
