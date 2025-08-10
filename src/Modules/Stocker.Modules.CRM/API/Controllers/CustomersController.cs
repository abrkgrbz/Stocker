using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Customers.Commands; 
using Stocker.Modules.CRM.Application.Features.Customers.Queries; 

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Route("api/crm/[controller]")]
[Authorize]
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
    public async Task<ActionResult<List<CustomerDto>>> GetCustomers()
    {
        var result = await _mediator.Send(new GetCustomersQuery());
        return Ok(result.Value);
    }

    /// <summary>
    /// Get customer by ID
    /// </summary>
    [HttpGet("{id}")]
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
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(Guid id, UpdateCustomerDto dto)
    {
        // TODO: Implement UpdateCustomerCommand
        return Ok();
    }

    /// <summary>
    /// Delete a customer
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        // TODO: Implement DeleteCustomerCommand
        return NoContent();
    }
}