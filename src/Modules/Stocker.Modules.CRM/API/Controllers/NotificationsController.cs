using Stocker.SharedKernel.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.Notifications.Queries.GetNotifications;
using Stocker.Modules.CRM.Application.Features.Notifications.Commands.MarkAsRead;
using Stocker.Modules.CRM.Application.Features.Notifications.Commands.MarkAllAsRead;
using Stocker.Modules.CRM.Application.Features.Notifications.Commands.DeleteNotification;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/notifications")]
[RequireModule("CRM")]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all notifications for current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(GetNotificationsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool? unreadOnly = null,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var query = new GetNotificationsQuery(userId, unreadOnly, skip, take);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Mark notification as read
    /// </summary>
    [HttpPut("{id}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var command = new MarkAsReadCommand(id, userId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);

            if (result.Error.Type == ErrorType.Forbidden)
                return Forbid();

            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Mark all notifications as read
    /// </summary>
    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var command = new MarkAllAsReadCommand(userId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var command = new DeleteNotificationCommand(id, userId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);

            if (result.Error.Type == ErrorType.Forbidden)
                return Forbid();

            return BadRequest(result.Error);
        }

        return NoContent();
    }
}
