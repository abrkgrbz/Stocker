using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.ProductionOrders.Commands;
using Stocker.Modules.Manufacturing.Application.Features.ProductionOrders.Queries;

namespace Stocker.Modules.Manufacturing.API.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class ProductionOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductionOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tüm üretim emirlerini listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProductionOrderListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? productId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] bool? activeOnly,
        [FromQuery] bool? overdueOnly)
    {
        var result = await _mediator.Send(new GetProductionOrdersQuery(status, productId, startDate, endDate, activeOnly, overdueOnly));
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir üretim emrini getirir
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProductionOrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var result = await _mediator.Send(new GetProductionOrderQuery(id));
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Yeni üretim emri oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductionOrderListDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateProductionOrderRequest request)
    {
        try
        {
            var result = await _mediator.Send(new CreateProductionOrderCommand(request));
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
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
    /// Üretim emrini onaylar
    /// </summary>
    [HttpPost("{id:int}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            await _mediator.Send(new ApproveProductionOrderCommand(id));
            return Ok(new { message = "Üretim emri onaylandı." });
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
    /// Üretim emrini serbest bırakır
    /// </summary>
    [HttpPost("{id:int}/release")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Release(int id)
    {
        try
        {
            await _mediator.Send(new ReleaseProductionOrderCommand(id));
            return Ok(new { message = "Üretim emri serbest bırakıldı." });
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
    /// Üretim emrini başlatır
    /// </summary>
    [HttpPost("{id:int}/start")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Start(int id, [FromBody] StartProductionOrderRequest? request)
    {
        try
        {
            await _mediator.Send(new StartProductionOrderCommand(id, request ?? new StartProductionOrderRequest(null)));
            return Ok(new { message = "Üretim emri başlatıldı." });
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
    /// Üretim emrini tamamlar
    /// </summary>
    [HttpPost("{id:int}/complete")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete(int id, [FromBody] CompleteProductionOrderRequest request)
    {
        try
        {
            await _mediator.Send(new CompleteProductionOrderCommand(id, request));
            return Ok(new { message = "Üretim emri tamamlandı." });
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
    /// Üretim emrini iptal eder
    /// </summary>
    [HttpPost("{id:int}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelRequest request)
    {
        try
        {
            await _mediator.Send(new CancelProductionOrderCommand(id, request.Reason));
            return Ok(new { message = "Üretim emri iptal edildi." });
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

public record CancelRequest(string Reason);
