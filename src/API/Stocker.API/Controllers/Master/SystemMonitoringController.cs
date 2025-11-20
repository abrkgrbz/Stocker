using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Features.SystemMonitoring.Queries.GetServiceStatus;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemHealth;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Features.SystemMonitoring.Queries.GetSystemMetrics;
using Swashbuckle.AspNetCore.Annotations;

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
}
