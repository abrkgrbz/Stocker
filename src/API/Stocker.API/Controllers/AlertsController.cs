using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Infrastructure.Alerts.Domain;
using Stocker.Infrastructure.Alerts.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.API.Controllers;

/// <summary>
/// Central alerts API controller.
/// Provides endpoints for managing user alerts across all modules.
/// </summary>
[ApiController]
[Route("api/alerts")]
[Authorize]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITenantService _tenantService;
    private readonly ILogger<AlertsController> _logger;

    public AlertsController(
        IAlertService alertService,
        ICurrentUserService currentUserService,
        ITenantService tenantService,
        ILogger<AlertsController> logger)
    {
        _alertService = alertService;
        _currentUserService = currentUserService;
        _tenantService = tenantService;
        _logger = logger;
    }

    /// <summary>
    /// Gets alerts for the current user.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AlertDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAlerts(
        [FromQuery] AlertCategory? category = null,
        [FromQuery] AlertSeverity? minSeverity = null,
        [FromQuery] string? sourceModule = null,
        [FromQuery] bool? isRead = null,
        [FromQuery] bool includeDismissed = false,
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0,
        CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || !tenantId.HasValue)
            return Unauthorized();

        var options = new AlertFilterOptions
        {
            Category = category,
            MinSeverity = minSeverity,
            SourceModule = sourceModule,
            IsRead = isRead,
            IncludeDismissed = includeDismissed,
            Limit = limit,
            Offset = offset
        };

        var result = await _alertService.GetUserAlertsAsync(tenantId.Value, userId.Value, options, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets unread alert count for the current user.
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(UnreadCountResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || !tenantId.HasValue)
            return Unauthorized();

        var result = await _alertService.GetUnreadCountAsync(tenantId.Value, userId.Value, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(new UnreadCountResponse { Count = result.Value });
    }

    /// <summary>
    /// Marks an alert as read.
    /// </summary>
    [HttpPost("{id:int}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!userId.HasValue)
            return Unauthorized();

        var result = await _alertService.MarkAsReadAsync(id, userId.Value, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error?.Code == "Alert.NotFound")
                return NotFound();
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Marks all alerts as read for the current user.
    /// </summary>
    [HttpPost("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || !tenantId.HasValue)
            return Unauthorized();

        var result = await _alertService.MarkAllAsReadAsync(tenantId.Value, userId.Value, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }

    /// <summary>
    /// Dismisses an alert.
    /// </summary>
    [HttpPost("{id:int}/dismiss")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DismissAlert(int id, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!userId.HasValue)
            return Unauthorized();

        var result = await _alertService.DismissAlertAsync(id, userId.Value, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error?.Code == "Alert.NotFound")
                return NotFound();
            return BadRequest(result.Error);
        }

        return NoContent();
    }
}

public record UnreadCountResponse
{
    public int Count { get; init; }
}
