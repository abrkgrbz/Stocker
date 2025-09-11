using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Customers.Commands; 
using Stocker.Modules.CRM.Application.Features.Customers.Queries;
using Stocker.SharedKernel.Results;
 

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Route("api/crm/[controller]")]
[Authorize]
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