using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.WorkCenters.Commands;
using Stocker.Modules.Manufacturing.Application.Features.WorkCenters.Queries;

namespace Stocker.Modules.Manufacturing.API.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class WorkCentersController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkCentersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tüm iş merkezlerini listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<WorkCenterListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly, [FromQuery] string? type)
    {
        var result = await _mediator.Send(new GetWorkCentersQuery(activeOnly, type));
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir iş merkezini getirir
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(WorkCenterDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var result = await _mediator.Send(new GetWorkCenterQuery(id));
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Yeni iş merkezi oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(WorkCenterDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateWorkCenterRequest request)
    {
        try
        {
            var result = await _mediator.Send(new CreateWorkCenterCommand(request));
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// İş merkezini günceller
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(WorkCenterDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkCenterRequest request)
    {
        try
        {
            var result = await _mediator.Send(new UpdateWorkCenterCommand(id, request));
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// İş merkezini siler
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _mediator.Send(new DeleteWorkCenterCommand(id));
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// İş merkezini aktif eder
    /// </summary>
    [HttpPost("{id:int}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Activate(int id)
    {
        try
        {
            await _mediator.Send(new ActivateWorkCenterCommand(id));
            return Ok(new { message = "İş merkezi aktif edildi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// İş merkezini pasif eder
    /// </summary>
    [HttpPost("{id:int}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deactivate(int id)
    {
        try
        {
            await _mediator.Send(new DeactivateWorkCenterCommand(id));
            return Ok(new { message = "İş merkezi pasif edildi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
