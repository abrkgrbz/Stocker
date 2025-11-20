using Stocker.Application.DTOs.Security;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Stocker.Application.Features.Security.Queries.GetAuditLogAnalytics;

/// <summary>
/// Handler for retrieving audit log analytics data
/// </summary>
public class GetAuditLogAnalyticsQueryHandler : IRequestHandler<GetAuditLogAnalyticsQuery, Result<AuditLogAnalyticsDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetAuditLogAnalyticsQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AuditLogAnalyticsDto>> Handle(GetAuditLogAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.SecurityAuditLogs().AsQueryable();

        // Apply date filters
        if (request.FromDate.HasValue)
            query = query.Where(x => x.Timestamp >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(x => x.Timestamp <= request.ToDate.Value);

        var logs = await query.ToListAsync(cancellationToken);

        // Hourly Activity (24 hours)
        var hourlyActivity = logs
            .GroupBy(x => x.Timestamp.Hour)
            .Select(g => new HourlyDataPoint
            {
                Hour = g.Key,
                Label = $"{g.Key:D2}:00",
                Count = g.Count()
            })
            .OrderBy(x => x.Hour)
            .ToList();

        // Fill missing hours with zero
        for (int i = 0; i < 24; i++)
        {
            if (!hourlyActivity.Any(x => x.Hour == i))
            {
                hourlyActivity.Add(new HourlyDataPoint
                {
                    Hour = i,
                    Label = $"{i:D2}:00",
                    Count = 0
                });
            }
        }
        hourlyActivity = hourlyActivity.OrderBy(x => x.Hour).ToList();

        // Category Distribution
        var categoryMapping = new Dictionary<string, string>
        {
            { "LOGIN_SUCCESS", "Authentication" },
            { "LOGIN_FAILED", "Authentication" },
            { "LOGOUT", "Authentication" },
            { "TENANT_CREATED", "System" },
            { "TENANT_UPDATED", "System" },
            { "USER_CREATED", "Admin Actions" },
            { "USER_UPDATED", "Admin Actions" },
            { "UNAUTHORIZED_ACCESS", "Security" },
            { "API_CALL", "API Calls" },
            { "DATA_ACCESS", "Data Access" }
        };

        var categoryData = logs
            .GroupBy(x => categoryMapping.ContainsKey(x.Event) ? categoryMapping[x.Event] : "Other")
            .Select(g => new CategoryDataPoint
            {
                Category = g.Key,
                Count = g.Count(),
                Percentage = Math.Round((double)g.Count() / logs.Count * 100, 2)
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        // Severity Distribution
        var severityData = logs
            .GroupBy(x => x.RiskScore >= 80 ? "Critical" :
                         x.RiskScore >= 60 ? "Error" :
                         x.RiskScore >= 40 ? "Warning" : "Info")
            .Select(g => new SeverityDataPoint
            {
                Level = g.Key,
                Count = g.Count(),
                Percentage = Math.Round((double)g.Count() / logs.Count * 100, 2)
            })
            .ToList();

        var severityDistribution = new SeverityDistributionDto
        {
            Info = severityData.FirstOrDefault(x => x.Level == "Info")?.Count ?? 0,
            Warning = severityData.FirstOrDefault(x => x.Level == "Warning")?.Count ?? 0,
            Error = severityData.FirstOrDefault(x => x.Level == "Error")?.Count ?? 0,
            Critical = severityData.FirstOrDefault(x => x.Level == "Critical")?.Count ?? 0,
            Data = severityData
        };

        // Weekly Heatmap (7 days x 24 hours)
        var dayNames = new[] { "Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt" };
        var heatmapData = new List<HeatmapDataPoint>();

        for (int day = 0; day < 7; day++)
        {
            for (int hour = 0; hour < 24; hour++)
            {
                var count = logs.Count(x => (int)x.Timestamp.DayOfWeek == day && x.Timestamp.Hour == hour);
                heatmapData.Add(new HeatmapDataPoint
                {
                    Day = dayNames[day],
                    DayOfWeek = day,
                    Hour = hour,
                    Count = count
                });
            }
        }

        var analytics = new AuditLogAnalyticsDto
        {
            HourlyActivity = new HourlyActivityDto { Data = hourlyActivity },
            CategoryDistribution = new CategoryDistributionDto { Data = categoryData },
            SeverityDistribution = severityDistribution,
            WeeklyHeatmap = new WeeklyHeatmapDto { Data = heatmapData }
        };

        return Result<AuditLogAnalyticsDto>.Success(analytics);
    }
}
