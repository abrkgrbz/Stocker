using Stocker.SharedKernel.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.CustomerTags.Commands;
using Stocker.Modules.CRM.Application.Features.CustomerTags.Queries;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/[controller]")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class CustomerTagsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CustomerTagsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all tags for a specific customer
    /// </summary>
    /// <param name="customerId">Customer ID</param>
    [HttpGet("customer/{customerId}")]
    [ProducesResponseType(typeof(List<CustomerTagDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CustomerTagDto>>> GetCustomerTags(Guid customerId)
    {
        var query = new GetCustomerTagsQuery { CustomerId = customerId };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get all distinct tags for the current tenant
    /// </summary>
    [HttpGet("distinct")]
    [ProducesResponseType(typeof(List<string>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<string>>> GetDistinctTags()
    {
        var query = new GetDistinctTagsQuery();
        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Add a tag to a customer
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CustomerTagDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<CustomerTagDto>> AddTag(AddCustomerTagCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.Conflict)
                return Conflict(result.Error);

            return BadRequest(result.Error);
        }

        return CreatedAtAction(
            nameof(GetCustomerTags),
            new { customerId = result.Value.CustomerId },
            result.Value);
    }

    /// <summary>
    /// Remove a tag from a customer
    /// </summary>
    /// <param name="id">Tag ID</param>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemoveTag(Guid id)
    {
        var command = new RemoveCustomerTagCommand { Id = id };
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
