using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.SurveyResponses.Commands;
using Stocker.Modules.CRM.Application.Features.SurveyResponses.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/surveys")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class SurveyResponsesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SurveyResponsesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetSurveyResponses(
        [FromQuery] SurveyType? type = null,
        [FromQuery] SurveyResponseStatus? status = null,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSurveyResponsesQuery(type, status, null, null, null, null, skip, take);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSurveyResponse(Guid id, CancellationToken cancellationToken = default)
    {
        var query = new GetSurveyResponseByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSurveyResponse(
        [FromBody] CreateSurveyRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new CreateSurveyResponseCommand(
            tenantId,
            request.SurveyName,
            request.SurveyType,
            request.CustomerId,
            request.ContactId,
            null,
            null,
            null,
            null,
            request.RespondentName,
            request.RespondentEmail,
            request.RespondentPhone,
            request.IsAnonymous);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetSurveyResponse), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSurveyResponse(
        Guid id,
        [FromBody] UpdateSurveyRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new UpdateSurveyResponseCommand(
            id,
            tenantId,
            request.NpsScore,
            request.CsatScore,
            null,
            null,
            null,
            null,
            request.Comments,
            null,
            null,
            null,
            null,
            null,
            request.Status);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : NotFound(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSurveyResponse(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteSurveyResponseCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }

    // TODO: The following specialized methods require specific Commands to be created
    // Currently not migrated to MediatR pattern - require: SendCommand, StartCommand,
    // CompleteCommand, SetNpsScoreCommand, SetCsatScoreCommand, AddAnswerCommand,
    // CompleteFollowUpCommand, GetNpsSummaryQuery
}

public record CreateSurveyRequest(
    string SurveyName,
    SurveyType SurveyType,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    string? RespondentName = null,
    string? RespondentEmail = null,
    string? RespondentPhone = null,
    bool IsAnonymous = false);

public record UpdateSurveyRequest(
    SurveyResponseStatus? Status = null,
    int? NpsScore = null,
    int? CsatScore = null,
    string? Comments = null);
