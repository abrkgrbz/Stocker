using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Notifications.Queries.GetUnreadCount;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Tenant;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[SwaggerTag("Notifications - User notifications management")]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(IMediator mediator, ILogger<NotificationsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get unread notification count for current user
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(UnreadCountResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            _logger.LogWarning("Invalid or missing user ID claim for unread-count");
            return Unauthorized(new { success = false, message = "User not found" });
        }

        _logger.LogInformation("Getting unread notification count for userId: {UserId}", userId);

        var query = new GetUnreadCountQuery { UserId = userId };
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }
}
