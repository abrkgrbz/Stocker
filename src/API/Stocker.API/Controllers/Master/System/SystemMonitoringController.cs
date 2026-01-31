using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Features.SystemMonitoring.Commands.AcknowledgeAlert;
using Stocker.Application.Features.SystemMonitoring.Commands.DismissAlert;
using Stocker.Application.Features.SystemMonitoring.Queries.GetServiceStatus;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemAlerts;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemHealth;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemLogs;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemMetrics;

namespace Stocker.API.Controllers.Master;

[Authorize]
[Route("api/master/system-monitoring")]
public class SystemMonitoringController : ApiController
{
    /// <summary>
    /// Get current system metrics (CPU, Memory, Disk, Network)
    /// </summary>
    [HttpGet("metrics")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSystemMetrics(CancellationToken cancellationToken)
    {
        var query = new GetSystemMetricsQuery();
        var result = await Mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Get overall system health status
    /// </summary>
    [HttpGet("health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSystemHealth(CancellationToken cancellationToken)
    {
        var query = new GetSystemHealthQuery();
        var result = await Mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Get status of all monitored services
    /// </summary>
    [HttpGet("services")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetServiceStatus(CancellationToken cancellationToken)
    {
        var query = new GetServiceStatusQuery();
        var result = await Mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Get system logs with filtering and pagination
    /// </summary>
    /// <param name="level">Log level filter (Debug, Info, Warning, Error, Critical)</param>
    /// <param name="source">Source/component filter</param>
    /// <param name="startDate">Start date filter</param>
    /// <param name="endDate">End date filter</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 50)</param>
    [HttpGet("logs")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSystemLogs(
        [FromQuery] string? level,
        [FromQuery] string? source,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSystemLogsQuery
        {
            Level = level,
            Source = source,
            StartDate = startDate,
            EndDate = endDate,
            Page = page,
            PageSize = pageSize
        };
        var result = await Mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Get system alerts
    /// </summary>
    /// <param name="activeOnly">Filter to show only active (unacknowledged) alerts</param>
    [HttpGet("alerts")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSystemAlerts(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSystemAlertsQuery { ActiveOnly = activeOnly };
        var result = await Mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Acknowledge a system alert
    /// </summary>
    /// <param name="alertId">Alert identifier</param>
    [HttpPut("alerts/{alertId}/acknowledge")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AcknowledgeAlert(
        string alertId,
        CancellationToken cancellationToken = default)
    {
        var command = new AcknowledgeAlertCommand
        {
            AlertId = alertId,
            AcknowledgedBy = User.Identity?.Name ?? "system"
        };
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Dismiss/close a system alert
    /// </summary>
    /// <param name="alertId">Alert identifier</param>
    [HttpDelete("alerts/{alertId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DismissAlert(
        string alertId,
        CancellationToken cancellationToken = default)
    {
        var command = new DismissAlertCommand
        {
            AlertId = alertId,
            DismissedBy = User.Identity?.Name ?? "system"
        };
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }
}
