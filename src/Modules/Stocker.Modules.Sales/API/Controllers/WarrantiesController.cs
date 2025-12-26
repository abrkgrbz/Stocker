using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Warranties.Commands;
using Stocker.Modules.Sales.Application.Features.Warranties.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

[Authorize]
[ApiController]
[Route("api/sales/warranties")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class WarrantiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public WarrantiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all warranties with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<WarrantyListDto>>> GetWarranties(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] string? type = null,
        [FromQuery] string? coverageType = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? productId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isExpired = null,
        [FromQuery] string? sortBy = "StartDate",
        [FromQuery] bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetWarrantiesQuery
        {
            Page = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Status = status,
            Type = type,
            CoverageType = coverageType,
            CustomerId = customerId,
            ProductId = productId,
            FromDate = fromDate,
            ToDate = toDate,
            IsActive = isActive,
            IsExpired = isExpired,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a warranty by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WarrantyDto>> GetWarrantyById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetWarrantyByIdQuery { Id = id };
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
    /// Looks up a warranty by serial number, warranty number, or product code + customer name
    /// </summary>
    [HttpGet("lookup")]
    public async Task<ActionResult<WarrantyDto>> LookupWarranty(
        [FromQuery] string? serialNumber = null,
        [FromQuery] string? warrantyNumber = null,
        [FromQuery] string? productCode = null,
        [FromQuery] string? customerName = null,
        CancellationToken cancellationToken = default)
    {
        var query = new LookupWarrantyQuery
        {
            SerialNumber = serialNumber,
            WarrantyNumber = warrantyNumber,
            ProductCode = productCode,
            CustomerName = customerName
        };

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
    /// Gets warranty statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<WarrantyStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetWarrantyStatisticsQuery
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
    /// Creates a new warranty
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WarrantyDto>> CreateWarranty(
        [FromBody] CreateWarrantyCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetWarrantyById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Registers a warranty
    /// </summary>
    [HttpPost("{id:guid}/register")]
    public async Task<ActionResult<WarrantyDto>> RegisterWarranty(
        Guid id,
        [FromBody] RegisterWarrantyCommand command,
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
    /// Extends a warranty
    /// </summary>
    [HttpPost("{id:guid}/extend")]
    public async Task<ActionResult<WarrantyDto>> ExtendWarranty(
        Guid id,
        [FromBody] ExtendWarrantyCommand command,
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
    /// Suspends a warranty
    /// </summary>
    [HttpPost("{id:guid}/suspend")]
    public async Task<ActionResult<WarrantyDto>> SuspendWarranty(
        Guid id,
        [FromBody] SuspendWarrantyCommand command,
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
    /// Voids a warranty
    /// </summary>
    [HttpPost("{id:guid}/void")]
    public async Task<ActionResult<WarrantyDto>> VoidWarranty(
        Guid id,
        [FromBody] VoidWarrantyCommand command,
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
    /// Creates a warranty claim
    /// </summary>
    [HttpPost("{id:guid}/claims")]
    public async Task<ActionResult<WarrantyClaimDto>> CreateClaim(
        Guid id,
        [FromBody] CreateWarrantyClaimCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.WarrantyId)
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
    /// Approves a warranty claim
    /// </summary>
    [HttpPost("{warrantyId:guid}/claims/{claimId:guid}/approve")]
    public async Task<ActionResult<WarrantyClaimDto>> ApproveClaim(
        Guid warrantyId,
        Guid claimId,
        [FromBody] ApproveClaimCommand command,
        CancellationToken cancellationToken)
    {
        if (warrantyId != command.WarrantyId || claimId != command.ClaimId)
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
    /// Rejects a warranty claim
    /// </summary>
    [HttpPost("{warrantyId:guid}/claims/{claimId:guid}/reject")]
    public async Task<ActionResult<WarrantyClaimDto>> RejectClaim(
        Guid warrantyId,
        Guid claimId,
        [FromBody] RejectClaimCommand command,
        CancellationToken cancellationToken)
    {
        if (warrantyId != command.WarrantyId || claimId != command.ClaimId)
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
    /// Deletes a warranty
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteWarranty(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteWarrantyCommand { Id = id };
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
