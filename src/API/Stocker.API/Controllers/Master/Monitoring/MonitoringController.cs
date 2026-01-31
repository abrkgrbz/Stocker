using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.SystemMonitoring.Queries.GetServiceStatus;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemHealth;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemMetrics;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemLogs;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemAlerts;
using Stocker.Application.Features.SystemMonitoring.Commands.AcknowledgeAlert;
using Stocker.Application.Features.SystemMonitoring.Commands.DismissAlert;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - System Monitoring")]
public class MonitoringController : MasterControllerBase
{
    public MonitoringController(
        IMediator mediator,
        ILogger<MonitoringController> logger) : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get system health status
    /// </summary>
    [HttpGet("health")]
    [ProducesResponseType(typeof(ApiResponse<SystemHealthDto>), 200)]
    public async Task<IActionResult> GetSystemHealth()
    {
        _logger.LogInformation("Getting system health status");

        var query = new GetSystemHealthQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get system metrics
    /// </summary>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(ApiResponse<SystemMetricsDto>), 200)]
    public async Task<IActionResult> GetSystemMetrics()
    {
        _logger.LogInformation("Getting system metrics");

        var query = new GetSystemMetricsQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get service status
    /// </summary>
    [HttpGet("services")]
    [ProducesResponseType(typeof(ApiResponse<List<ServiceStatusDto>>), 200)]
    public async Task<IActionResult> GetServiceStatus()
    {
        _logger.LogInformation("Getting service status");

        var query = new GetServiceStatusQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get system logs
    /// </summary>
    [HttpGet("logs")]
    [ProducesResponseType(typeof(ApiResponse<SystemLogsResponseDto>), 200)]
    public async Task<IActionResult> GetSystemLogs(
        [FromQuery] string? level = null,
        [FromQuery] string? source = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        _logger.LogInformation("Getting system logs - Level: {Level}, Source: {Source}", level, source);

        var query = new GetSystemLogsQuery
        {
            Level = level,
            Source = source,
            StartDate = startDate,
            EndDate = endDate,
            Page = page,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get system alerts
    /// </summary>
    [HttpGet("alerts")]
    [ProducesResponseType(typeof(ApiResponse<List<SystemAlertDto>>), 200)]
    public async Task<IActionResult> GetSystemAlerts([FromQuery] bool activeOnly = true)
    {
        _logger.LogInformation("Getting system alerts - Active only: {ActiveOnly}", activeOnly);

        var query = new GetSystemAlertsQuery { ActiveOnly = activeOnly };
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Acknowledge a system alert
    /// </summary>
    [HttpPost("alerts/{alertId}/acknowledge")]
    [ProducesResponseType(typeof(ApiResponse<SystemAlertDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AcknowledgeAlert(string alertId)
    {
        _logger.LogInformation("Acknowledging alert: {AlertId} by {UserEmail}", alertId, CurrentUserEmail);

        var command = new AcknowledgeAlertCommand
        {
            AlertId = alertId,
            AcknowledgedBy = CurrentUserEmail
        };
        var result = await _mediator.Send(command);

        return HandleResult(result);
    }

    /// <summary>
    /// Dismiss a system alert
    /// </summary>
    [HttpPost("alerts/{alertId}/dismiss")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DismissAlert(string alertId)
    {
        _logger.LogWarning("Dismissing alert: {AlertId} by {UserEmail}", alertId, CurrentUserEmail);

        var command = new DismissAlertCommand
        {
            AlertId = alertId,
            DismissedBy = CurrentUserEmail
        };
        var result = await _mediator.Send(command);

        return HandleResult(result);
    }

    /// <summary>
    /// Get real-time metrics stream endpoint info
    /// </summary>
    [HttpGet("metrics/stream")]
    [ProducesResponseType(typeof(ApiResponse<MetricsStreamInfoDto>), 200)]
    public Task<IActionResult> GetMetricsStreamInfo()
    {
        var info = new MetricsStreamInfoDto
        {
            SignalRHub = "/hubs/monitoring",
            Methods = new List<SignalRMethodDto>
            {
                new() { Name = "SubscribeToMetrics", Description = "Subscribe to real-time metrics updates" },
                new() { Name = "UnsubscribeFromMetrics", Description = "Unsubscribe from metrics updates" }
            },
            Events = new List<SignalREventDto>
            {
                new() { Name = "MetricsUpdate", Description = "Fired every 5 seconds with updated metrics" },
                new() { Name = "AlertRaised", Description = "Fired when a new alert is raised" },
                new() { Name = "ServiceStatusChanged", Description = "Fired when a service status changes" }
            },
            Note = "Connect via SignalR to receive real-time monitoring updates"
        };

        return Task.FromResult<IActionResult>(Ok(new ApiResponse<MetricsStreamInfoDto>
        {
            Success = true,
            Data = info,
            Message = "Metrics stream info retrieved successfully"
        }));
    }
}
