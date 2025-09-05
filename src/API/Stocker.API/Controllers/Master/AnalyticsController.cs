using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Master;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Analytics - System analytics and business intelligence")]
public class AnalyticsController : MasterControllerBase
{
    public AnalyticsController(IMediator mediator, ILogger<AnalyticsController> logger) 
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
        var start = startDate ?? DateTime.UtcNow.AddMonths(-6);
        var end = endDate ?? DateTime.UtcNow;

        var analytics = new RevenueAnalyticsDto
        {
            Period = period,
            StartDate = start,
            EndDate = end,
            TotalRevenue = 524350,
            RecurringRevenue = 485000,
            OneTimeRevenue = 39350,
            GrowthRate = 12.5,
            ChurnRate = 2.3,
            AverageRevenuePerUser = 136.25,
            RevenueByPeriod = GenerateRevenueByPeriod(period, start, end),
            RevenueByPackage = new List<PackageRevenueDto>
            {
                new PackageRevenueDto { PackageName = "Enterprise", Revenue = 250000, Percentage = 47.7 },
                new PackageRevenueDto { PackageName = "Professional", Revenue = 180000, Percentage = 34.3 },
                new PackageRevenueDto { PackageName = "Starter", Revenue = 94350, Percentage = 18.0 }
            },
            TopPayingTenants = new List<TopTenantDto>
            {
                new TopTenantDto { TenantName = "ABC Corp", Revenue = 45000, PackageName = "Enterprise" },
                new TopTenantDto { TenantName = "XYZ Ltd", Revenue = 38000, PackageName = "Enterprise" },
                new TopTenantDto { TenantName = "Tech Solutions", Revenue = 32000, PackageName = "Professional" }
            }
        };

        return Ok(new ApiResponse<RevenueAnalyticsDto>
        {
            Success = true,
            Data = analytics,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get user analytics
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<UserAnalyticsDto>), 200)]
    public async Task<IActionResult> GetUserAnalytics([FromQuery] string period = "monthly")
    {
        var analytics = new UserAnalyticsDto
        {
            TotalUsers = 4823,
            ActiveUsers = 3854,
            NewUsers = 286,
            ChurnedUsers = 45,
            ActivationRate = 79.9,
            RetentionRate = 94.2,
            AverageSessionDuration = 24.5, // minutes
            UserGrowth = GenerateUserGrowth(period),
            UsersByRole = new List<UserRoleDistribution>
            {
                new UserRoleDistribution { Role = "Admin", Count = 386, Percentage = 8.0 },
                new UserRoleDistribution { Role = "Manager", Count = 964, Percentage = 20.0 },
                new UserRoleDistribution { Role = "User", Count = 3473, Percentage = 72.0 }
            },
            UserActivity = new UserActivityMetrics
            {
                DailyActiveUsers = 2890,
                WeeklyActiveUsers = 3500,
                MonthlyActiveUsers = 3854,
                AverageLoginFrequency = 4.2 // per week
            }
        };

        return Ok(new ApiResponse<UserAnalyticsDto>
        {
            Success = true,
            Data = analytics,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get subscription analytics
    /// </summary>
    [HttpGet("subscriptions")]
    [ProducesResponseType(typeof(ApiResponse<SubscriptionAnalyticsDto>), 200)]
    public async Task<IActionResult> GetSubscriptionAnalytics()
    {
        var analytics = new SubscriptionAnalyticsDto
        {
            TotalSubscriptions = 386,
            ActiveSubscriptions = 342,
            TrialSubscriptions = 28,
            ExpiredSubscriptions = 16,
            ConversionRate = 68.5,
            UpgradeRate = 15.3,
            DowngradeRate = 3.2,
            AverageSubscriptionValue = 1530.50,
            SubscriptionsByStatus = new List<SubscriptionStatusDto>
            {
                new SubscriptionStatusDto { Status = "Active", Count = 342, Percentage = 88.6 },
                new SubscriptionStatusDto { Status = "Trial", Count = 28, Percentage = 7.3 },
                new SubscriptionStatusDto { Status = "Expired", Count = 16, Percentage = 4.1 }
            },
            SubscriptionTrends = GenerateSubscriptionTrends(),
            ChurnPrediction = new ChurnPredictionDto
            {
                HighRiskCount = 12,
                MediumRiskCount = 24,
                LowRiskCount = 306,
                PredictedChurnRate = 3.5
            }
        };

        return Ok(new ApiResponse<SubscriptionAnalyticsDto>
        {
            Success = true,
            Data = analytics,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get performance analytics
    /// </summary>
    [HttpGet("performance")]
    [ProducesResponseType(typeof(ApiResponse<PerformanceAnalyticsDto>), 200)]
    public async Task<IActionResult> GetPerformanceAnalytics()
    {
        var analytics = new PerformanceAnalyticsDto
        {
            AverageResponseTime = 125, // ms
            P95ResponseTime = 450, // ms
            P99ResponseTime = 850, // ms
            RequestsPerSecond = 45.8,
            ErrorRate = 0.12, // percentage
            SuccessRate = 99.88,
            TotalRequests = 3956420,
            FailedRequests = 4748,
            ResponseTimeHistory = GenerateResponseTimeHistory(),
            EndpointPerformance = new List<EndpointMetricDto>
            {
                new EndpointMetricDto { Endpoint = "GET /api/tenants", AverageTime = 85, CallCount = 45620 },
                new EndpointMetricDto { Endpoint = "POST /api/auth/login", AverageTime = 125, CallCount = 38900 },
                new EndpointMetricDto { Endpoint = "GET /api/dashboard", AverageTime = 250, CallCount = 28450 }
            },
            SystemMetrics = new SystemPerformanceMetrics
            {
                CpuUsage = 35.2,
                MemoryUsage = 62.8,
                DiskUsage = 45.3,
                NetworkLatency = 12.5
            }
        };

        return Ok(new ApiResponse<PerformanceAnalyticsDto>
        {
            Success = true,
            Data = analytics,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get usage analytics
    /// </summary>
    [HttpGet("usage")]
    [ProducesResponseType(typeof(ApiResponse<UsageAnalyticsDto>), 200)]
    public async Task<IActionResult> GetUsageAnalytics()
    {
        var analytics = new UsageAnalyticsDto
        {
            TotalApiCalls = 8956420,
            AverageApiCallsPerTenant = 23210,
            TotalStorageUsed = 2456, // GB
            AverageStoragePerTenant = 6.4, // GB
            BandwidthUsed = 12450, // GB
            FeatureUsage = new List<FeatureUsageDto>
            {
                new FeatureUsageDto { Feature = "Inventory Management", UsageCount = 456890, Percentage = 85.2 },
                new FeatureUsageDto { Feature = "CRM", UsageCount = 325670, Percentage = 72.3 },
                new FeatureUsageDto { Feature = "Reporting", UsageCount = 286450, Percentage = 68.5 },
                new FeatureUsageDto { Feature = "Analytics", UsageCount = 198340, Percentage = 52.1 }
            },
            ModuleUsage = new List<ModuleUsageDto>
            {
                new ModuleUsageDto { Module = "Core", ActiveTenants = 386, UsagePercentage = 100 },
                new ModuleUsageDto { Module = "CRM", ActiveTenants = 278, UsagePercentage = 72.0 },
                new ModuleUsageDto { Module = "Inventory", ActiveTenants = 298, UsagePercentage = 77.2 },
                new ModuleUsageDto { Module = "Finance", ActiveTenants = 156, UsagePercentage = 40.4 }
            },
            PeakUsageTimes = new List<PeakUsageDto>
            {
                new PeakUsageDto { Hour = 9, UsageLevel = "High", RequestCount = 125600 },
                new PeakUsageDto { Hour = 14, UsageLevel = "High", RequestCount = 118900 },
                new PeakUsageDto { Hour = 16, UsageLevel = "Medium", RequestCount = 89450 }
            }
        };

        return Ok(new ApiResponse<UsageAnalyticsDto>
        {
            Success = true,
            Data = analytics,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get growth analytics
    /// </summary>
    [HttpGet("growth")]
    [ProducesResponseType(typeof(ApiResponse<GrowthAnalyticsDto>), 200)]
    public async Task<IActionResult> GetGrowthAnalytics()
    {
        var analytics = new GrowthAnalyticsDto
        {
            MonthlyGrowthRate = 12.5,
            YearlyGrowthRate = 186.3,
            UserGrowthRate = 15.2,
            RevenueGrowthRate = 18.6,
            TenantGrowthRate = 8.9,
            ProjectedMonthlyRevenue = 605000,
            ProjectedYearlyRevenue = 8500000,
            ProjectedUserCount = 5800,
            ProjectedTenantCount = 450,
            GrowthTrends = GenerateGrowthTrends(),
            MarketPenetration = new MarketPenetrationDto
            {
                TotalAddressableMarket = 50000,
                CurrentMarketShare = 0.77,
                ProjectedMarketShare = 1.2,
                CompetitorAnalysis = new List<CompetitorDto>
                {
                    new CompetitorDto { Name = "Competitor A", MarketShare = 12.5 },
                    new CompetitorDto { Name = "Competitor B", MarketShare = 8.3 },
                    new CompetitorDto { Name = "Others", MarketShare = 78.43 }
                }
            }
        };

        return Ok(new ApiResponse<GrowthAnalyticsDto>
        {
            Success = true,
            Data = analytics,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get custom analytics based on parameters
    /// </summary>
    [HttpPost("custom")]
    [ProducesResponseType(typeof(ApiResponse<CustomAnalyticsResultDto>), 200)]
    public async Task<IActionResult> GetCustomAnalytics([FromBody] CustomAnalyticsRequest request)
    {
        _logger.LogInformation("Generating custom analytics for metrics: {Metrics}", 
            string.Join(", ", request.Metrics));

        var result = new CustomAnalyticsResultDto
        {
            QueryId = Guid.NewGuid(),
            Title = request.Title ?? "Custom Analytics Report",
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Metrics = request.Metrics,
            GeneratedAt = DateTime.UtcNow,
            Data = GenerateCustomData(request.Metrics),
            Charts = GenerateChartData(request.Metrics),
            Summary = new Dictionary<string, object>
            {
                { "TotalDataPoints", Random.Shared.Next(100, 1000) },
                { "AverageValue", Random.Shared.Next(50, 500) },
                { "TrendDirection", "Upward" }
            }
        };

        return Ok(new ApiResponse<CustomAnalyticsResultDto>
        {
            Success = true,
            Data = result,
            Message = "Özel analiz raporu başarıyla oluşturuldu",
            Timestamp = DateTime.UtcNow
        });
    }

    #region Helper Methods

    private List<PeriodRevenueDto> GenerateRevenueByPeriod(string period, DateTime start, DateTime end)
    {
        var revenues = new List<PeriodRevenueDto>();
        var months = new[] { "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran" };

        for (int i = 0; i < 6; i++)
        {
            revenues.Add(new PeriodRevenueDto
            {
                Period = months[i],
                Revenue = 320000 + (i * 35000) + Random.Shared.Next(-10000, 20000),
                Growth = 8.5 + Random.Shared.NextDouble() * 6
            });
        }

        return revenues;
    }

    private List<UserGrowthDto> GenerateUserGrowth(string period)
    {
        var growth = new List<UserGrowthDto>();
        var baseUsers = 3500;

        for (int i = 0; i < 6; i++)
        {
            growth.Add(new UserGrowthDto
            {
                Period = DateTime.UtcNow.AddMonths(-5 + i).ToString("MMM yyyy"),
                TotalUsers = baseUsers + (i * 250) + Random.Shared.Next(-50, 100),
                NewUsers = 200 + Random.Shared.Next(-50, 100),
                ChurnedUsers = 20 + Random.Shared.Next(-10, 20)
            });
        }

        return growth;
    }

    private List<SubscriptionTrendDto> GenerateSubscriptionTrends()
    {
        var trends = new List<SubscriptionTrendDto>();

        for (int i = 0; i < 12; i++)
        {
            trends.Add(new SubscriptionTrendDto
            {
                Month = DateTime.UtcNow.AddMonths(-11 + i).ToString("MMM yyyy"),
                NewSubscriptions = 25 + Random.Shared.Next(-10, 15),
                Cancellations = 5 + Random.Shared.Next(-3, 5),
                Upgrades = 8 + Random.Shared.Next(-3, 5),
                Downgrades = 2 + Random.Shared.Next(-1, 3)
            });
        }

        return trends;
    }

    private List<ResponseTimeDto> GenerateResponseTimeHistory()
    {
        var history = new List<ResponseTimeDto>();

        for (int i = 0; i < 24; i++)
        {
            history.Add(new ResponseTimeDto
            {
                Timestamp = DateTime.UtcNow.AddHours(-23 + i),
                AverageTime = 100 + Random.Shared.Next(-30, 80),
                P95Time = 300 + Random.Shared.Next(-50, 150),
                P99Time = 500 + Random.Shared.Next(-100, 300)
            });
        }

        return history;
    }

    private List<GrowthTrendDto> GenerateGrowthTrends()
    {
        var trends = new List<GrowthTrendDto>();
        var categories = new[] { "Revenue", "Users", "Tenants", "Subscriptions" };

        foreach (var category in categories)
        {
            trends.Add(new GrowthTrendDto
            {
                Category = category,
                CurrentValue = Random.Shared.Next(100, 1000),
                PreviousValue = Random.Shared.Next(80, 900),
                GrowthRate = 5 + Random.Shared.NextDouble() * 20,
                Projection = Random.Shared.Next(120, 1200)
            });
        }

        return trends;
    }

    private object GenerateCustomData(List<string> metrics)
    {
        var data = new Dictionary<string, object>();

        foreach (var metric in metrics)
        {
            data[metric] = metric.ToLower() switch
            {
                "revenue" => Random.Shared.Next(100000, 1000000),
                "users" => Random.Shared.Next(1000, 10000),
                "tenants" => Random.Shared.Next(100, 1000),
                _ => Random.Shared.Next(1, 100)
            };
        }

        return data;
    }

    private List<ChartDataDto> GenerateChartData(List<string> metrics)
    {
        var charts = new List<ChartDataDto>();

        foreach (var metric in metrics)
        {
            var dataPoints = new List<object>();
            for (int i = 0; i < 10; i++)
            {
                dataPoints.Add(new
                {
                    x = i,
                    y = Random.Shared.Next(10, 100)
                });
            }

            charts.Add(new ChartDataDto
            {
                Type = "line",
                Title = $"{metric} Trend",
                Data = dataPoints
            });
        }

        return charts;
    }

    #endregion
}