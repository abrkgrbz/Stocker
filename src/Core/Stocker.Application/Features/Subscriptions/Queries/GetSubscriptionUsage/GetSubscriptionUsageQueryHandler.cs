using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionUsage;

public class GetSubscriptionUsageQueryHandler : IRequestHandler<GetSubscriptionUsageQuery, Result<SubscriptionUsageResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<GetSubscriptionUsageQueryHandler> _logger;

    public GetSubscriptionUsageQueryHandler(IMasterDbContext context, ILogger<GetSubscriptionUsageQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SubscriptionUsageResponse>> Handle(GetSubscriptionUsageQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

            if (subscription == null)
            {
                return Result<SubscriptionUsageResponse>.Failure(Error.NotFound("Subscription.NotFound", "Subscription not found"));
            }

            // Get usage metrics from SubscriptionUsages table
            var startDate = request.StartDate ?? DateTime.UtcNow.AddDays(-30);
            var endDate = request.EndDate ?? DateTime.UtcNow;

            var usageRecords = await _context.SubscriptionUsages
                .Where(u => u.SubscriptionId == request.SubscriptionId
                    && u.RecordedAt >= startDate
                    && u.RecordedAt <= endDate)
                .OrderByDescending(u => u.RecordedAt)
                .ToListAsync(cancellationToken);

            // Get tenant limits
            var tenantLimits = await _context.TenantLimits
                .FirstOrDefaultAsync(l => l.TenantId == subscription.TenantId, cancellationToken);

            // Build metrics from latest records
            var latestMetrics = usageRecords
                .GroupBy(u => u.MetricName)
                .Select(g => g.First())
                .ToList();

            var metrics = BuildMetrics(latestMetrics, tenantLimits);

            // Build trends (daily aggregates)
            var trends = usageRecords
                .GroupBy(u => new { u.MetricName, Date = u.RecordedAt.Date })
                .Select(g => new UsageTrendDto(
                    MetricName: g.Key.MetricName,
                    Date: g.Key.Date,
                    Value: g.Max(x => x.Value)
                ))
                .OrderBy(t => t.Date)
                .ToList();

            // Build summary
            var summary = BuildSummary(latestMetrics, tenantLimits);

            var response = new SubscriptionUsageResponse(
                SubscriptionId: subscription.Id,
                SubscriptionNumber: subscription.SubscriptionNumber,
                Metrics: metrics,
                Trends: trends,
                Summary: summary
            );

            return Result<SubscriptionUsageResponse>.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription usage for {SubscriptionId}", request.SubscriptionId);
            return Result<SubscriptionUsageResponse>.Failure(Error.Failure("Subscription.Usage.Error", ex.Message));
        }
    }

    private static List<UsageMetricDto> BuildMetrics(List<Domain.Master.Entities.SubscriptionUsage> usageRecords, Domain.Master.Entities.TenantLimits? limits)
    {
        var metrics = new List<UsageMetricDto>();

        var metricDefinitions = new Dictionary<string, (string DisplayName, int? GetLimit)>
        {
            { "users", ("Kullanıcı Sayısı", limits?.MaxUsers) },
            { "storage_gb", ("Depolama (GB)", limits != null ? (int)limits.MaxStorageGB : null) },
            { "api_calls", ("API Çağrısı", limits != null ? (int)limits.MaxMonthlyApiCalls : null) },
            { "products", ("Ürün Sayısı", null) },
            { "invoices", ("Fatura Sayısı", null) },
            { "customers", ("Müşteri Sayısı", null) }
        };

        foreach (var record in usageRecords)
        {
            var (displayName, limit) = metricDefinitions.GetValueOrDefault(record.MetricName.ToLower(), (record.MetricName, null));
            var usagePercentage = limit.HasValue && limit.Value > 0
                ? Math.Round((double)record.Value / limit.Value * 100, 1)
                : 0;

            metrics.Add(new UsageMetricDto(
                MetricName: record.MetricName,
                DisplayName: displayName,
                CurrentValue: record.Value,
                Limit: limit,
                UsagePercentage: usagePercentage,
                LastUpdated: record.RecordedAt
            ));
        }

        // Add default metrics if not present
        foreach (var def in metricDefinitions)
        {
            if (!metrics.Any(m => m.MetricName.Equals(def.Key, StringComparison.OrdinalIgnoreCase)))
            {
                metrics.Add(new UsageMetricDto(
                    MetricName: def.Key,
                    DisplayName: def.Value.DisplayName,
                    CurrentValue: 0,
                    Limit: def.Value.GetLimit,
                    UsagePercentage: 0,
                    LastUpdated: DateTime.UtcNow
                ));
            }
        }

        return metrics;
    }

    private static UsageSummaryDto BuildSummary(List<Domain.Master.Entities.SubscriptionUsage> usageRecords, Domain.Master.Entities.TenantLimits? limits)
    {
        var userMetric = usageRecords.FirstOrDefault(u => u.MetricName.Equals("users", StringComparison.OrdinalIgnoreCase));
        var activeUserMetric = usageRecords.FirstOrDefault(u => u.MetricName.Equals("active_users", StringComparison.OrdinalIgnoreCase));
        var storageMetric = usageRecords.FirstOrDefault(u => u.MetricName.Equals("storage_mb", StringComparison.OrdinalIgnoreCase));
        var apiMetric = usageRecords.FirstOrDefault(u => u.MetricName.Equals("api_calls", StringComparison.OrdinalIgnoreCase));

        return new UsageSummaryDto(
            TotalUsers: userMetric?.Value ?? 0,
            ActiveUsers: activeUserMetric?.Value ?? userMetric?.Value ?? 0,
            TotalStorageUsedMB: storageMetric?.Value ?? 0,
            StorageLimitMB: limits != null ? (int)(limits.MaxStorageGB * 1024) : 10240,
            ApiCallsThisMonth: apiMetric?.Value ?? 0,
            ApiCallLimit: limits != null ? (int)limits.MaxMonthlyApiCalls : 100000
        );
    }
}
