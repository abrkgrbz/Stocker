using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.ServiceOrders.Commands;
using Stocker.Modules.Sales.Application.Features.ServiceOrders.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

[Authorize]
[ApiController]
[Route("api/sales/service-orders")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class ServiceOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public ServiceOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all service orders with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<ServiceOrderListDto>>> GetServiceOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] string? type = null,
        [FromQuery] string? priority = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? technicianId = null,
        [FromQuery] Guid? warrantyId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool? isCoveredByWarranty = null,
        [FromQuery] bool? isBillable = null,
        [FromQuery] string? sortBy = "OrderDate",
        [FromQuery] bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetServiceOrdersQuery
        {
            Page = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Status = status,
            Type = type,
            Priority = priority,
            CustomerId = customerId,
            TechnicianId = technicianId,
            WarrantyId = warrantyId,
            FromDate = fromDate,
            ToDate = toDate,
            IsCoveredByWarranty = isCoveredByWarranty,
            IsBillable = isBillable,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a service order by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ServiceOrderDto>> GetServiceOrderById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetServiceOrderByIdQuery { Id = id };
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
    /// Gets service order statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<ServiceOrderStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetServiceOrderStatisticsQuery
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
    /// Creates a new service order
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceOrderDto>> CreateServiceOrder(
        [FromBody] CreateServiceOrderCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetServiceOrderById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Schedules a service order
    /// </summary>
    [HttpPost("{id:guid}/schedule")]
    public async Task<ActionResult<ServiceOrderDto>> ScheduleServiceOrder(
        Guid id,
        [FromBody] ScheduleServiceOrderCommand command,
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
    /// Assigns a technician to a service order
    /// </summary>
    [HttpPost("{id:guid}/assign-technician")]
    public async Task<ActionResult<ServiceOrderDto>> AssignTechnician(
        Guid id,
        [FromBody] AssignTechnicianCommand command,
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
    /// Starts a service order
    /// </summary>
    [HttpPost("{id:guid}/start")]
    public async Task<ActionResult<ServiceOrderDto>> StartServiceOrder(Guid id, CancellationToken cancellationToken)
    {
        var command = new StartServiceOrderCommand { Id = id };
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
    /// Pauses a service order
    /// </summary>
    [HttpPost("{id:guid}/pause")]
    public async Task<ActionResult<ServiceOrderDto>> PauseServiceOrder(
        Guid id,
        [FromBody] PauseServiceOrderCommand command,
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
    /// Resumes a service order
    /// </summary>
    [HttpPost("{id:guid}/resume")]
    public async Task<ActionResult<ServiceOrderDto>> ResumeServiceOrder(Guid id, CancellationToken cancellationToken)
    {
        var command = new ResumeServiceOrderCommand { Id = id };
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
    /// Completes a service order
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<ServiceOrderDto>> CompleteServiceOrder(
        Guid id,
        [FromBody] CompleteServiceOrderCommand command,
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
    /// Cancels a service order
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<ServiceOrderDto>> CancelServiceOrder(
        Guid id,
        [FromBody] CancelServiceOrderCommand command,
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
    /// Records customer feedback for a completed service order
    /// </summary>
    [HttpPost("{id:guid}/feedback")]
    public async Task<ActionResult<ServiceOrderDto>> RecordFeedback(
        Guid id,
        [FromBody] RecordFeedbackCommand command,
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
    /// Deletes a service order
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteServiceOrder(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteServiceOrderCommand { Id = id };
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
