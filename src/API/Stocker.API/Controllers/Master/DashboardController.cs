using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Interfaces.Repositories;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - Dashboard and Statistics")]
public class DashboardController : MasterControllerBase
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardController(
        IDashboardRepository dashboardRepository,
        IMediator mediator,
        ILogger<DashboardController> logger)
        : base(mediator, logger)
    {
        _dashboardRepository = dashboardRepository;
    }

    /// <summary>
    /// Get master dashboard statistics
    /// </summary>
    [HttpGet("stats")]
    [SwaggerOperation(Summary = "Get dashboard statistics", Description = "Returns key dashboard statistics including tenant, user, and revenue data")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            _logger.LogInformation("Getting master dashboard statistics");
            var stats = await _dashboardRepository.GetMasterDashboardStatsAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = stats,
                Message = "Dashboard istatistikleri başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting master dashboard statistics");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Dashboard istatistikleri alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get revenue overview data
    /// </summary>
    [HttpGet("revenue-overview")]
    [SwaggerOperation(Summary = "Get revenue overview", Description = "Returns revenue overview including MRR, ARR, and trends")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetRevenueOverview()
    {
        try
        {
            _logger.LogInformation("Getting revenue overview");
            var revenue = await _dashboardRepository.GetRevenueOverviewAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = revenue,
                Message = "Gelir özeti başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting revenue overview");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Gelir özeti alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get tenant statistics
    /// </summary>
    [HttpGet("tenant-stats")]
    [SwaggerOperation(Summary = "Get tenant statistics", Description = "Returns tenant distribution and status statistics")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetTenantStats()
    {
        try
        {
            _logger.LogInformation("Getting tenant statistics");
            var stats = await _dashboardRepository.GetTenantStatsAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = stats,
                Message = "Tenant istatistikleri başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tenant statistics");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant istatistikleri alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get system health status
    /// </summary>
    [HttpGet("system-health")]
    [SwaggerOperation(Summary = "Get system health", Description = "Returns current system health metrics")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetSystemHealth()
    {
        try
        {
            _logger.LogInformation("Getting system health status");
            var health = await _dashboardRepository.GetSystemHealthAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = health,
                Message = "Sistem durumu başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system health");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Sistem durumu alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get recently registered tenants
    /// </summary>
    [HttpGet("recent-tenants")]
    [SwaggerOperation(Summary = "Get recent tenants", Description = "Returns the most recently registered tenants")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetRecentTenants([FromQuery] int count = 10)
    {
        try
        {
            _logger.LogInformation("Getting recent tenants. Count: {Count}", count);
            var tenants = await _dashboardRepository.GetRecentTenantsAsync(count);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { tenants },
                Message = "Son tenant'lar başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent tenants");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Son tenant'lar alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get recently created users
    /// </summary>
    [HttpGet("recent-users")]
    [SwaggerOperation(Summary = "Get recent users", Description = "Returns the most recently created users")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetRecentUsers([FromQuery] int count = 10)
    {
        try
        {
            _logger.LogInformation("Getting recent users. Count: {Count}", count);
            var users = await _dashboardRepository.GetRecentUsersAsync(count);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { users },
                Message = "Son kullanıcılar başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent users");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Son kullanıcılar alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get comprehensive dashboard summary with all key data in a single call
    /// </summary>
    [HttpGet("summary")]
    [SwaggerOperation(Summary = "Get complete dashboard summary", Description = "Returns all dashboard data including stats, health, alerts, and recent activities in a single optimized call")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetDashboardSummary(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Getting complete dashboard summary");
            var summary = await _dashboardRepository.GetMasterDashboardSummaryAsync(cancellationToken);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = summary,
                Message = "Dashboard özeti başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard summary");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Dashboard özeti alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get key performance metrics (MRR, ARR, Churn, etc.)
    /// </summary>
    [HttpGet("key-metrics")]
    [SwaggerOperation(Summary = "Get key business metrics", Description = "Returns MRR, ARR, churn rate, ARPU, CLV, NRR, and trial conversion rate")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetKeyMetrics(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Getting key business metrics");
            var metrics = await _dashboardRepository.GetMasterKeyMetricsAsync(cancellationToken);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = metrics,
                Message = "Anahtar metrikler başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting key metrics");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Anahtar metrikler alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get quick action items requiring attention
    /// </summary>
    [HttpGet("quick-actions")]
    [SwaggerOperation(Summary = "Get pending quick actions", Description = "Returns items requiring immediate attention like pending registrations, overdue invoices, expiring subscriptions")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetQuickActions(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Getting quick actions");
            var actions = await _dashboardRepository.GetQuickActionsAsync(cancellationToken);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { actions },
                Message = "Hızlı eylemler başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting quick actions");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Hızlı eylemler alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get system alerts summary
    /// </summary>
    [HttpGet("alerts-summary")]
    [SwaggerOperation(Summary = "Get alerts summary", Description = "Returns active alerts count by severity and recent alert previews")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetAlertsSummary(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Getting alerts summary");
            var alertsSummary = await _dashboardRepository.GetAlertsSummaryAsync(cancellationToken);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = alertsSummary,
                Message = "Uyarı özeti başarıyla alındı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting alerts summary");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Uyarı özeti alınırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
