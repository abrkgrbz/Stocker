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

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("UserId")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
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
        var query = new GetMeetingsQuery
        {
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
        var query = new GetMeetingByIdQuery { Id = id };
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
        var organizerId = request.OrganizerId ?? GetCurrentUserId();

        var command = new CreateMeetingCommand(
            TenantId: tenantId,
            Title: request.Title,
            StartTime: request.StartTime,
            EndTime: request.EndTime,
            OrganizerId: organizerId,
            MeetingType: request.MeetingType,
            Description: request.Description,
            Priority: request.Priority,
            IsAllDay: false,
            Timezone: null,
            LocationType: request.LocationType,
            Location: request.Location,
            MeetingRoom: request.MeetingRoom,
            OnlineMeetingLink: request.OnlineMeetingLink,
            OnlineMeetingPlatform: request.OnlineMeetingPlatform,
            MeetingPassword: null,
            DialInNumber: null,
            CustomerId: request.CustomerId,
            ContactId: request.ContactId,
            LeadId: request.LeadId,
            OpportunityId: request.OpportunityId,
            DealId: request.DealId,
            CampaignId: null,
            OrganizerName: null,
            OrganizerEmail: null,
            Agenda: request.Agenda);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetMeeting), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMeeting(
        Guid id,
        [FromBody] UpdateMeetingRequest request,
        CancellationToken cancellationToken = default)
    {
        if (id != request.Id)
            return BadRequest("Id mismatch");

        var tenantId = GetTenantId();

        var command = new UpdateMeetingCommand(
            Id: id,
            TenantId: tenantId,
            Title: request.Title,
            StartTime: request.StartTime,
            EndTime: request.EndTime,
            Description: request.Description,
            MeetingType: request.MeetingType,
            Priority: request.Priority,
            IsAllDay: request.IsAllDay,
            Timezone: request.Timezone,
            LocationType: request.LocationType,
            Location: request.Location,
            MeetingRoom: request.MeetingRoom,
            OnlineMeetingLink: request.OnlineMeetingLink,
            OnlineMeetingPlatform: request.OnlineMeetingPlatform,
            MeetingPassword: request.MeetingPassword,
            DialInNumber: request.DialInNumber,
            Agenda: request.Agenda,
            Notes: request.Notes);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
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
    MeetingType MeetingType = MeetingType.General,
    string? Description = null,
    MeetingPriority Priority = MeetingPriority.Normal,
    MeetingLocationType LocationType = MeetingLocationType.InPerson,
    string? Location = null,
    string? MeetingRoom = null,
    string? OnlineMeetingLink = null,
    string? OnlineMeetingPlatform = null,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    Guid? LeadId = null,
    Guid? OpportunityId = null,
    Guid? DealId = null,
    string? Agenda = null,
    int? OrganizerId = null);

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

public record UpdateMeetingRequest(
    Guid Id,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    MeetingType? MeetingType = null,
    string? Description = null,
    MeetingPriority? Priority = null,
    bool? IsAllDay = null,
    string? Timezone = null,
    MeetingLocationType? LocationType = null,
    string? Location = null,
    string? MeetingRoom = null,
    string? OnlineMeetingLink = null,
    string? OnlineMeetingPlatform = null,
    string? MeetingPassword = null,
    string? DialInNumber = null,
    string? Agenda = null,
    string? Notes = null);
