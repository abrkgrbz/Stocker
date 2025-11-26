using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.Sales.API.Controllers;

[Authorize]
[ApiController]
[Route("api/sales/orders")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class SalesOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all sales orders with pagination and filtering
    /// </summary>
    [HttpGet]
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
    public async Task<ActionResult<SalesOrderDto>> GetOrderById(Guid id, CancellationToken cancellationToken)
    {
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
    /// Gets sales order statistics
    /// </summary>
    [HttpGet("statistics")]
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
    public async Task<ActionResult<SalesOrderDto>> UpdateOrder(
        Guid id,
        [FromBody] UpdateSalesOrderCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

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
    public async Task<ActionResult<SalesOrderDto>> AddItem(
        Guid id,
        [FromBody] AddSalesOrderItemCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.SalesOrderId)
            return BadRequest(new { error = "ID mismatch" });

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
    public async Task<ActionResult<SalesOrderDto>> RemoveItem(
        Guid orderId,
        Guid itemId,
        CancellationToken cancellationToken)
    {
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
    /// Cancels a sales order
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<SalesOrderDto>> CancelOrder(
        Guid id,
        [FromBody] CancelSalesOrderCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

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
    public async Task<ActionResult> DeleteOrder(Guid id, CancellationToken cancellationToken)
    {
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
