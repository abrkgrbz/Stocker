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
public class DealsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DealsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
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
    public async Task<ActionResult<DealDto>> GetDeal(Guid id)
    {
        var query = new GetDealByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<DealDto>> CreateDeal(CreateDealCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetDeal), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DealDto>> UpdateDeal(Guid id, UpdateDealCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDeal(Guid id)
    {
        var command = new DeleteDealCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/move-stage")]
    public async Task<ActionResult<DealDto>> MoveToStage(Guid id, MoveDealStageCommand command)
    {
        if (id != command.DealId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id}/close-won")]
    public async Task<ActionResult<DealDto>> CloseWon(Guid id, CloseDealWonCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id}/close-lost")]
    public async Task<ActionResult<DealDto>> CloseLost(Guid id, CloseDealLostCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id}/activities")]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetDealActivities(Guid id)
    {
        var query = new GetDealActivitiesQuery { DealId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/products")]
    public async Task<ActionResult<IEnumerable<DealProductDto>>> GetDealProducts(Guid id)
    {
        var query = new GetDealProductsQuery { DealId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/products")]
    public async Task<ActionResult<DealProductDto>> AddProduct(Guid id, AddDealProductCommand command)
    {
        if (id != command.DealId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}/products/{productId}")]
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