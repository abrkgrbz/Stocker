using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.Competitors.Commands;
using Stocker.Modules.CRM.Application.Features.Competitors.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/competitors")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class CompetitorsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CompetitorsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetCompetitors(
        [FromQuery] bool? isActive = null,
        [FromQuery] ThreatLevel? threatLevel = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetCompetitorsQuery
        {
            IsActive = isActive,
            ThreatLevel = threatLevel,
            SearchTerm = searchTerm,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCompetitor(Guid id, CancellationToken cancellationToken = default)
    {
        var query = new GetCompetitorByIdQuery { Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        return result != null
            ? Ok(result)
            : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> CreateCompetitor(
        [FromBody] CreateCompetitorRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new CreateCompetitorCommand(
            tenantId,
            request.Name,
            request.Code,
            request.Description,
            true,
            request.ThreatLevel ?? ThreatLevel.Medium,
            request.Website,
            request.Headquarters,
            request.FoundedYear,
            request.EmployeeCount);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetCompetitor), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCompetitor(
        Guid id,
        [FromBody] UpdateCompetitorRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new UpdateCompetitorCommand(
            id,
            tenantId,
            request.Name,
            request.Code,
            request.Description,
            request.ThreatLevel,
            request.Website,
            request.Headquarters,
            request.FoundedYear,
            request.EmployeeCount);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(result.Error);
    }

    // TODO: Add commands for the following specialized operations:
    // - AddProduct, AddStrength, AddWeakness
    // - RecordEncounter, UpdateAnalysis
    // - Activate, Deactivate

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCompetitor(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteCompetitorCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }
}

public record CreateCompetitorRequest(
    string Name,
    string? Code = null,
    string? Description = null,
    string? Website = null,
    string? Headquarters = null,
    int? FoundedYear = null,
    string? EmployeeCount = null,
    ThreatLevel? ThreatLevel = null);

public record UpdateCompetitorRequest(
    string Name,
    string? Code = null,
    string? Description = null,
    string? Website = null,
    string? Headquarters = null,
    int? FoundedYear = null,
    string? EmployeeCount = null,
    ThreatLevel? ThreatLevel = null);

public record AddCompetitorProductRequest(
    string ProductName,
    string? Description = null,
    string? PriceRange = null);

public record AddStrengthRequest(
    string Description,
    StrengthCategory Category);

public record AddWeaknessRequest(
    string Description,
    WeaknessCategory Category);

public record RecordEncounterRequest(bool Won);

public record UpdateAnalysisRequest(
    string? SwotSummary = null,
    string? CompetitiveStrategy = null,
    string? WinStrategy = null,
    string AnalyzedBy = "System");
