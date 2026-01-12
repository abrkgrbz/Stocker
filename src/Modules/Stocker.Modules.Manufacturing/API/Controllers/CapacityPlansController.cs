using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.CapacityPlans.Commands;
using Stocker.Modules.Manufacturing.Application.Features.CapacityPlans.Queries;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.API.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class CapacityPlansController : ControllerBase
{
    private readonly IMediator _mediator;

    public CapacityPlansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tüm kapasite planlarını listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CapacityPlanListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? mrpPlanId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        CapacityPlanStatus? planStatus = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<CapacityPlanStatus>(status, out var s))
            planStatus = s;

        var query = new GetCapacityPlansQuery(planStatus, mrpPlanId, startDate, endDate);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir kapasite planını getirir
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CapacityPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var query = new GetCapacityPlanByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { message = $"ID '{id}' olan kapasite planı bulunamadı." });

        return Ok(result);
    }

    /// <summary>
    /// Yeni kapasite planı oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CapacityPlanDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCapacityPlanRequest request)
    {
        try
        {
            var command = new CreateCapacityPlanCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Kapasite planını çalıştırır
    /// </summary>
    [HttpPost("{id:int}/execute")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Execute(int id, [FromBody] ExecuteCapacityPlanRequest request)
    {
        try
        {
            var command = new ExecuteCapacityPlanCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "Kapasite planı başarıyla çalıştırıldı." });
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
    /// Kapasite planını onaylar
    /// </summary>
    [HttpPost("{id:int}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            var command = new ApproveCapacityPlanCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Kapasite planı onaylandı." });
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
    /// Kapasite planını iptal eder
    /// </summary>
    [HttpPost("{id:int}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            var command = new CancelCapacityPlanCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Kapasite planı iptal edildi." });
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
    /// Kapasite planını siler
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var command = new DeleteCapacityPlanCommand(id);
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

    /// <summary>
    /// Kapasite gereksinimlerini listeler
    /// </summary>
    [HttpGet("requirements")]
    [ProducesResponseType(typeof(IReadOnlyList<CapacityRequirementDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRequirements(
        [FromQuery] int? planId,
        [FromQuery] int? workCenterId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] bool onlyOverloaded = false)
    {
        var query = new GetCapacityRequirementsQuery(planId, workCenterId, startDate, endDate, onlyOverloaded);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Kapasite istisnalarını listeler
    /// </summary>
    [HttpGet("{planId:int}/exceptions")]
    [ProducesResponseType(typeof(IReadOnlyList<CapacityExceptionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExceptions(int planId, [FromQuery] bool onlyUnresolved = true)
    {
        var query = new GetCapacityExceptionsQuery(planId, onlyUnresolved);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Kapasite istisnasını çözümler
    /// </summary>
    [HttpPost("{planId:int}/exceptions/{exceptionId:int}/resolve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResolveException(int planId, int exceptionId, [FromBody] ResolveCapacityExceptionRequest request)
    {
        try
        {
            var command = new ResolveCapacityExceptionCommand(planId, exceptionId, request);
            await _mediator.Send(command);
            return Ok(new { message = "İstisna çözümlendi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// İş merkezi kapasite özetini getirir
    /// </summary>
    [HttpGet("workcenter-overview")]
    [ProducesResponseType(typeof(IReadOnlyList<WorkCenterCapacityOverviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWorkCenterOverview(
        [FromQuery] int[] workCenterIds,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var query = new GetWorkCenterCapacityOverviewQuery(workCenterIds, startDate, endDate);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
