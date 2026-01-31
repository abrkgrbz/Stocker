using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Master;
using Stocker.Application.Features.Analytics.Queries.GetCustomAnalytics;
using Stocker.Application.Features.Analytics.Queries.GetGrowthAnalytics;
using Stocker.Application.Features.Analytics.Queries.GetPerformanceAnalytics;
using Stocker.Application.Features.Analytics.Queries.GetRevenueAnalytics;
using Stocker.Application.Features.Analytics.Queries.GetSubscriptionAnalytics;
using Stocker.Application.Features.Analytics.Queries.GetUsageAnalytics;
using Stocker.Application.Features.Analytics.Queries.GetUserAnalytics;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - Analytics and Business Intelligence")]
public class AnalyticsController : MasterControllerBase
{
    public AnalyticsController(
        IMediator mediator,
        ILogger<AnalyticsController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get revenue analytics
    /// </summary>
    [HttpGet("revenue")]
    [ProducesResponseType(typeof(ApiResponse<RevenueAnalyticsDto>), 200)]
    public async Task<IActionResult> GetRevenueAnalytics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string period = "monthly")
    {
        _logger.LogInformation("Getting revenue analytics for period: {Period}", period);

        var query = new GetRevenueAnalyticsQuery(startDate, endDate, period);
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get user analytics
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<UserAnalyticsDto>), 200)]
    public async Task<IActionResult> GetUserAnalytics([FromQuery] string period = "monthly")
    {
        _logger.LogInformation("Getting user analytics for period: {Period}", period);

        var query = new GetUserAnalyticsQuery(period);
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get subscription analytics
    /// </summary>
    [HttpGet("subscriptions")]
    [ProducesResponseType(typeof(ApiResponse<SubscriptionAnalyticsDto>), 200)]
    public async Task<IActionResult> GetSubscriptionAnalytics()
    {
        _logger.LogInformation("Getting subscription analytics");

        var query = new GetSubscriptionAnalyticsQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get performance analytics
    /// </summary>
    [HttpGet("performance")]
    [ProducesResponseType(typeof(ApiResponse<PerformanceAnalyticsDto>), 200)]
    public async Task<IActionResult> GetPerformanceAnalytics()
    {
        _logger.LogInformation("Getting performance analytics");

        var query = new GetPerformanceAnalyticsQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get usage analytics
    /// </summary>
    [HttpGet("usage")]
    [ProducesResponseType(typeof(ApiResponse<UsageAnalyticsDto>), 200)]
    public async Task<IActionResult> GetUsageAnalytics()
    {
        _logger.LogInformation("Getting usage analytics");

        var query = new GetUsageAnalyticsQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get growth analytics
    /// </summary>
    [HttpGet("growth")]
    [ProducesResponseType(typeof(ApiResponse<GrowthAnalyticsDto>), 200)]
    public async Task<IActionResult> GetGrowthAnalytics()
    {
        _logger.LogInformation("Getting growth analytics");

        var query = new GetGrowthAnalyticsQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get custom analytics based on parameters
    /// </summary>
    [HttpPost("custom")]
    [ProducesResponseType(typeof(ApiResponse<CustomAnalyticsResultDto>), 200)]
    public async Task<IActionResult> GetCustomAnalytics([FromBody] CustomAnalyticsRequest request)
    {
        _logger.LogInformation("Custom analytics requested for metrics: {Metrics}",
            string.Join(", ", request.Metrics));

        var query = new GetCustomAnalyticsQuery(request);
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }
}
