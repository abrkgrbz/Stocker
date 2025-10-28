using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Interfaces;
using Stocker.Infrastructure.BackgroundJobs;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// Tenant health monitoring and management endpoints
/// </summary>
[ApiController]
[Authorize]
[Route("api/master/tenant-health")]
public class TenantHealthController : ControllerBase
{
    private readonly ITenantHealthCheckService _healthCheckService;

    public TenantHealthController(ITenantHealthCheckService healthCheckService)
    {
        _healthCheckService = healthCheckService;
    }

    /// <summary>
    /// Triggers an immediate health check for a specific tenant
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    [HttpPost("{tenantId}/check")]
    public async Task<IActionResult> PerformHealthCheck(Guid tenantId)
    {
        var result = await _healthCheckService.PerformHealthCheckAsync(tenantId);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Gets the latest health check result for a tenant
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    [HttpGet("{tenantId}/latest")]
    public async Task<IActionResult> GetLatestHealthCheck(Guid tenantId)
    {
        var result = await _healthCheckService.GetLatestHealthCheckAsync(tenantId);
        return result.IsSuccess ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Gets comprehensive health summary for a tenant including trends
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    [HttpGet("{tenantId}/summary")]
    public async Task<IActionResult> GetHealthSummary(Guid tenantId)
    {
        var result = await _healthCheckService.GetHealthSummaryAsync(tenantId);
        return result.IsSuccess ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Gets health check history for a tenant within a date range
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    /// <param name="startDate">Start date (optional, defaults to 7 days ago)</param>
    /// <param name="endDate">End date (optional, defaults to now)</param>
    [HttpGet("{tenantId}/history")]
    public async Task<IActionResult> GetHealthHistory(
        Guid tenantId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-7);
        var end = endDate ?? DateTime.UtcNow;

        var result = await _healthCheckService.GetHealthHistoryAsync(tenantId, start, end);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Gets health trend data for visualization (charts)
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    /// <param name="days">Number of days to include (default 30)</param>
    [HttpGet("{tenantId}/trend")]
    public async Task<IActionResult> GetHealthTrend(Guid tenantId, [FromQuery] int days = 30)
    {
        if (days < 1 || days > 90)
        {
            return BadRequest("Days must be between 1 and 90");
        }

        var result = await _healthCheckService.GetHealthTrendAsync(tenantId, days);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Gets all tenants with critical health issues
    /// </summary>
    [HttpGet("unhealthy")]
    public async Task<IActionResult> GetUnhealthyTenants()
    {
        var result = await _healthCheckService.GetUnhealthyTenantsAsync();
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Schedules a background health check for a specific tenant
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    [HttpPost("{tenantId}/schedule-check")]
    public IActionResult ScheduleHealthCheck(Guid tenantId)
    {
        var jobId = TenantHealthCheckJob.TriggerForTenant(tenantId);
        return Ok(new { jobId, message = "Health check scheduled successfully" });
    }

    /// <summary>
    /// Performs health checks for all active tenants (admin only)
    /// </summary>
    [HttpPost("check-all")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> PerformAllHealthChecks()
    {
        var result = await _healthCheckService.PerformAllTenantsHealthCheckAsync();
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }
}
