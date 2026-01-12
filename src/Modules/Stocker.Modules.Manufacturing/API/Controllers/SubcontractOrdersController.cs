using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.SubcontractOrders.Commands;
using Stocker.Modules.Manufacturing.Application.Features.SubcontractOrders.Queries;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.API.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class SubcontractOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public SubcontractOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tüm fason siparişlerini listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SubcontractOrderListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? subcontractorId,
        [FromQuery] int? productionOrderId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        SubcontractOrderStatus? orderStatus = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<SubcontractOrderStatus>(status, out var s))
            orderStatus = s;

        var query = new GetSubcontractOrdersQuery(orderStatus, subcontractorId, productionOrderId, startDate, endDate);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir fason siparişini getirir
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SubcontractOrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var query = new GetSubcontractOrderByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { message = $"ID '{id}' olan fason sipariş bulunamadı." });

        return Ok(result);
    }

    /// <summary>
    /// Yeni fason sipariş oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SubcontractOrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateSubcontractOrderRequest request)
    {
        try
        {
            var command = new CreateSubcontractOrderCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Fason siparişi onaylar
    /// </summary>
    [HttpPost("{id:int}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            var command = new ApproveSubcontractOrderCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Fason sipariş onaylandı." });
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
    /// Fason siparişe malzeme gönderir
    /// </summary>
    [HttpPost("{id:int}/ship")]
    [ProducesResponseType(typeof(SubcontractShipmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ShipMaterial(int id, [FromBody] ShipMaterialRequest request)
    {
        try
        {
            var command = new ShipMaterialCommand(id, request);
            var result = await _mediator.Send(command);
            return Ok(result);
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
    /// Fason siparişten ürün teslim alır
    /// </summary>
    [HttpPost("{id:int}/receive")]
    [ProducesResponseType(typeof(SubcontractShipmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReceiveProduct(int id, [FromBody] ReceiveProductRequest request)
    {
        try
        {
            var command = new ReceiveProductCommand(id, request);
            var result = await _mediator.Send(command);
            return Ok(result);
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
    /// Fason siparişi tamamlar
    /// </summary>
    [HttpPost("{id:int}/complete")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Complete(int id)
    {
        try
        {
            var command = new CompleteSubcontractOrderCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Fason sipariş tamamlandı." });
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
    /// Fason siparişi kapatır
    /// </summary>
    [HttpPost("{id:int}/close")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Close(int id)
    {
        try
        {
            var command = new CloseSubcontractOrderCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Fason sipariş kapatıldı." });
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
    /// Fason siparişi iptal eder
    /// </summary>
    [HttpPost("{id:int}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            var command = new CancelSubcontractOrderCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Fason sipariş iptal edildi." });
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
    /// Bekleyen teslimatları listeler
    /// </summary>
    [HttpGet("pending-deliveries")]
    [ProducesResponseType(typeof(IReadOnlyList<SubcontractOrderListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendingDeliveries()
    {
        var query = new GetPendingDeliveriesQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Gecikmiş siparişleri listeler
    /// </summary>
    [HttpGet("overdue")]
    [ProducesResponseType(typeof(IReadOnlyList<SubcontractOrderListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOverdueOrders()
    {
        var query = new GetOverdueOrdersQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Siparişe malzeme ekler
    /// </summary>
    [HttpPost("{orderId:int}/materials")]
    [ProducesResponseType(typeof(SubcontractMaterialDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddMaterial(int orderId, [FromBody] AddSubcontractMaterialRequest request)
    {
        try
        {
            var command = new AddSubcontractMaterialCommand(orderId, request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetMaterials), new { orderId }, result);
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
    /// Sipariş malzemelerini listeler
    /// </summary>
    [HttpGet("{orderId:int}/materials")]
    [ProducesResponseType(typeof(IReadOnlyList<SubcontractMaterialDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMaterials(int orderId)
    {
        var query = new GetSubcontractMaterialsQuery(orderId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Sipariş sevkiyatlarını listeler
    /// </summary>
    [HttpGet("{orderId:int}/shipments")]
    [ProducesResponseType(typeof(IReadOnlyList<SubcontractShipmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetShipments(int orderId)
    {
        var query = new GetSubcontractShipmentsQuery(orderId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
