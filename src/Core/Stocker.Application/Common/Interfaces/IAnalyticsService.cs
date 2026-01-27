using Stocker.Application.DTOs.Master;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service interface for analytics operations
/// </summary>
public interface IAnalyticsService
{
    Task<RevenueAnalyticsDto> GetRevenueAnalyticsAsync(
        DateTime? startDate = null,
        DateTime? endDate = null,
        string period = "monthly",
        CancellationToken cancellationToken = default);

    Task<UserAnalyticsDto> GetUserAnalyticsAsync(
        string period = "monthly",
        CancellationToken cancellationToken = default);

    Task<SubscriptionAnalyticsDto> GetSubscriptionAnalyticsAsync(
        CancellationToken cancellationToken = default);

    Task<PerformanceAnalyticsDto> GetPerformanceAnalyticsAsync(
        CancellationToken cancellationToken = default);

    Task<UsageAnalyticsDto> GetUsageAnalyticsAsync(
        CancellationToken cancellationToken = default);

    Task<GrowthAnalyticsDto> GetGrowthAnalyticsAsync(
        CancellationToken cancellationToken = default);

    Task<CustomAnalyticsResultDto> GetCustomAnalyticsAsync(
        CustomAnalyticsRequest request,
        CancellationToken cancellationToken = default);
}
