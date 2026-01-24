using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesTargets.Commands;
using Stocker.Modules.Sales.Application.Features.SalesTargets.Queries;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class SalesTargetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesTargetsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSalesTargets(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? year = null,
        [FromQuery] string? status = null,
        [FromQuery] string? targetType = null,
        [FromQuery] Guid? salesRepresentativeId = null,
        [FromQuery] Guid? salesTeamId = null)
    {
        var result = await _mediator.Send(new GetSalesTargetsPagedQuery(page, pageSize, year, status, targetType, salesRepresentativeId, salesTeamId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSalesTarget(Guid id)
    {
        var result = await _mediator.Send(new GetSalesTargetByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-code/{code}")]
    public async Task<IActionResult> GetSalesTargetByCode(string code)
    {
        var result = await _mediator.Send(new GetSalesTargetByCodeQuery(code));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-year/{year:int}")]
    public async Task<IActionResult> GetSalesTargetsByYear(int year)
    {
        var result = await _mediator.Send(new GetSalesTargetsByYearQuery(year));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("by-representative/{salesRepId:guid}")]
    public async Task<IActionResult> GetSalesTargetsByRepresentative(Guid salesRepId)
    {
        var result = await _mediator.Send(new GetSalesTargetsByRepresentativeQuery(salesRepId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("by-team/{teamId:guid}")]
    public async Task<IActionResult> GetSalesTargetsByTeam(Guid teamId)
    {
        var result = await _mediator.Send(new GetSalesTargetsByTeamQuery(teamId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveSalesTargets()
    {
        var result = await _mediator.Send(new GetActiveSalesTargetsQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSalesTarget([FromBody] CreateSalesTargetDto dto)
    {
        var result = await _mediator.Send(new CreateSalesTargetCommand(dto));
        return result.IsSuccess ? CreatedAtAction(nameof(GetSalesTarget), new { id = result.Value.Id }, result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/assign-representative")]
    public async Task<IActionResult> AssignToRepresentative(Guid id, [FromBody] AssignSalesTargetDto dto)
    {
        var result = await _mediator.Send(new AssignTargetToRepresentativeCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/assign-team")]
    public async Task<IActionResult> AssignToTeam(Guid id, [FromBody] AssignSalesTargetDto dto)
    {
        var result = await _mediator.Send(new AssignTargetToTeamCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/assign-territory")]
    public async Task<IActionResult> AssignToTerritory(Guid id, [FromBody] AssignSalesTargetDto dto)
    {
        var result = await _mediator.Send(new AssignTargetToTerritoryCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/periods")]
    public async Task<IActionResult> AddPeriod(Guid id, [FromBody] AddSalesTargetPeriodDto dto)
    {
        var result = await _mediator.Send(new AddTargetPeriodCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/generate-periods")]
    public async Task<IActionResult> GeneratePeriods(Guid id)
    {
        var result = await _mediator.Send(new GenerateTargetPeriodsCommand(id));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/products")]
    public async Task<IActionResult> AddProductTarget(Guid id, [FromBody] AddSalesTargetProductDto dto)
    {
        var result = await _mediator.Send(new AddTargetProductCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/achievements")]
    public async Task<IActionResult> RecordAchievement(Guid id, [FromBody] RecordAchievementDto dto)
    {
        var result = await _mediator.Send(new RecordAchievementCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var result = await _mediator.Send(new ActivateSalesTargetCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/close")]
    public async Task<IActionResult> Close(Guid id)
    {
        var result = await _mediator.Send(new CloseSalesTargetCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] string reason)
    {
        var result = await _mediator.Send(new CancelSalesTargetCommand(id, reason));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}
