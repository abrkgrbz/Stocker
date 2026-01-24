using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.BackOrders.Commands;
using Stocker.Modules.Sales.Application.Features.BackOrders.Queries;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class BackOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public BackOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetBackOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] string? type = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? salesOrderId = null)
    {
        var result = await _mediator.Send(new GetBackOrdersPagedQuery(page, pageSize, status, priority, type, customerId, salesOrderId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBackOrder(Guid id)
    {
        var result = await _mediator.Send(new GetBackOrderByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-number/{number}")]
    public async Task<IActionResult> GetBackOrderByNumber(string number)
    {
        var result = await _mediator.Send(new GetBackOrderByNumberQuery(number));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-sales-order/{salesOrderId:guid}")]
    public async Task<IActionResult> GetBackOrdersBySalesOrder(Guid salesOrderId)
    {
        var result = await _mediator.Send(new GetBackOrdersBySalesOrderQuery(salesOrderId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("by-customer/{customerId:guid}")]
    public async Task<IActionResult> GetBackOrdersByCustomer(Guid customerId)
    {
        var result = await _mediator.Send(new GetBackOrdersByCustomerQuery(customerId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("by-status/{status}")]
    public async Task<IActionResult> GetBackOrdersByStatus(string status)
    {
        var result = await _mediator.Send(new GetBackOrdersByStatusQuery(status));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingBackOrders()
    {
        var result = await _mediator.Send(new GetPendingBackOrdersQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBackOrder([FromBody] CreateBackOrderDto dto)
    {
        var result = await _mediator.Send(new CreateBackOrderCommand(dto));
        return result.IsSuccess ? CreatedAtAction(nameof(GetBackOrder), new { id = result.Value.Id }, result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/fulfill-item")]
    public async Task<IActionResult> FulfillItem(Guid id, [FromBody] FulfillBackOrderItemDto dto)
    {
        var result = await _mediator.Send(new FulfillBackOrderItemCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/full-fulfill")]
    public async Task<IActionResult> FullFulfill(Guid id)
    {
        var result = await _mediator.Send(new FullFulfillBackOrderCommand(id));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/start-processing")]
    public async Task<IActionResult> StartProcessing(Guid id)
    {
        var result = await _mediator.Send(new StartProcessingBackOrderCommand(id));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/mark-ready")]
    public async Task<IActionResult> MarkReady(Guid id)
    {
        var result = await _mediator.Send(new MarkBackOrderReadyCommand(id));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelBackOrder(Guid id, [FromBody] string reason)
    {
        var result = await _mediator.Send(new CancelBackOrderCommand(id, reason));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/priority")]
    public async Task<IActionResult> SetPriority(Guid id, [FromBody] string priority)
    {
        var result = await _mediator.Send(new SetBackOrderPriorityCommand(id, priority));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/estimated-restock-date")]
    public async Task<IActionResult> SetEstimatedRestockDate(Guid id, [FromBody] DateTime? estimatedDate)
    {
        var result = await _mediator.Send(new SetEstimatedRestockDateCommand(id, estimatedDate));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/notify-customer")]
    public async Task<IActionResult> NotifyCustomer(Guid id)
    {
        var result = await _mediator.Send(new NotifyBackOrderCustomerCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}
