using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesTerritories.Commands;
using Stocker.Modules.Sales.Application.Features.SalesTerritories.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

/// <summary>
/// Controller for managing sales territories.
/// Provides endpoints for territory management, assignments, and customer mapping.
/// </summary>
[Authorize]
[ApiController]
[Route("api/sales/territories")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class SalesTerritoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesTerritoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Query Endpoints

    /// <summary>
    /// Gets all sales territories with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<SalesTerritoryListDto>>> GetTerritories(
        [FromQuery] GetSalesTerritoriesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales territory by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SalesTerritoryDto>> GetTerritoryById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetSalesTerritoryByIdQuery { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales territory by code
    /// </summary>
    [HttpGet("code/{territoryCode}")]
    public async Task<ActionResult<SalesTerritoryDto>> GetTerritoryByCode(
        string territoryCode,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetSalesTerritoryByCodeQuery { TerritoryCode = territoryCode }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets all active territories
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<IReadOnlyList<SalesTerritoryListDto>>> GetActiveTerritories(
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveTerritoriesQuery(), cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets territories by type
    /// </summary>
    [HttpGet("type/{territoryType}")]
    public async Task<ActionResult<IReadOnlyList<SalesTerritoryListDto>>> GetTerritoriesByType(
        [FromRoute] Domain.Entities.TerritoryType territoryType,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTerritoriesByTypeQuery { TerritoryType = territoryType }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets child territories of a parent territory
    /// </summary>
    [HttpGet("{id:guid}/children")]
    public async Task<ActionResult<IReadOnlyList<SalesTerritoryListDto>>> GetChildTerritories(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetChildTerritoriesQuery { ParentTerritoryId = id }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets territories assigned to a sales representative
    /// </summary>
    [HttpGet("sales-rep/{salesRepId:guid}")]
    public async Task<ActionResult<IReadOnlyList<SalesTerritoryListDto>>> GetTerritoriesBySalesRep(
        Guid salesRepId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTerritoriesBySalesRepQuery { SalesRepId = salesRepId }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets the territory for a customer based on location
    /// </summary>
    [HttpGet("for-customer/{customerId:guid}")]
    public async Task<ActionResult<SalesTerritoryDto>> GetTerritoryForCustomer(
        Guid customerId,
        [FromQuery] string? postalCode = null,
        [FromQuery] string? city = null,
        [FromQuery] string? region = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetTerritoryForCustomerQuery
        {
            CustomerId = customerId,
            PostalCode = postalCode,
            City = city,
            Region = region
        }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Validates if a sales person has access to a territory
    /// </summary>
    [HttpGet("{id:guid}/validate-access/{salesPersonId:guid}")]
    public async Task<ActionResult<bool>> ValidateSalesAccess(
        Guid id,
        Guid salesPersonId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ValidateSalesAccessQuery
        {
            TerritoryId = id,
            SalesPersonId = salesPersonId
        }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    #endregion

    #region Command Endpoints - Territory Management

    /// <summary>
    /// Creates a new sales territory
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SalesTerritoryDto>> CreateTerritory(
        [FromBody] CreateSalesTerritoryCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetTerritoryById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Updates an existing sales territory
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SalesTerritoryDto>> UpdateTerritory(
        Guid id,
        [FromBody] UpdateSalesTerritoryCommand command,
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
    /// Activates a sales territory
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    public async Task<ActionResult<SalesTerritoryDto>> ActivateTerritory(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ActivateTerritoryCommand { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Deactivates a sales territory
    /// </summary>
    [HttpPost("{id:guid}/deactivate")]
    public async Task<ActionResult<SalesTerritoryDto>> DeactivateTerritory(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeactivateTerritoryCommand { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Suspends a sales territory
    /// </summary>
    [HttpPost("{id:guid}/suspend")]
    public async Task<ActionResult<SalesTerritoryDto>> SuspendTerritory(
        Guid id,
        [FromBody] SuspendTerritoryCommand command,
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

    #region Command Endpoints - Assignments

    /// <summary>
    /// Assigns a sales representative to a territory
    /// </summary>
    [HttpPost("{id:guid}/assignments")]
    public async Task<ActionResult<SalesTerritoryDto>> AssignSalesRep(
        Guid id,
        [FromBody] AssignSalesRepCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.TerritoryId)
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
    /// Removes an assignment from a territory
    /// </summary>
    [HttpDelete("{id:guid}/assignments/{assignmentId:guid}")]
    public async Task<ActionResult<SalesTerritoryDto>> RemoveAssignment(
        Guid id,
        Guid assignmentId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new RemoveAssignmentCommand
        {
            TerritoryId = id,
            AssignmentId = assignmentId
        }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    #endregion

    #region Command Endpoints - Customer Management

    /// <summary>
    /// Assigns a customer to a territory
    /// </summary>
    [HttpPost("{id:guid}/customers")]
    public async Task<ActionResult<SalesTerritoryDto>> AssignCustomer(
        Guid id,
        [FromBody] AssignCustomerToTerritoryCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.TerritoryId)
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
    /// Removes a customer from a territory
    /// </summary>
    [HttpDelete("{id:guid}/customers/{customerId:guid}")]
    public async Task<ActionResult<SalesTerritoryDto>> RemoveCustomer(
        Guid id,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new RemoveCustomerFromTerritoryCommand
        {
            TerritoryId = id,
            CustomerId = customerId
        }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    #endregion

    #region Command Endpoints - Postal Codes

    /// <summary>
    /// Adds a postal code to a territory
    /// </summary>
    [HttpPost("{id:guid}/postal-codes")]
    public async Task<ActionResult<SalesTerritoryDto>> AddPostalCode(
        Guid id,
        [FromBody] AddPostalCodeCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.TerritoryId)
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
    /// Removes a postal code from a territory
    /// </summary>
    [HttpDelete("{id:guid}/postal-codes/{postalCode}")]
    public async Task<ActionResult<SalesTerritoryDto>> RemovePostalCode(
        Guid id,
        string postalCode,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new RemovePostalCodeCommand
        {
            TerritoryId = id,
            PostalCode = postalCode
        }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    #endregion

    #region Command Endpoints - Performance

    /// <summary>
    /// Records a performance score for a territory
    /// </summary>
    [HttpPost("{id:guid}/performance-score")]
    public async Task<ActionResult<SalesTerritoryDto>> RecordPerformanceScore(
        Guid id,
        [FromBody] RecordPerformanceScoreCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.TerritoryId)
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
    /// Deletes a sales territory
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTerritory(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteSalesTerritoryCommand { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return NoContent();
    }
}
