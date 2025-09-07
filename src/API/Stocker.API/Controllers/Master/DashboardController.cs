using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.API.Controllers.Master;

[ApiController]
[Route("api/master/dashboard")]
[Authorize(Policy = "RequireMasterAccess")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardRepository _dashboardRepository;
    private readonly IMediator _mediator;

    public DashboardController(IDashboardRepository dashboardRepository, IMediator mediator)
    {
        _dashboardRepository = dashboardRepository;
        _mediator = mediator;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardRepository.GetMasterDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpGet("revenue-overview")]
    public async Task<IActionResult> GetRevenueOverview()
    {
        var revenue = await _dashboardRepository.GetRevenueOverviewAsync();
        return Ok(revenue);
    }

    [HttpGet("tenant-stats")]
    public async Task<IActionResult> GetTenantStats()
    {
        var stats = await _dashboardRepository.GetTenantStatsAsync();
        return Ok(stats);
    }

    [HttpGet("system-health")]
    public async Task<IActionResult> GetSystemHealth()
    {
        var health = await _dashboardRepository.GetSystemHealthAsync();
        return Ok(health);
    }

    [HttpGet("recent-tenants")]
    public async Task<IActionResult> GetRecentTenants()
    {
        var tenants = await _dashboardRepository.GetRecentTenantsAsync(10);
        return Ok(new { tenants });
    }

    [HttpGet("recent-users")]
    public async Task<IActionResult> GetRecentUsers()
    {
        var users = await _dashboardRepository.GetRecentUsersAsync(10);
        return Ok(new { users });
    }
}