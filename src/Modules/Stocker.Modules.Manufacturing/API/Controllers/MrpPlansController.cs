using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.MrpPlans.Commands;
using Stocker.Modules.Manufacturing.Application.Features.MrpPlans.Queries;

namespace Stocker.Modules.Manufacturing.API.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class MrpPlansController : ControllerBase
{
    private readonly IMediator _mediator;

    public MrpPlansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tüm MRP planlarını listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MrpPlanListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = new GetMrpPlansQuery(status, type, startDate, endDate);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir MRP planını getirir
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(MrpPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var query = new GetMrpPlanQuery(id);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Yeni MRP planı oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(MrpPlanDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateMrpPlanRequest request)
    {
        try
        {
            var command = new CreateMrpPlanCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// MRP planını çalıştırır
    /// </summary>
    [HttpPost("{id:int}/execute")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Execute(int id, [FromBody] ExecuteMrpPlanRequest request)
    {
        try
        {
            var command = new ExecuteMrpPlanCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "MRP planı başarıyla çalıştırıldı." });
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
    /// MRP planını onaylar
    /// </summary>
    [HttpPost("{id:int}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            var command = new ApproveMrpPlanCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "MRP planı onaylandı." });
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
    /// MRP planını siler
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var command = new DeleteMrpPlanCommand(id);
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

    // Planned Orders

    /// <summary>
    /// Planlı siparişleri listeler
    /// </summary>
    [HttpGet("planned-orders")]
    [ProducesResponseType(typeof(IReadOnlyList<PlannedOrderListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPlannedOrders(
        [FromQuery] int? planId,
        [FromQuery] int? productId,
        [FromQuery] string? status)
    {
        var query = new GetPlannedOrdersQuery(planId, productId, status);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Planlı siparişi onaylar
    /// </summary>
    [HttpPost("{planId:int}/planned-orders/{orderId:int}/confirm")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmPlannedOrder(int planId, int orderId, [FromBody] ConfirmPlannedOrderRequest request)
    {
        try
        {
            var command = new ConfirmPlannedOrderCommand(planId, orderId, request);
            await _mediator.Send(command);
            return Ok(new { message = "Planlı sipariş onaylandı." });
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
    /// Planlı siparişi serbest bırakır
    /// </summary>
    [HttpPost("{planId:int}/planned-orders/{orderId:int}/release")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReleasePlannedOrder(int planId, int orderId, [FromBody] ReleasePlannedOrderRequest request)
    {
        try
        {
            var command = new ReleasePlannedOrderCommand(planId, orderId, request);
            await _mediator.Send(command);
            return Ok(new { message = "Planlı sipariş serbest bırakıldı." });
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
    /// Planlı siparişi gerçek siparişe dönüştürür
    /// </summary>
    [HttpPost("{planId:int}/planned-orders/{orderId:int}/convert")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConvertPlannedOrder(int planId, int orderId, [FromBody] ConvertPlannedOrderRequest request)
    {
        try
        {
            var command = new ConvertPlannedOrderCommand(planId, orderId, request);
            var convertedOrderId = await _mediator.Send(command);
            return Ok(new { message = "Planlı sipariş dönüştürüldü.", convertedOrderId });
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

    // Exceptions

    /// <summary>
    /// MRP istisnalarını listeler
    /// </summary>
    [HttpGet("exceptions")]
    [ProducesResponseType(typeof(IReadOnlyList<MrpExceptionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExceptions(
        [FromQuery] int? planId,
        [FromQuery] bool? unresolvedOnly)
    {
        var query = new GetMrpExceptionsQuery(planId, unresolvedOnly);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// MRP istisnasını çözümler
    /// </summary>
    [HttpPost("{planId:int}/exceptions/{exceptionId:int}/resolve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResolveException(int planId, int exceptionId, [FromBody] ResolveMrpExceptionRequest request)
    {
        try
        {
            var command = new ResolveMrpExceptionCommand(planId, exceptionId, request);
            await _mediator.Send(command);
            return Ok(new { message = "İstisna çözümlendi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
