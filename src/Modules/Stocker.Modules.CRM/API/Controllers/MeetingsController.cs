using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.Meetings.Commands;
using Stocker.Modules.CRM.Application.Features.Meetings.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/meetings")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class MeetingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public MeetingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetMeetings(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] MeetingStatus? status = null,
        [FromQuery] MeetingType? type = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var query = new GetMeetingsQuery
        {
            TenantId = tenantId,
            FromDate = fromDate,
            ToDate = toDate,
            Status = status,
            MeetingType = type,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMeeting(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var query = new GetMeetingByIdQuery { TenantId = tenantId, Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        return result != null
            ? Ok(result)
            : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> CreateMeeting(
        [FromBody] CreateMeetingRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new CreateMeetingCommand(
            tenantId,
            request.Title,
            request.StartTime,
            request.EndTime,
            request.OrganizerId,
            request.MeetingType,
            request.Description,
            MeetingPriority.Normal,
            false,
            null,
            MeetingLocationType.InPerson,
            request.Location,
            request.MeetingRoom,
            request.OnlineMeetingLink,
            request.OnlinePlatform,
            null,
            null,
            request.CustomerId);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetMeeting), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    // TODO: Add commands for the following specialized operations:
    // - AddAttendee, StartMeeting, CompleteMeeting, CancelMeeting

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeeting(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteMeetingCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }
}

public record CreateMeetingRequest(
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    int OrganizerId,
    MeetingType MeetingType = MeetingType.General,
    Guid? CustomerId = null,
    string? Location = null,
    string? MeetingRoom = null,
    string? OnlineMeetingLink = null,
    string? OnlinePlatform = null,
    string? Description = null);

public record AddAttendeeRequest(
    string Email,
    string? Name = null,
    bool IsRequired = true,
    Guid? ContactId = null);

public record CompleteMeetingRequest(
    string? Outcome = null,
    string? ActionItems = null);

public record CancelMeetingRequest(
    string? CancellationReason = null);
