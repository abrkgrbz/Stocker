using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesPipelines.Commands;
using Stocker.Modules.Sales.Application.Features.SalesPipelines.Queries;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class SalesPipelinesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesPipelinesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPipelines()
    {
        var result = await _mediator.Send(new GetAllSalesPipelinesQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActivePipelines()
    {
        var result = await _mediator.Send(new GetActiveSalesPipelinesQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("default")]
    public async Task<IActionResult> GetDefaultPipeline()
    {
        var result = await _mediator.Send(new GetDefaultSalesPipelineQuery());
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPipeline(Guid id)
    {
        var result = await _mediator.Send(new GetSalesPipelineByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-code/{code}")]
    public async Task<IActionResult> GetPipelineByCode(string code)
    {
        var result = await _mediator.Send(new GetSalesPipelineByCodeQuery(code));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePipeline([FromBody] CreateSalesPipelineDto dto)
    {
        var result = await _mediator.Send(new CreateSalesPipelineCommand(dto));
        return result.IsSuccess ? CreatedAtAction(nameof(GetPipeline), new { id = result.Value.Id }, result.Value) : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePipeline(Guid id, [FromBody] UpdatePipelineDto dto)
    {
        var result = await _mediator.Send(new UpdateSalesPipelineCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/stages")]
    public async Task<IActionResult> AddStage(Guid id, [FromBody] AddPipelineStageDto dto)
    {
        var result = await _mediator.Send(new AddPipelineStageCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpDelete("{id:guid}/stages/{stageId:guid}")]
    public async Task<IActionResult> RemoveStage(Guid id, Guid stageId)
    {
        var result = await _mediator.Send(new RemovePipelineStageCommand(id, stageId));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/stages/{stageId:guid}/reorder")]
    public async Task<IActionResult> ReorderStage(Guid id, Guid stageId, [FromQuery] int newOrderIndex)
    {
        var result = await _mediator.Send(new ReorderPipelineStageCommand(id, stageId, newOrderIndex));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/set-default")]
    public async Task<IActionResult> SetDefault(Guid id)
    {
        var result = await _mediator.Send(new SetDefaultPipelineCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var result = await _mediator.Send(new ActivatePipelineCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var result = await _mediator.Send(new DeactivatePipelineCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}
