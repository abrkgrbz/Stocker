using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Certifications.Commands;
using Stocker.Modules.HR.Application.Features.Certifications.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/certifications")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class CertificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CertificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all certifications
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CertificationDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CertificationDto>>> GetCertifications()
    {
        var result = await _mediator.Send(new GetCertificationsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get certification by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CertificationDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CertificationDto>> GetCertification(int id)
    {
        var result = await _mediator.Send(new GetCertificationByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Create a new certification
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(int), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> CreateCertification(CreateCertificationCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetCertification), new { id = result.Value }, result.Value);
    }

    /// <summary>
    /// Update an existing certification
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(int), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> UpdateCertification(int id, UpdateCertificationCommand command)
    {
        var commandWithId = command with { CertificationId = id };
        var result = await _mediator.Send(commandWithId);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a certification
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteCertification(int id)
    {
        var command = new DeleteCertificationCommand { CertificationId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return NoContent();
    }
}
