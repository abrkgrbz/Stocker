using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Shipments.Commands;
using Stocker.Modules.Sales.Application.Features.Shipments.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

/// <summary>
/// Controller for managing shipments.
/// Provides endpoints for shipment lifecycle, tracking, and delivery management.
/// </summary>
[Authorize]
[ApiController]
[Route("api/sales/shipments")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class ShipmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ShipmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Query Endpoints

    /// <summary>
    /// Gets all shipments with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<ShipmentListDto>>> GetShipments(
        [FromQuery] GetShipmentsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a shipment by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ShipmentDto>> GetShipmentById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetShipmentByIdQuery { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a shipment by shipment number
    /// </summary>
    [HttpGet("number/{shipmentNumber}")]
    public async Task<ActionResult<ShipmentDto>> GetShipmentByNumber(
        string shipmentNumber,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetShipmentByNumberQuery { ShipmentNumber = shipmentNumber }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets shipments for a sales order
    /// </summary>
    [HttpGet("order/{salesOrderId:guid}")]
    public async Task<ActionResult<IReadOnlyList<ShipmentListDto>>> GetShipmentsByOrder(
        Guid salesOrderId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetShipmentsByOrderQuery { SalesOrderId = salesOrderId }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets shipments for a customer
    /// </summary>
    [HttpGet("customer/{customerId:guid}")]
    public async Task<ActionResult<PagedResult<ShipmentListDto>>> GetShipmentsByCustomer(
        Guid customerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetShipmentsByCustomerQuery
        {
            CustomerId = customerId,
            Page = page,
            PageSize = pageSize
        }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets pending shipments
    /// </summary>
    [HttpGet("pending")]
    public async Task<ActionResult<IReadOnlyList<ShipmentListDto>>> GetPendingShipments(
        [FromQuery] Domain.Entities.ShipmentPriority? minPriority = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetPendingShipmentsQuery { MinPriority = minPriority }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets shipments currently in transit
    /// </summary>
    [HttpGet("in-transit")]
    public async Task<ActionResult<IReadOnlyList<ShipmentListDto>>> GetShipmentsInTransit(
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetShipmentsInTransitQuery(), cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets overdue shipments
    /// </summary>
    [HttpGet("overdue")]
    public async Task<ActionResult<IReadOnlyList<ShipmentListDto>>> GetOverdueShipments(
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetOverdueShipmentsQuery(), cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets shipment statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<ShipmentStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetShipmentStatisticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    #endregion

    #region Command Endpoints - Shipment Creation

    /// <summary>
    /// Creates a new shipment
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ShipmentDto>> CreateShipment(
        [FromBody] CreateShipmentCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetShipmentById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Creates a shipment from a sales order
    /// </summary>
    [HttpPost("from-order")]
    public async Task<ActionResult<ShipmentDto>> CreateShipmentFromOrder(
        [FromBody] CreateShipmentFromOrderCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetShipmentById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Updates a shipment
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ShipmentDto>> UpdateShipment(
        Guid id,
        [FromBody] UpdateShipmentCommand command,
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
    /// Adds an item to a shipment
    /// </summary>
    [HttpPost("{id:guid}/items")]
    public async Task<ActionResult<ShipmentDto>> AddItem(
        Guid id,
        [FromBody] AddShipmentItemCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.ShipmentId)
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

    #endregion

    #region Command Endpoints - Carrier & Cost

    /// <summary>
    /// Sets the carrier information for a shipment
    /// </summary>
    [HttpPost("{id:guid}/carrier")]
    public async Task<ActionResult<ShipmentDto>> SetCarrier(
        Guid id,
        [FromBody] SetCarrierCommand command,
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
    /// Sets the vehicle information for a shipment
    /// </summary>
    [HttpPost("{id:guid}/vehicle")]
    public async Task<ActionResult<ShipmentDto>> SetVehicleInfo(
        Guid id,
        [FromBody] SetVehicleInfoCommand command,
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
    /// Sets the shipping cost for a shipment
    /// </summary>
    [HttpPost("{id:guid}/shipping-cost")]
    public async Task<ActionResult<ShipmentDto>> SetShippingCost(
        Guid id,
        [FromBody] SetShippingCostCommand command,
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

    #endregion

    #region Command Endpoints - Shipment Lifecycle

    /// <summary>
    /// Starts preparing a shipment
    /// </summary>
    [HttpPost("{id:guid}/start-preparing")]
    public async Task<ActionResult<ShipmentDto>> StartPreparing(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new StartPreparingShipmentCommand { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Marks a shipment as ready
    /// </summary>
    [HttpPost("{id:guid}/mark-ready")]
    public async Task<ActionResult<ShipmentDto>> MarkReady(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new MarkShipmentReadyCommand { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Ships the shipment
    /// </summary>
    [HttpPost("{id:guid}/ship")]
    public async Task<ActionResult<ShipmentDto>> Ship(
        Guid id,
        [FromBody] ShipCommand command,
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
    /// Marks a shipment as in transit
    /// </summary>
    [HttpPost("{id:guid}/in-transit")]
    public async Task<ActionResult<ShipmentDto>> MarkInTransit(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new MarkInTransitCommand { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Delivers a shipment
    /// </summary>
    [HttpPost("{id:guid}/deliver")]
    public async Task<ActionResult<ShipmentDto>> Deliver(
        Guid id,
        [FromBody] DeliverShipmentCommand command,
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
    /// Returns a shipment
    /// </summary>
    [HttpPost("{id:guid}/return")]
    public async Task<ActionResult<ShipmentDto>> Return(
        Guid id,
        [FromBody] ReturnShipmentCommand command,
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
    /// Cancels a shipment
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<ShipmentDto>> Cancel(
        Guid id,
        [FromBody] CancelShipmentCommand command,
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

    #endregion

    #region Command Endpoints - Linking

    /// <summary>
    /// Links a delivery note to a shipment
    /// </summary>
    [HttpPost("{id:guid}/link-delivery-note")]
    public async Task<ActionResult<ShipmentDto>> LinkDeliveryNote(
        Guid id,
        [FromBody] LinkDeliveryNoteCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.ShipmentId)
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
    /// Links an invoice to a shipment
    /// </summary>
    [HttpPost("{id:guid}/link-invoice")]
    public async Task<ActionResult<ShipmentDto>> LinkInvoice(
        Guid id,
        [FromBody] LinkInvoiceToShipmentCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.ShipmentId)
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

    #endregion

    /// <summary>
    /// Deletes a shipment
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteShipment(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteShipmentCommand { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return NoContent();
    }
}
