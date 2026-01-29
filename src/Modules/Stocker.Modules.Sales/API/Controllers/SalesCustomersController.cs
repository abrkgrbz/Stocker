using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesCustomers.Commands;
using Stocker.Modules.Sales.Application.Features.SalesCustomers.Queries;
using Stocker.Modules.Sales.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.API.Controllers;

/// <summary>
/// Controller for managing sales customers
/// These are customers specific to the Sales module, used when CRM module is not active
/// </summary>
[Authorize]
[ApiController]
[Route("api/sales/customers")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class SalesCustomersController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesCustomersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all sales customers with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SalesCustomerListDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<PagedResult<SalesCustomerListDto>>> GetCustomers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] SalesCustomerType? customerType = null,
        [FromQuery] bool? isEInvoiceRegistered = null,
        [FromQuery] string? city = null,
        [FromQuery] bool includeInactive = false,
        [FromQuery] string? sortBy = "CustomerCode",
        [FromQuery] bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSalesCustomersPagedQuery
        {
            PageNumber = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            CustomerType = customerType,
            IsEInvoiceRegistered = isEInvoiceRegistered,
            City = city,
            IncludeInactive = includeInactive,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales customer by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> GetCustomerById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetSalesCustomerByIdQuery { Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales customer by customer code
    /// </summary>
    [HttpGet("by-code/{customerCode}")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> GetCustomerByCode(string customerCode, CancellationToken cancellationToken)
    {
        var query = new GetSalesCustomerByCodeQuery { CustomerCode = customerCode };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales customer by tax number (VKN)
    /// </summary>
    [HttpGet("by-tax-number/{taxNumber}")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> GetCustomerByTaxNumber(string taxNumber, CancellationToken cancellationToken)
    {
        var query = new GetSalesCustomerByTaxNumberQuery { TaxNumber = taxNumber };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales customer by identity number (TCKN)
    /// </summary>
    [HttpGet("by-identity-number/{identityNumber}")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> GetCustomerByIdentityNumber(string identityNumber, CancellationToken cancellationToken)
    {
        var query = new GetSalesCustomerByIdentityNumberQuery { IdentityNumber = identityNumber };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Searches sales customers for autocomplete/dropdown
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<SalesCustomerListDto>), 200)]
    public async Task<ActionResult<List<SalesCustomerListDto>>> SearchCustomers(
        [FromQuery] string term,
        [FromQuery] int maxResults = 10,
        [FromQuery] bool onlyActive = true,
        CancellationToken cancellationToken = default)
    {
        var query = new SearchSalesCustomersQuery
        {
            SearchTerm = term,
            MaxResults = maxResults,
            OnlyActive = onlyActive
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets all e-invoice registered customers
    /// </summary>
    [HttpGet("e-invoice")]
    [ProducesResponseType(typeof(List<SalesCustomerListDto>), 200)]
    public async Task<ActionResult<List<SalesCustomerListDto>>> GetEInvoiceCustomers(
        [FromQuery] bool onlyActive = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetEInvoiceCustomersQuery { OnlyActive = onlyActive };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Checks if a tax number already exists
    /// </summary>
    [HttpGet("check-tax-number/{taxNumber}")]
    [ProducesResponseType(typeof(bool), 200)]
    public async Task<ActionResult<bool>> CheckTaxNumberExists(
        string taxNumber,
        [FromQuery] Guid? excludeCustomerId = null,
        CancellationToken cancellationToken = default)
    {
        var query = new CheckTaxNumberExistsQuery
        {
            TaxNumber = taxNumber,
            ExcludeCustomerId = excludeCustomerId
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Checks if an identity number already exists
    /// </summary>
    [HttpGet("check-identity-number/{identityNumber}")]
    [ProducesResponseType(typeof(bool), 200)]
    public async Task<ActionResult<bool>> CheckIdentityNumberExists(
        string identityNumber,
        [FromQuery] Guid? excludeCustomerId = null,
        CancellationToken cancellationToken = default)
    {
        var query = new CheckIdentityNumberExistsQuery
        {
            IdentityNumber = identityNumber,
            ExcludeCustomerId = excludeCustomerId
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new sales customer
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SalesCustomerDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<SalesCustomerDto>> CreateCustomer(
        [FromBody] CreateSalesCustomerCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.Conflict)
                return Conflict(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return CreatedAtAction(
            nameof(GetCustomerById),
            new { id = result.Value.Id },
            result.Value);
    }

    /// <summary>
    /// Updates an existing sales customer
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<SalesCustomerDto>> UpdateCustomer(
        Guid id,
        [FromBody] UpdateSalesCustomerCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID in URL does not match ID in request body" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            if (result.Error.Type == ErrorType.Conflict)
                return Conflict(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Deletes a sales customer (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteCustomer(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteSalesCustomerCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return NoContent();
    }

    /// <summary>
    /// Activates a sales customer
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> ActivateCustomer(Guid id, CancellationToken cancellationToken)
    {
        var command = new ActivateSalesCustomerCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Deactivates a sales customer
    /// </summary>
    [HttpPost("{id:guid}/deactivate")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> DeactivateCustomer(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeactivateSalesCustomerCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Updates customer balance (credit or debit)
    /// </summary>
    [HttpPost("{id:guid}/balance")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> UpdateCustomerBalance(
        Guid id,
        [FromBody] UpdateCustomerBalanceCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID in URL does not match ID in request body" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Updates a customer's e-invoice information
    /// </summary>
    [HttpPut("{id:guid}/e-invoice")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> UpdateEInvoiceInfo(
        Guid id,
        [FromBody] UpdateEInvoiceInfoCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID in URL does not match ID in request body" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Links a sales customer to a CRM customer
    /// </summary>
    [HttpPost("{id:guid}/link-crm")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> LinkToCrmCustomer(
        Guid id,
        [FromBody] LinkToCrmCustomerCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID in URL does not match ID in request body" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Unlinks a sales customer from CRM
    /// </summary>
    [HttpPost("{id:guid}/unlink-crm")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> UnlinkFromCrm(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new UnlinkFromCrmCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Sets customer balance directly
    /// </summary>
    [HttpPut("{id:guid}/balance")]
    [ProducesResponseType(typeof(SalesCustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesCustomerDto>> SetBalance(
        Guid id,
        [FromBody] SetCustomerBalanceCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID in URL does not match ID in request body" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }
}
