using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.Email.Commands.SendTestEmail;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/email")]
[RequireModule("CRM")]
public class EmailController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmailController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Send a test email to verify email service configuration
    /// </summary>
    [HttpPost("test")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendTestEmail([FromBody] SendTestEmailRequest request)
    {
        var command = new SendTestEmailCommand(request.To, request.Subject);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(new { message = "Test email sent successfully", sentTo = request.To });
    }
}

public record SendTestEmailRequest(string To, string? Subject = null);
