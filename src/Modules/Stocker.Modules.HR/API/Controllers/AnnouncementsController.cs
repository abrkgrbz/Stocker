using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Announcements.Commands;
using Stocker.Modules.HR.Application.Features.Announcements.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/announcements")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class AnnouncementsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public AnnouncementsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all announcements with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<AnnouncementDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<AnnouncementDto>>> GetAnnouncements(
        [FromQuery] string? type = null,
        [FromQuery] bool? isPublished = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] int? departmentId = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetAnnouncementsQuery
        {
            TenantId = tenantId.Value,
            Type = type,
            IsPublished = isPublished,
            IsActive = isActive,
            DepartmentId = departmentId
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get announcement by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AnnouncementDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<AnnouncementDto>> GetAnnouncement(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetAnnouncementByIdQuery { TenantId = tenantId.Value, AnnouncementId = id };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new announcement
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(AnnouncementDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<AnnouncementDto>> CreateAnnouncement(CreateAnnouncementDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateAnnouncementCommand
        {
            TenantId = tenantId.Value,
            AuthorId = dto.AuthorId,
            AnnouncementData = dto
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetAnnouncement), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing announcement
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AnnouncementDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<AnnouncementDto>> UpdateAnnouncement(int id, UpdateAnnouncementDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateAnnouncementCommand { TenantId = tenantId.Value, AnnouncementId = id, AnnouncementData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Delete an announcement
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteAnnouncement(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteAnnouncementCommand { TenantId = tenantId.Value, AnnouncementId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return NoContent();
    }

    /// <summary>
    /// Publish an announcement
    /// </summary>
    [HttpPost("{id}/publish")]
    [ProducesResponseType(typeof(AnnouncementDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<AnnouncementDto>> PublishAnnouncement(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new PublishAnnouncementCommand { TenantId = tenantId.Value, AnnouncementId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Acknowledge an announcement
    /// </summary>
    [HttpPost("{id}/acknowledge")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AcknowledgeAnnouncement(int id, [FromQuery] int employeeId, AcknowledgeAnnouncementDto? dto = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        if (employeeId <= 0) return BadRequest(new Error("Employee.Required", "Employee ID is required", ErrorType.Validation));

        var command = new AcknowledgeAnnouncementCommand
        {
            TenantId = tenantId.Value,
            AnnouncementId = id,
            EmployeeId = employeeId,
            AcknowledgmentData = dto ?? new AcknowledgeAnnouncementDto()
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(new { message = "Announcement acknowledged successfully" });
    }

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
