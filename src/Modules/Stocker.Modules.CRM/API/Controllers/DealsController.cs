using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Deals.Commands;
using Stocker.Modules.CRM.Application.Features.Deals.Queries;
using Stocker.Modules.CRM.Domain.Enums;
using MediatR;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Route("api/crm/[controller]")]
[Authorize]
[ApiExplorerSettings(GroupName = "tenant")]
public class DealsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DealsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DealDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<IEnumerable<DealDto>>> GetDeals(
        [FromQuery] string? search,
        [FromQuery] DealStatus? status,
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
        var query = new GetDealsQuery
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
    [ProducesResponseType(typeof(DealDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<DealDto>> GetDeal(Guid id)
    {
        var query = new GetDealByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(DealDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<DealDto>> CreateDeal(CreateDealCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return CreatedAtAction(nameof(GetDeal), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DealDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<DealDto>> UpdateDeal(Guid id, UpdateDealCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteDeal(Guid id)
    {
        var command = new DeleteDealCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/move-stage")]
    [ProducesResponseType(typeof(DealDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<DealDto>> MoveToStage(Guid id, MoveDealStageCommand command)
    {
        if (id != command.DealId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpPost("{id}/close-won")]
    [ProducesResponseType(typeof(DealDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<DealDto>> CloseWon(Guid id, CloseDealWonCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpPost("{id}/close-lost")]
    [ProducesResponseType(typeof(DealDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<DealDto>> CloseLost(Guid id, CloseDealLostCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpGet("{id}/activities")]
    [ProducesResponseType(typeof(IEnumerable<ActivityDto>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetDealActivities(Guid id)
    {
        var query = new GetDealActivitiesQuery { DealId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/products")]
    [ProducesResponseType(typeof(IEnumerable<DealProductDto>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<IEnumerable<DealProductDto>>> GetDealProducts(Guid id)
    {
        var query = new GetDealProductsQuery { DealId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/products")]
    [ProducesResponseType(typeof(DealProductDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<DealProductDto>> AddProduct(Guid id, AddDealProductCommand command)
    {
        if (id != command.DealId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpDelete("{id}/products/{productId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemoveProduct(Guid id, Guid productId)
    {
        var command = new RemoveDealProductCommand 
        { 
            DealId = id,
            ProductId = productId
        };
        
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("statistics")]
    [ProducesResponseType(typeof(DealStatisticsDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<DealStatisticsDto>> GetDealStatistics(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var query = new GetDealStatisticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("conversion-rates")]
    [ProducesResponseType(typeof(ConversionRatesDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ConversionRatesDto>> GetConversionRates(
        [FromQuery] Guid? pipelineId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var query = new GetConversionRatesQuery
        {
            PipelineId = pipelineId,
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }
}