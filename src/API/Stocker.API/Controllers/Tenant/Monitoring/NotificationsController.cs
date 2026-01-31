using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Notifications.Commands.DeleteNotification;
using Stocker.Application.Features.Notifications.Commands.MarkAllAsRead;
using Stocker.Application.Features.Notifications.Commands.MarkAsRead;
using Stocker.Application.Features.Notifications.Commands.MarkAsUnread;
using Stocker.Application.Features.Notifications.Queries.GetTenantNotifications;
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

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }
        return userId;
    }

    /// <summary>
    /// Get all notifications for current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(GetTenantNotificationsResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool? isRead = null,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            _logger.LogWarning("Invalid or missing user ID claim for GetNotifications");
            return Unauthorized(new { success = false, message = "User not found" });
        }

        _logger.LogInformation("Getting notifications for userId: {UserId}, isRead: {IsRead}", userId, isRead);

        var query = new GetTenantNotificationsQuery
        {
            UserId = userId.Value,
            IsRead = isRead,
            Skip = skip,
            Take = take
        };
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value.Notifications,
                totalCount = result.Value.TotalCount,
                unreadCount = result.Value.UnreadCount
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
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
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            _logger.LogWarning("Invalid or missing user ID claim for unread-count");
            return Unauthorized(new { success = false, message = "User not found" });
        }

        _logger.LogInformation("Getting unread notification count for userId: {UserId}", userId);

        var query = new GetUnreadCountQuery { UserId = userId.Value };
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

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPut("{id}/read")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            _logger.LogWarning("Invalid or missing user ID claim for MarkAsRead");
            return Unauthorized(new { success = false, message = "User not found" });
        }

        _logger.LogInformation("Marking notification {NotificationId} as read for userId: {UserId}", id, userId);

        var command = new MarkNotificationAsReadCommand
        {
            NotificationId = id,
            UserId = userId.Value
        };
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        if (result.Error.Type == Stocker.SharedKernel.Results.ErrorType.NotFound)
        {
            return NotFound(new { success = false, message = result.Error.Description });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Mark a notification as unread
    /// </summary>
    [HttpPut("{id}/unread")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> MarkAsUnread(Guid id)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            _logger.LogWarning("Invalid or missing user ID claim for MarkAsUnread");
            return Unauthorized(new { success = false, message = "User not found" });
        }

        _logger.LogInformation("Marking notification {NotificationId} as unread for userId: {UserId}", id, userId);

        var command = new MarkNotificationAsUnreadCommand
        {
            NotificationId = id,
            UserId = userId.Value
        };
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        if (result.Error.Type == Stocker.SharedKernel.Results.ErrorType.NotFound)
        {
            return NotFound(new { success = false, message = result.Error.Description });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Mark all notifications as read
    /// </summary>
    [HttpPut("read-all")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            _logger.LogWarning("Invalid or missing user ID claim for MarkAllAsRead");
            return Unauthorized(new { success = false, message = "User not found" });
        }

        _logger.LogInformation("Marking all notifications as read for userId: {UserId}", userId);

        var command = new MarkAllNotificationsAsReadCommand { UserId = userId.Value };
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            _logger.LogWarning("Invalid or missing user ID claim for DeleteNotification");
            return Unauthorized(new { success = false, message = "User not found" });
        }

        _logger.LogInformation("Deleting notification {NotificationId} for userId: {UserId}", id, userId);

        var command = new DeleteNotificationCommand
        {
            NotificationId = id,
            UserId = userId.Value
        };
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        if (result.Error.Type == Stocker.SharedKernel.Results.ErrorType.NotFound)
        {
            return NotFound(new { success = false, message = result.Error.Description });
        }

        if (result.Error.Type == Stocker.SharedKernel.Results.ErrorType.Forbidden)
        {
            return StatusCode(403, new { success = false, message = result.Error.Description });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }
}
