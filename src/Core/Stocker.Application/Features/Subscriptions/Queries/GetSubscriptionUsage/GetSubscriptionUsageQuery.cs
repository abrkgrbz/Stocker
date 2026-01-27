using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionUsage;

public record GetSubscriptionUsageQuery : IRequest<Result<SubscriptionUsageResponse>>
{
    public Guid SubscriptionId { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public record SubscriptionUsageResponse(
    Guid SubscriptionId,
    string SubscriptionNumber,
    List<UsageMetricDto> Metrics,
    List<UsageTrendDto> Trends,
    UsageSummaryDto Summary
);

public record UsageMetricDto(
    string MetricName,
    string DisplayName,
    int CurrentValue,
    int? Limit,
    double UsagePercentage,
    DateTime LastUpdated
);

public record UsageTrendDto(
    string MetricName,
    DateTime Date,
    int Value
);

public record UsageSummaryDto(
    int TotalUsers,
    int ActiveUsers,
    int TotalStorageUsedMB,
    int StorageLimitMB,
    int ApiCallsThisMonth,
    int ApiCallLimit
);
