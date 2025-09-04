using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Opportunities.Commands;
using Stocker.Modules.CRM.Application.Features.Opportunities.Queries;
using Stocker.Modules.CRM.Domain.Enums;
using MediatR;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Route("api/crm/[controller]")]
[Authorize]
public class OpportunitiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public OpportunitiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OpportunityDto>>> GetOpportunities(
        [FromQuery] string? search,
        [FromQuery] OpportunityStatus? status,
        [FromQuery] Guid? customerId,
        [FromQuery] Guid? pipelineId,
        [FromQuery] Guid? stageId,
        [FromQuery] decimal? minAmount,
        [FromQuery] decimal? maxAmount,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetOpportunitiesQuery
        {
            Search = search,
            Status = status,
            CustomerId = customerId,
            PipelineId = pipelineId,
            StageId = stageId,
            MinAmount = minAmount,
            MaxAmount = maxAmount,
            FromDate = fromDate,
            ToDate = toDate,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OpportunityDto>> GetOpportunity(Guid id)
    {
        var query = new GetOpportunityByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<OpportunityDto>> CreateOpportunity(CreateOpportunityCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetOpportunity), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<OpportunityDto>> UpdateOpportunity(Guid id, UpdateOpportunityCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOpportunity(Guid id)
    {
        var command = new DeleteOpportunityCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/move-stage")]
    public async Task<ActionResult<OpportunityDto>> MoveToStage(Guid id, MoveOpportunityStageCommand command)
    {
        if (id != command.OpportunityId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id}/win")]
    public async Task<ActionResult<OpportunityDto>> WinOpportunity(Guid id, WinOpportunityCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id}/lose")]
    public async Task<ActionResult<OpportunityDto>> LoseOpportunity(Guid id, LoseOpportunityCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id}/activities")]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetOpportunityActivities(Guid id)
    {
        var query = new GetOpportunityActivitiesQuery { OpportunityId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/products")]
    public async Task<ActionResult<IEnumerable<OpportunityProductDto>>> GetOpportunityProducts(Guid id)
    {
        var query = new GetOpportunityProductsQuery { OpportunityId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/products")]
    public async Task<ActionResult<OpportunityProductDto>> AddProduct(Guid id, AddOpportunityProductCommand command)
    {
        if (id != command.OpportunityId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}/products/{productId}")]
    public async Task<IActionResult> RemoveProduct(Guid id, Guid productId)
    {
        var command = new RemoveOpportunityProductCommand 
        { 
            OpportunityId = id,
            ProductId = productId
        };
        
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("pipeline-report")]
    public async Task<ActionResult<PipelineReportDto>> GetPipelineReport(
        [FromQuery] Guid? pipelineId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var query = new GetPipelineReportQuery
        {
            PipelineId = pipelineId,
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("forecast")]
    public async Task<ActionResult<ForecastDto>> GetSalesForecast(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate)
    {
        var query = new GetSalesForecastQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }
}