using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.SystemMonitoring.Queries.GetServiceStatus;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemHealth;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemMetrics;
using Stocker.SharedKernel.DTOs.SystemMonitoring;

namespace Stocker.API.Controllers.Master;

[Authorize(Roles = "MasterAdmin")]
[Route("api/master/system-monitoring")]
public class SystemMonitoringController : ApiController
{
    public SystemMonitoringController(ISender sender) : base(sender)
    {
    }

    /// <summary>
    /// Get comprehensive system metrics (CPU, Memory, Disk, Network)
    /// </summary>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(SystemMetricsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSystemMetrics(CancellationToken cancellationToken)
    {
        var query = new GetSystemMetricsQuery();
        var result = await Sender.Send(query, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : HandleFailure(result);
    }

    /// <summary>
    /// Get health status of all services (Database, Application, etc.)
    /// </summary>
    [HttpGet("services")]
    [ProducesResponseType(typeof(List<ServiceStatusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetServiceStatus(CancellationToken cancellationToken)
    {
        var query = new GetServiceStatusQuery();
        var result = await Sender.Send(query, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : HandleFailure(result);
    }

    /// <summary>
    /// Get overall system health status
    /// </summary>
    [HttpGet("health")]
    [ProducesResponseType(typeof(SystemHealthDto), StatusCodes.Status200OK)]
    [AllowAnonymous] // Health check endpoint should be accessible
    public async Task<IActionResult> GetSystemHealth(CancellationToken cancellationToken)
    {
        var query = new GetSystemHealthQuery();
        var result = await Sender.Send(query, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : HandleFailure(result);
    }
}
