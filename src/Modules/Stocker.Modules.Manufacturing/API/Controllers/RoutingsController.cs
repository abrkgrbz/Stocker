using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.Routings.Commands;
using Stocker.Modules.Manufacturing.Application.Features.Routings.Queries;

namespace Stocker.Modules.Manufacturing.API.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class RoutingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoutingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tüm rotaları listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<RoutingListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? productId,
        [FromQuery] bool? activeOnly,
        [FromQuery] bool? defaultOnly)
    {
        var query = new GetRoutingsQuery(status, productId, activeOnly, defaultOnly);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir rotayı getirir
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(RoutingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var query = new GetRoutingQuery(id);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Yeni rota oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(RoutingDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateRoutingRequest request)
    {
        try
        {
            var command = new CreateRoutingCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Rotayı günceller
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(RoutingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoutingRequest request)
    {
        try
        {
            var command = new UpdateRoutingCommand(id, request);
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Rotayı onaylar
    /// </summary>
    [HttpPost("{id:int}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            var command = new ApproveRoutingCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Rota onaylandı." });
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
    /// Rotayı aktif eder
    /// </summary>
    [HttpPost("{id:int}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Activate(int id)
    {
        try
        {
            var command = new ActivateRoutingCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Rota aktif edildi." });
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
    /// Rotayı siler
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var command = new DeleteRoutingCommand(id);
            await _mediator.Send(command);
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
}
