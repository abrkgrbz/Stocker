using Stocker.SharedKernel.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Customers.Commands; 
using Stocker.Modules.CRM.Application.Features.Customers.Queries;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Pagination;
 

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/customers")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class CustomersController : ControllerBase
{
    private readonly IMediator _mediator;

    public CustomersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all customers for the current tenant
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CustomerDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CustomerDto>>> GetCustomers()
    {
        var result = await _mediator.Send(new GetCustomersQuery());
        return Ok(result.Value);
    }

    /// <summary>
    /// Get paginated customers for the current tenant
    /// </summary>
    [HttpGet("paged")]
    [ProducesResponseType(typeof(PagedResult<CustomerDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetCustomersPaged(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false,
        [FromQuery] bool includeInactive = false,
        [FromQuery] string? industry = null,
        [FromQuery] string? city = null,
        [FromQuery] string? country = null)
    {
        var query = new GetCustomersPagedQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            SortBy = sortBy,
            SortDescending = sortDescending,
            IncludeInactive = includeInactive,
            Industry = industry,
            City = city,
            Country = country
        };

        var result = await _mediator.Send(query);
        
        if (result.IsFailure)
            return BadRequest(result.Error);
            
        return Ok(result.Value);
    }

    /// <summary>
    /// Get customer by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CustomerDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CustomerDto>> GetCustomer(Guid id)
    {
        var result = await _mediator.Send(new GetCustomerByIdQuery { CustomerId = id });
        if (result.IsFailure)
            return NotFound();
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new customer
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CustomerDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return CreatedAtAction(nameof(GetCustomer), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a customer
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CustomerDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(Guid id, UpdateCustomerDto dto)
    {
        var command = new UpdateCustomerCommand
        {
            CustomerId = id,
            CustomerData = dto
        };
        
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            
            return BadRequest(result.Error);
        }
        
        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a customer
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var command = new DeleteCustomerCommand
        {
            CustomerId = id,
            ForceDelete = false // Soft delete by default
        };
        
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            
            return BadRequest(result.Error);
        }
        
        return NoContent();
    }
}