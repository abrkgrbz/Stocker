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
[ApiExplorerSettings(GroupName = "tenant")]
[Tags("CRM - Pipelines")]
public class PipelinesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PipelinesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PipelineDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<IEnumerable<PipelineDto>>> GetPipelines()
    {
        var query = new GetPipelinesQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PipelineDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PipelineDto>> GetPipeline(Guid id)
    {
        var query = new GetPipelineByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PipelineDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PipelineDto>> CreatePipeline(CreatePipelineCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return CreatedAtAction(nameof(GetPipeline), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(PipelineDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PipelineDto>> UpdatePipeline(Guid id, UpdatePipelineCommand command)
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
    public async Task<IActionResult> DeletePipeline(Guid id)
    {
        var command = new DeletePipelineCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("{id}/stages")]
    [ProducesResponseType(typeof(IEnumerable<PipelineStageDto>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<IEnumerable<PipelineStageDto>>> GetPipelineStages(Guid id)
    {
        var query = new GetPipelineStagesQuery { PipelineId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/stages")]
    [ProducesResponseType(typeof(PipelineStageDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PipelineStageDto>> AddStage(Guid id, AddPipelineStageCommand command)
    {
        if (id != command.PipelineId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpPut("{id}/stages/{stageId}")]
    [ProducesResponseType(typeof(PipelineStageDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PipelineStageDto>> UpdateStage(Guid id, Guid stageId, UpdatePipelineStageCommand command)
    {
        if (id != command.PipelineId || stageId != command.StageId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpDelete("{id}/stages/{stageId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
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
    [ProducesResponseType(typeof(IEnumerable<PipelineStageDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<IEnumerable<PipelineStageDto>>> ReorderStages(Guid id, ReorderPipelineStagesCommand command)
    {
        if (id != command.PipelineId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpGet("{id}/statistics")]
    [ProducesResponseType(typeof(PipelineStatisticsDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PipelineStatisticsDto>> GetPipelineStatistics(Guid id)
    {
        var query = new GetPipelineStatisticsQuery { PipelineId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/activate")]
    [ProducesResponseType(typeof(PipelineDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PipelineDto>> ActivatePipeline(Guid id)
    {
        var command = new ActivatePipelineCommand { Id = id };
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(typeof(PipelineDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PipelineDto>> DeactivatePipeline(Guid id)
    {
        var command = new DeactivatePipelineCommand { Id = id };
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }
}