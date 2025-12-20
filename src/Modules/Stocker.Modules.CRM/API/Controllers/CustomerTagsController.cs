using System.Security.Claims;
using Stocker.SharedKernel.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.CustomerTags.Commands;
using Stocker.Modules.CRM.Application.Features.CustomerTags.Queries;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

/// <summary>
/// DTO for adding a customer tag from frontend
/// </summary>
public class AddCustomerTagDto
{
    public Guid CustomerId { get; set; }
    public string TagName { get; set; } = string.Empty;
    public string? Color { get; set; }
}

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

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
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
    public async Task<ActionResult<CustomerTagDto>> AddTag([FromBody] AddCustomerTagDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return BadRequest(new Error("Auth.InvalidUser", "User ID could not be determined", ErrorType.Unauthorized));

        var command = new AddCustomerTagCommand
        {
            CustomerId = dto.CustomerId,
            Tag = dto.TagName,
            Color = dto.Color,
            CreatedBy = userId
        };

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
