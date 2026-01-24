using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;
using Stocker.Modules.Sales.Application.Services;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

[Authorize]
[ApiController]
[Route("api/sales/orders")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class SalesOrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IResourceAuthorizationService _resourceAuth;

    public SalesOrdersController(IMediator mediator, IResourceAuthorizationService resourceAuth)
    {
        _mediator = mediator;
        _resourceAuth = resourceAuth;
    }

    /// <summary>
    /// Gets all sales orders with pagination and filtering
    /// </summary>
    [HttpGet]
    [HasPermission("Sales.Orders", "View")]
    public async Task<ActionResult<PagedResult<SalesOrderListDto>>> GetOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? salesPersonId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = "OrderDate",
        [FromQuery] bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSalesOrdersQuery
        {
            Page = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Status = status,
            CustomerId = customerId,
            SalesPersonId = salesPersonId,
            FromDate = fromDate,
            ToDate = toDate,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales order by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [HasPermission("Sales.Orders", "View")]
    public async Task<ActionResult<SalesOrderDto>> GetOrderById(Guid id, CancellationToken cancellationToken)
    {
        var accessResult = await _resourceAuth.CanAccessSalesOrderAsync(id, cancellationToken);
        if (!accessResult.IsSuccess)
            return accessResult.Error.Code == "NotFound"
                ? NotFound(new { error = accessResult.Error.Description })
                : Unauthorized(new { error = accessResult.Error.Description });
        if (!accessResult.Value)
            return Forbid();

        var query = new GetSalesOrderByIdQuery { Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales order by order number
    /// </summary>
    [HttpGet("number/{orderNumber}")]
    [HasPermission("Sales.Orders", "View")]
    public async Task<ActionResult<SalesOrderDto>> GetOrderByNumber(
        string orderNumber,
        CancellationToken cancellationToken)
    {
        var query = new GetSalesOrderByNumberQuery { OrderNumber = orderNumber };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets sales order statistics
    /// </summary>
    [HttpGet("statistics")]
    [HasPermission("Sales.Orders", "View")]
    public async Task<ActionResult<SalesOrderStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSalesOrderStatisticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new sales order
    /// </summary>
    [HttpPost]
    [HasPermission("Sales.Orders", "Create")]
    public async Task<ActionResult<SalesOrderDto>> CreateOrder(
        [FromBody] CreateSalesOrderCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetOrderById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Updates a sales order
    /// </summary>
    [HttpPut("{id:guid}")]
    [HasPermission("Sales.Orders", "Edit")]
    public async Task<ActionResult<SalesOrderDto>> UpdateOrder(
        Guid id,
        [FromBody] UpdateSalesOrderCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var modifyResult = await _resourceAuth.CanModifySalesOrderAsync(id, cancellationToken);
        if (!modifyResult.IsSuccess)
            return modifyResult.Error.Code == "NotFound"
                ? NotFound(new { error = modifyResult.Error.Description })
                : Unauthorized(new { error = modifyResult.Error.Description });
        if (!modifyResult.Value)
            return Forbid();

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Adds an item to a sales order
    /// </summary>
    [HttpPost("{id:guid}/items")]
    [HasPermission("Sales.Orders", "Edit")]
    public async Task<ActionResult<SalesOrderDto>> AddItem(
        Guid id,
        [FromBody] AddSalesOrderItemCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.SalesOrderId)
            return BadRequest(new { error = "ID mismatch" });

        var modifyResult = await _resourceAuth.CanModifySalesOrderAsync(id, cancellationToken);
        if (!modifyResult.IsSuccess)
            return modifyResult.Error.Code == "NotFound"
                ? NotFound(new { error = modifyResult.Error.Description })
                : Unauthorized(new { error = modifyResult.Error.Description });
        if (!modifyResult.Value)
            return Forbid();

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Removes an item from a sales order
    /// </summary>
    [HttpDelete("{orderId:guid}/items/{itemId:guid}")]
    [HasPermission("Sales.Orders", "Edit")]
    public async Task<ActionResult<SalesOrderDto>> RemoveItem(
        Guid orderId,
        Guid itemId,
        CancellationToken cancellationToken)
    {
        var modifyResult = await _resourceAuth.CanModifySalesOrderAsync(orderId, cancellationToken);
        if (!modifyResult.IsSuccess)
            return modifyResult.Error.Code == "NotFound"
                ? NotFound(new { error = modifyResult.Error.Description })
                : Unauthorized(new { error = modifyResult.Error.Description });
        if (!modifyResult.Value)
            return Forbid();

        var command = new RemoveSalesOrderItemCommand
        {
            SalesOrderId = orderId,
            ItemId = itemId
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Approves a sales order
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    [HasPermission("Sales.Orders", "Approve")]
    public async Task<ActionResult<SalesOrderDto>> ApproveOrder(Guid id, CancellationToken cancellationToken)
    {
        var command = new ApproveSalesOrderCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Confirms a sales order (customer confirmation received)
    /// </summary>
    [HttpPost("{id:guid}/confirm")]
    [HasPermission("Sales.Orders", "Edit")]
    public async Task<ActionResult<SalesOrderDto>> ConfirmOrder(Guid id, CancellationToken cancellationToken)
    {
        var command = new ConfirmSalesOrderCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Marks a sales order as shipped
    /// </summary>
    [HttpPost("{id:guid}/ship")]
    [HasPermission("Sales.Orders", "Edit")]
    public async Task<ActionResult<SalesOrderDto>> ShipOrder(Guid id, CancellationToken cancellationToken)
    {
        var command = new ShipSalesOrderCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Marks a sales order as delivered
    /// </summary>
    [HttpPost("{id:guid}/deliver")]
    [HasPermission("Sales.Orders", "Edit")]
    public async Task<ActionResult<SalesOrderDto>> DeliverOrder(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeliverSalesOrderCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Marks a sales order as completed
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    [HasPermission("Sales.Orders", "Edit")]
    public async Task<ActionResult<SalesOrderDto>> CompleteOrder(Guid id, CancellationToken cancellationToken)
    {
        var command = new CompleteSalesOrderCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Cancels a sales order
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    [HasPermission("Sales.Orders", "Cancel")]
    public async Task<ActionResult<SalesOrderDto>> CancelOrder(
        Guid id,
        [FromBody] CancelSalesOrderCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var modifyResult = await _resourceAuth.CanModifySalesOrderAsync(id, cancellationToken);
        if (!modifyResult.IsSuccess)
            return modifyResult.Error.Code == "NotFound"
                ? NotFound(new { error = modifyResult.Error.Description })
                : Unauthorized(new { error = modifyResult.Error.Description });
        if (!modifyResult.Value)
            return Forbid();

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Deletes a sales order
    /// </summary>
    [HttpDelete("{id:guid}")]
    [HasPermission("Sales.Orders", "Delete")]
    public async Task<ActionResult> DeleteOrder(Guid id, CancellationToken cancellationToken)
    {
        var modifyResult = await _resourceAuth.CanModifySalesOrderAsync(id, cancellationToken);
        if (!modifyResult.IsSuccess)
            return modifyResult.Error.Code == "NotFound"
                ? NotFound(new { error = modifyResult.Error.Description })
                : Unauthorized(new { error = modifyResult.Error.Description });
        if (!modifyResult.Value)
            return Forbid();

        var command = new DeleteSalesOrderCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return NoContent();
    }
}
