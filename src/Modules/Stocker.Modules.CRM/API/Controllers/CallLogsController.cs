using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.CallLogs.Commands.CompleteCallLog;
using Stocker.Modules.CRM.Application.Features.CallLogs.Commands.CreateCallLog;
using Stocker.Modules.CRM.Application.Features.CallLogs.Commands.DeleteCallLog;
using Stocker.Modules.CRM.Application.Features.CallLogs.Commands.SetFollowUp;
using Stocker.Modules.CRM.Application.Features.CallLogs.Commands.SetQualityScore;
using Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogById;
using Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogs;
using Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogsByCustomer;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using System.Security.Claims;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/call-logs")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class CallLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CallLogsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetCallLogs(
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? contactId = null,
        [FromQuery] CallDirection? direction = null,
        [FromQuery] CallStatus? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = new GetCallLogsQuery(customerId, contactId, direction, status, startDate, endDate, skip, take);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCallLog(Guid id, CancellationToken cancellationToken = default)
    {
        var query = new GetCallLogByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(result.Error);
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<IActionResult> GetCallLogsByCustomer(Guid customerId, CancellationToken cancellationToken = default)
    {
        var query = new GetCallLogsByCustomerQuery(customerId);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCallLog(
        [FromBody] CreateCallLogRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new CreateCallLogCommand(
            tenantId,
            request.CallNumber,
            request.Direction,
            request.CallerNumber,
            request.CalledNumber,
            request.StartTime,
            request.CallType,
            request.CustomerId,
            request.ContactId,
            request.LeadId,
            request.OpportunityId,
            request.AgentUserId,
            request.AgentName,
            request.Notes);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetCallLog), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<IActionResult> CompleteCall(
        Guid id,
        [FromBody] CompleteCallRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new CompleteCallLogCommand(id, request.Outcome, request.OutcomeDescription);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : NotFound(result.Error);
    }

    [HttpPut("{id:guid}/follow-up")]
    public async Task<IActionResult> SetFollowUp(
        Guid id,
        [FromBody] SetFollowUpRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new SetFollowUpCommand(id, request.FollowUpDate, request.FollowUpNote);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : NotFound(result.Error);
    }

    [HttpPut("{id:guid}/quality-score")]
    public async Task<IActionResult> SetQualityScore(
        Guid id,
        [FromBody] SetQualityScoreRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new SetQualityScoreCommand(id, request.Score, request.CustomerSatisfaction, request.QualityNotes);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : NotFound(result.Error);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCallLog(Guid id, CancellationToken cancellationToken = default)
    {
        var command = new DeleteCallLogCommand(id);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }
}

public record CreateCallLogRequest(
    string CallNumber,
    CallDirection Direction,
    string CallerNumber,
    string CalledNumber,
    DateTime? StartTime = null,
    CallType? CallType = null,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    Guid? LeadId = null,
    Guid? OpportunityId = null,
    int? AgentUserId = null,
    string? AgentName = null,
    string? Notes = null);

public record CompleteCallRequest(
    CallOutcome Outcome,
    string? OutcomeDescription = null);

public record SetFollowUpRequest(
    DateTime FollowUpDate,
    string? FollowUpNote = null);

public record SetQualityScoreRequest(
    int Score,
    int? CustomerSatisfaction = null,
    string? QualityNotes = null);
