using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Dashboard;
using Stocker.Application.Features.Dashboard.Queries.GetDashboardStatistics;
using Stocker.Application.Features.Dashboard.Queries.GetRevenueReport;
using Stocker.Application.Features.Dashboard.Queries.GetTenantGrowth;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Dashboard & Analytics - System-wide metrics and reporting")]
public class DashboardController : MasterControllerBase
{
    public DashboardController(IMediator mediator, ILogger<DashboardController> logger) 
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get overall dashboard statistics
    /// </summary>
    [HttpGet("statistics")]
    [SwaggerOperation(
        Summary = "Get dashboard statistics",
        Description = "Returns comprehensive dashboard statistics including tenant counts, revenue, and activity",
        Tags = new[] { "Dashboard" }
    )]
    [ProducesResponseType(typeof(ApiResponse<DashboardStatisticsDto>), 200)]
    public async Task<IActionResult> GetStatistics()
    {
        _logger.LogInformation("Getting dashboard statistics");
        
        var query = new GetDashboardStatisticsQuery();
        var statistics = await _mediator.Send(query);
        
        return Ok(new ApiResponse<DashboardStatisticsDto>
        {
            Success = true,
            Data = statistics,
            Message = "Dashboard statistics retrieved successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get revenue report
    /// </summary>
    [HttpGet("revenue")]
    [ProducesResponseType(typeof(ApiResponse<RevenueReportDto>), 200)]
    public async Task<IActionResult> GetRevenueReport([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
    {
        _logger.LogInformation("Getting revenue report from {FromDate} to {ToDate}", fromDate, toDate);
        
        var query = new GetRevenueReportQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };
        var report = await _mediator.Send(query);
        
        return Ok(new ApiResponse<RevenueReportDto>
        {
            Success = true,
            Data = report,
            Message = "Revenue report retrieved successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get tenant growth metrics
    /// </summary>
    [HttpGet("tenant-growth")]
    [ProducesResponseType(typeof(ApiResponse<TenantGrowthDto>), 200)]
    public async Task<IActionResult> GetTenantGrowth([FromQuery] int months = 6)
    {
        _logger.LogInformation("Getting tenant growth metrics for last {Months} months", months);
        
        var query = new GetTenantGrowthQuery
        {
            Months = months
        };
        var growth = await _mediator.Send(query);
        
        return Ok(new ApiResponse<TenantGrowthDto>
        {
            Success = true,
            Data = growth,
            Message = "Tenant growth metrics retrieved successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get subscription metrics
    /// </summary>
    [HttpGet("subscription-metrics")]
    [ProducesResponseType(typeof(ApiResponse<SubscriptionMetricsDto>), 200)]
    public async Task<IActionResult> GetSubscriptionMetrics()
    {
        _logger.LogInformation("Getting subscription metrics");
        
        // TODO: Implement GetSubscriptionMetricsQuery
        var metrics = new SubscriptionMetricsDto
        {
            TotalSubscriptions = 0,
            ActiveSubscriptions = 0,
            TrialSubscriptions = 0,
            CancelledSubscriptions = 0,
            SuspendedSubscriptions = 0,
            ConversionRate = 0,
            AverageSubscriptionValue = 0,
            SubscriptionsByPackage = new List<PackageSubscriptionDto>(),
            UpcomingRenewals = new List<UpcomingRenewalDto>()
        };
        
        return Ok(new ApiResponse<SubscriptionMetricsDto>
        {
            Success = true,
            Data = metrics,
            Message = "Subscription metrics retrieved successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get top performing tenants
    /// </summary>
    [HttpGet("top-tenants")]
    [ProducesResponseType(typeof(ApiResponse<List<TopTenantDto>>), 200)]
    public async Task<IActionResult> GetTopTenants([FromQuery] int count = 10)
    {
        _logger.LogInformation("Getting top {Count} tenants", count);
        
        // TODO: Implement GetTopTenantsQuery
        var topTenants = new List<TopTenantDto>();
        
        return Ok(new ApiResponse<List<TopTenantDto>>
        {
            Success = true,
            Data = topTenants,
            Message = "Top tenants retrieved successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get recent system activity
    /// </summary>
    [HttpGet("recent-activity")]
    [ProducesResponseType(typeof(ApiResponse<List<ActivityDto>>), 200)]
    public async Task<IActionResult> GetRecentActivity([FromQuery] int count = 20)
    {
        _logger.LogInformation("Getting recent {Count} activities", count);
        
        // TODO: Implement GetRecentActivityQuery
        var activities = new List<ActivityDto>();
        
        return Ok(new ApiResponse<List<ActivityDto>>
        {
            Success = true,
            Data = activities,
            Message = "Recent activities retrieved successfully",
            Timestamp = DateTime.UtcNow
        });
    }
}