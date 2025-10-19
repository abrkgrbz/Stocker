using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Queries;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Route("api/crm/[controller]")]
[Authorize]
[ApiExplorerSettings(GroupName = "crm")]
public class CustomerSegmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CustomerSegmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all customer segments for the current tenant
    /// </summary>
    /// <param name="isActive">Optional filter for active/inactive segments</param>
    [HttpGet]
    [ProducesResponseType(typeof(List<CustomerSegmentDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CustomerSegmentDto>>> GetSegments([FromQuery] bool? isActive = null)
    {
        var query = new GetCustomerSegmentsQuery { IsActive = isActive };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get customer segment by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CustomerSegmentDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CustomerSegmentDto>> GetSegment(Guid id)
    {
        var query = new GetCustomerSegmentByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get members of a customer segment
    /// </summary>
    [HttpGet("{id}/members")]
    [ProducesResponseType(typeof(List<CustomerSegmentMemberDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CustomerSegmentMemberDto>>> GetSegmentMembers(Guid id)
    {
        var query = new GetSegmentMembersQuery { SegmentId = id };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new customer segment
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CustomerSegmentDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CustomerSegmentDto>> CreateSegment(CreateCustomerSegmentCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetSegment), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a customer segment
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CustomerSegmentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<CustomerSegmentDto>> UpdateSegment(Guid id, UpdateCustomerSegmentCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

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
    /// Update segment criteria (for dynamic segments only)
    /// </summary>
    [HttpPut("{id}/criteria")]
    [ProducesResponseType(typeof(CustomerSegmentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<CustomerSegmentDto>> UpdateSegmentCriteria(Guid id, UpdateSegmentCriteriaCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

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
    /// Delete a customer segment
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteSegment(Guid id)
    {
        var command = new DeleteCustomerSegmentCommand { Id = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Add a customer to a segment
    /// </summary>
    [HttpPost("{id}/members")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AddMember(Guid id, AddSegmentMemberCommand command)
    {
        if (id != command.SegmentId)
            return BadRequest("Segment ID mismatch");

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Remove a customer from a segment
    /// </summary>
    [HttpDelete("{id}/members/{customerId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemoveMember(Guid id, Guid customerId)
    {
        var command = new RemoveSegmentMemberCommand
        {
            SegmentId = id,
            CustomerId = customerId
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

    /// <summary>
    /// Activate a customer segment
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ActivateSegment(Guid id)
    {
        var command = new ActivateSegmentCommand { Id = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Deactivate a customer segment
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeactivateSegment(Guid id)
    {
        var command = new DeactivateSegmentCommand { Id = id };
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
