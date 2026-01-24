using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Opportunities.Commands;
using Stocker.Modules.Sales.Application.Features.Opportunities.Queries;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class OpportunitiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public OpportunitiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetOpportunities(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? stage = null,
        [FromQuery] string? priority = null,
        [FromQuery] string? source = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? salesPersonId = null,
        [FromQuery] Guid? pipelineId = null,
        [FromQuery] bool? isOpen = null)
    {
        var result = await _mediator.Send(new GetOpportunitiesPagedQuery(page, pageSize, stage, priority, source, customerId, salesPersonId, pipelineId, isOpen));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOpportunity(Guid id)
    {
        var result = await _mediator.Send(new GetOpportunityByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-number/{number}")]
    public async Task<IActionResult> GetOpportunityByNumber(string number)
    {
        var result = await _mediator.Send(new GetOpportunityByNumberQuery(number));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-customer/{customerId:guid}")]
    public async Task<IActionResult> GetOpportunitiesByCustomer(Guid customerId)
    {
        var result = await _mediator.Send(new GetOpportunitiesByCustomerQuery(customerId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("by-sales-person/{salesPersonId:guid}")]
    public async Task<IActionResult> GetOpportunitiesBySalesPerson(Guid salesPersonId)
    {
        var result = await _mediator.Send(new GetOpportunitiesBySalesPersonQuery(salesPersonId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("by-stage/{stage}")]
    public async Task<IActionResult> GetOpportunitiesByStage(string stage)
    {
        var result = await _mediator.Send(new GetOpportunitiesByStageQuery(stage));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("by-pipeline/{pipelineId:guid}")]
    public async Task<IActionResult> GetOpportunitiesByPipeline(Guid pipelineId)
    {
        var result = await _mediator.Send(new GetOpportunitiesByPipelineQuery(pipelineId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("open")]
    public async Task<IActionResult> GetOpenOpportunities()
    {
        var result = await _mediator.Send(new GetOpenOpportunitiesQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOpportunity([FromBody] CreateOpportunityDto dto)
    {
        var result = await _mediator.Send(new CreateOpportunityCommand(dto));
        return result.IsSuccess ? CreatedAtAction(nameof(GetOpportunity), new { id = result.Value.Id }, result.Value) : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/stage")]
    public async Task<IActionResult> UpdateStage(Guid id, [FromBody] UpdateOpportunityStageDto dto)
    {
        var result = await _mediator.Send(new UpdateOpportunityStageCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/value")]
    public async Task<IActionResult> UpdateValue(Guid id, [FromBody] UpdateOpportunityValueDto dto)
    {
        var result = await _mediator.Send(new UpdateOpportunityValueCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/won")]
    public async Task<IActionResult> MarkAsWon(Guid id, [FromBody] MarkOpportunityWonDto? dto = null)
    {
        var result = await _mediator.Send(new MarkOpportunityWonCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/lost")]
    public async Task<IActionResult> MarkAsLost(Guid id, [FromBody] MarkOpportunityLostDto dto)
    {
        var result = await _mediator.Send(new MarkOpportunityLostCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/reopen")]
    public async Task<IActionResult> Reopen(Guid id)
    {
        var result = await _mediator.Send(new ReopenOpportunityCommand(id));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/assign")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignOpportunityDto dto)
    {
        var result = await _mediator.Send(new AssignOpportunityCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/assign-pipeline/{pipelineId:guid}")]
    public async Task<IActionResult> AssignToPipeline(Guid id, Guid pipelineId)
    {
        var result = await _mediator.Send(new AssignOpportunityToPipelineCommand(id, pipelineId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/move-stage/{stageId:guid}")]
    public async Task<IActionResult> MovePipelineStage(Guid id, Guid stageId)
    {
        var result = await _mediator.Send(new MoveOpportunityPipelineStageCommand(id, stageId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/follow-up")]
    public async Task<IActionResult> ScheduleFollowUp(Guid id, [FromBody] DateTime followUpDate)
    {
        var result = await _mediator.Send(new ScheduleFollowUpCommand(id, followUpDate));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}
