using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Pipelines.Commands;
using Stocker.Modules.CRM.Application.Features.Pipelines.Queries;
using MediatR;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Route("api/crm/[controller]")]
[Authorize]
public class PipelinesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PipelinesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PipelineDto>>> GetPipelines()
    {
        var query = new GetPipelinesQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PipelineDto>> GetPipeline(Guid id)
    {
        var query = new GetPipelineByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PipelineDto>> CreatePipeline(CreatePipelineCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetPipeline), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PipelineDto>> UpdatePipeline(Guid id, UpdatePipelineCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePipeline(Guid id)
    {
        var command = new DeletePipelineCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("{id}/stages")]
    public async Task<ActionResult<IEnumerable<PipelineStageDto>>> GetPipelineStages(Guid id)
    {
        var query = new GetPipelineStagesQuery { PipelineId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/stages")]
    public async Task<ActionResult<PipelineStageDto>> AddStage(Guid id, AddPipelineStageCommand command)
    {
        if (id != command.PipelineId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("{id}/stages/{stageId}")]
    public async Task<ActionResult<PipelineStageDto>> UpdateStage(Guid id, Guid stageId, UpdatePipelineStageCommand command)
    {
        if (id != command.PipelineId || stageId != command.StageId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}/stages/{stageId}")]
    public async Task<IActionResult> RemoveStage(Guid id, Guid stageId)
    {
        var command = new RemovePipelineStageCommand 
        { 
            PipelineId = id,
            StageId = stageId
        };
        
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/stages/reorder")]
    public async Task<ActionResult<IEnumerable<PipelineStageDto>>> ReorderStages(Guid id, ReorderPipelineStagesCommand command)
    {
        if (id != command.PipelineId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id}/statistics")]
    public async Task<ActionResult<PipelineStatisticsDto>> GetPipelineStatistics(Guid id)
    {
        var query = new GetPipelineStatisticsQuery { PipelineId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/activate")]
    public async Task<ActionResult<PipelineDto>> ActivatePipeline(Guid id)
    {
        var command = new ActivatePipelineCommand { Id = id };
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id}/deactivate")]
    public async Task<ActionResult<PipelineDto>> DeactivatePipeline(Guid id)
    {
        var command = new DeactivatePipelineCommand { Id = id };
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}