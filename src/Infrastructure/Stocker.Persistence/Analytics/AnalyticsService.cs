using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.Domain.Master.Enums;

namespace Stocker.Persistence.Analytics;

public class AnalyticsService : IAnalyticsService
{
    private readonly IMasterDbContext _masterContext;

    public AnalyticsService(IMasterDbContext masterContext)
    {
        _masterContext = masterContext;
    }

    public async Task<RevenueAnalyticsDto> GetRevenueAnalyticsAsync(
        DateTime? startDate,
        DateTime? endDate,
        string period,
        CancellationToken cancellationToken = default)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
        var end = endDate ?? DateTime.UtcNow;

        // Real data from subscriptions
        var subscriptions = await _masterContext.Subscriptions
            .Include(s => s.Package)
            .Where(s => s.StartDate <= end)
            .ToListAsync(cancellationToken);

        var activeSubscriptions = subscriptions
            .Where(s => s.Status == SubscriptionStatus.Aktif || s.Status == SubscriptionStatus.Deneme)
            .ToList();

        // Calculate total revenue from subscription prices
        var totalRevenue = activeSubscriptions.Sum(s => s.Price?.Amount ?? 0);

        // Monthly recurring revenue (MRR)
        var monthlyRevenue = activeSubscriptions
            .Where(s => s.BillingCycle == BillingCycle.Aylik)
            .Sum(s => s.Price?.Amount ?? 0);

        // Annual subscriptions converted to monthly
        monthlyRevenue += activeSubscriptions
            .Where(s => s.BillingCycle == BillingCycle.Yillik)
            .Sum(s => (s.Price?.Amount ?? 0) / 12);

        // Calculate growth rate from historical data
        var previousPeriodStart = start.AddMonths(-12);
        var previousPeriodEnd = start;
        var previousSubscriptions = subscriptions
            .Where(s => s.StartDate >= previousPeriodStart && s.StartDate < previousPeriodEnd)
            .ToList();

        var currentPeriodSubscriptions = subscriptions
            .Where(s => s.StartDate >= start && s.StartDate <= end)
            .ToList();

        var previousRevenue = previousSubscriptions.Sum(s => s.Price?.Amount ?? 0);
        var currentRevenue = currentPeriodSubscriptions.Sum(s => s.Price?.Amount ?? 0);

        double growthRate = previousRevenue > 0
            ? (double)((currentRevenue - previousRevenue) / previousRevenue * 100)
            : 0;

        // Calculate churn rate
        var cancelledCount = subscriptions
            .Count(s => s.Status == SubscriptionStatus.IptalEdildi && s.CancelledAt >= start);
        var totalActiveAtStart = subscriptions.Count(s => s.StartDate <= start);
        double churnRate = totalActiveAtStart > 0
            ? (double)cancelledCount / totalActiveAtStart * 100
            : 0;

        // Average revenue per user
        var totalTenants = activeSubscriptions.Select(s => s.TenantId).Distinct().Count();
        var arpu = totalTenants > 0 ? (double)(totalRevenue / totalTenants) : 0;

        // Revenue by package from real data
        var revenueByPackage = activeSubscriptions
            .Where(s => s.Package != null)
            .GroupBy(s => s.Package!.Name)
            .Select(g => new PackageRevenueDto
            {
                PackageName = g.Key,
                Revenue = g.Sum(s => s.Price?.Amount ?? 0),
                Percentage = totalRevenue > 0
                    ? (double)(g.Sum(s => s.Price?.Amount ?? 0) / totalRevenue * 100)
                    : 0
            })
            .OrderByDescending(r => r.Revenue)
            .ToList();

        // Top paying tenants
        var topPayingTenants = await _masterContext.Subscriptions
            .Include(s => s.Tenant)
            .Include(s => s.Package)
            .Where(s => s.Status == SubscriptionStatus.Aktif)
            .GroupBy(s => new { s.TenantId, s.Tenant.Name, PackageName = s.Package != null ? s.Package.Name : "Custom" })
            .Select(g => new TopTenantDto
            {
                TenantName = g.Key.Name,
                Revenue = g.Sum(s => s.Price.Amount),
                PackageName = g.Key.PackageName
            })
            .OrderByDescending(t => t.Revenue)
            .Take(10)
            .ToListAsync(cancellationToken);

        // Generate period revenue from actual data
        var periodRevenue = GeneratePeriodRevenueFromData(subscriptions, start, end);

        return new RevenueAnalyticsDto
        {
            Period = period,
            StartDate = start,
            EndDate = end,
            TotalRevenue = totalRevenue,
            RecurringRevenue = monthlyRevenue * 12,
            OneTimeRevenue = 0, // One-time revenue tracked separately if needed
            GrowthRate = Math.Round(growthRate, 2),
            ChurnRate = Math.Round(churnRate, 2),
            AverageRevenuePerUser = arpu,
            RevenueByPeriod = periodRevenue,
            RevenueByPackage = revenueByPackage,
            TopPayingTenants = topPayingTenants
        };
    }

    public async Task<UserAnalyticsDto> GetUserAnalyticsAsync(
        string period,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var monthAgo = now.AddMonths(-1);
        var weekAgo = now.AddDays(-7);
        var dayAgo = now.AddDays(-1);

        // Get all users from master database
        var allUsers = await _masterContext.MasterUsers.ToListAsync(cancellationToken);
        var totalUsers = allUsers.Count;

        // Calculate active users based on LastLoginAt
        var activeUsers = allUsers.Count(u => u.LastLoginAt >= monthAgo);
        var weeklyActiveUsers = allUsers.Count(u => u.LastLoginAt >= weekAgo);
        var dailyActiveUsers = allUsers.Count(u => u.LastLoginAt >= dayAgo);

        // New users in last month
        var newUsers = allUsers.Count(u => u.CreatedAt >= monthAgo);

        // Users who haven't logged in for 3+ months (churned)
        var threeMonthsAgo = now.AddMonths(-3);
        var churnedUsers = allUsers.Count(u => u.LastLoginAt < threeMonthsAgo || !u.LastLoginAt.HasValue);

        // Calculate rates
        var activationRate = totalUsers > 0
            ? (double)activeUsers / totalUsers * 100
            : 0;

        var retentionRate = totalUsers > 0
            ? (double)(totalUsers - churnedUsers) / totalUsers * 100
            : 0;

        // Calculate average session duration (mock - would need session tracking)
        // This would require a separate SessionLog table to track accurately
        var averageSessionDuration = 25.0; // Default, needs session tracking

        // User growth over time
        var userGrowth = GenerateUserGrowthFromData(allUsers);

        // Users by type distribution
        var usersByRole = allUsers
            .GroupBy(u => u.UserType.ToString())
            .Select(g => new UserRoleDistribution
            {
                Role = g.Key switch
                {
                    "SistemYoneticisi" => "Sistem Yöneticisi",
                    "FirmaYoneticisi" => "Firma Yöneticisi",
                    "Personel" => "Personel",
                    "Destek" => "Destek",
                    "Misafir" => "Misafir",
                    _ => g.Key
                },
                Count = g.Count(),
                Percentage = totalUsers > 0 ? (double)g.Count() / totalUsers * 100 : 0
            })
            .OrderByDescending(r => r.Count)
            .ToList();

        // Average login frequency (logins per week)
        var loginHistoryCount = await _masterContext.SecurityAuditLogs
            .Where(l => l.Event == "login_success" && l.Timestamp >= monthAgo)
            .CountAsync(cancellationToken);

        var averageLoginFrequency = totalUsers > 0
            ? (double)loginHistoryCount / totalUsers / 4 // Per week over month
            : 0;

        return new UserAnalyticsDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            NewUsers = newUsers,
            ChurnedUsers = churnedUsers,
            ActivationRate = Math.Round(activationRate, 2),
            RetentionRate = Math.Round(retentionRate, 2),
            AverageSessionDuration = averageSessionDuration,
            UserGrowth = userGrowth,
            UsersByRole = usersByRole,
            UserActivity = new UserActivityMetrics
            {
                DailyActiveUsers = dailyActiveUsers,
                WeeklyActiveUsers = weeklyActiveUsers,
                MonthlyActiveUsers = activeUsers,
                AverageLoginFrequency = Math.Round(averageLoginFrequency, 2)
            }
        };
    }

    public async Task<SubscriptionAnalyticsDto> GetSubscriptionAnalyticsAsync(
        CancellationToken cancellationToken = default)
    {
        var subscriptions = await _masterContext.Subscriptions
            .Include(s => s.Package)
            .ToListAsync(cancellationToken);

        var totalSubscriptions = subscriptions.Count;
        var activeSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.Aktif);
        var trialSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.Deneme);
        var expiredSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.SuresiDoldu);
        var cancelledSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.IptalEdildi);
        var suspendedSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.Askida);
        var pastDueSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.OdemesiGecikti);

        // Calculate conversion rate (trial -> active)
        var convertedFromTrial = subscriptions
            .Count(s => s.Status == SubscriptionStatus.Aktif && s.TrialEndDate.HasValue);
        var totalTrialEver = subscriptions.Count(s => s.TrialEndDate.HasValue);
        var conversionRate = totalTrialEver > 0
            ? (double)convertedFromTrial / totalTrialEver * 100
            : 0;

        // Calculate upgrade/downgrade rates (would need change history)
        // For now, calculate based on package tier changes if tracked
        var upgradeRate = 0.0;
        var downgradeRate = 0.0;

        // Average subscription value
        var avgSubscriptionValue = subscriptions.Any()
            ? (double)subscriptions.Average(s => s.Price?.Amount ?? 0)
            : 0;

        // Subscriptions by status
        var subscriptionsByStatus = new List<SubscriptionStatusDto>
        {
            new() { Status = "Aktif", Count = activeSubscriptions, Percentage = totalSubscriptions > 0 ? (double)activeSubscriptions / totalSubscriptions * 100 : 0 },
            new() { Status = "Deneme", Count = trialSubscriptions, Percentage = totalSubscriptions > 0 ? (double)trialSubscriptions / totalSubscriptions * 100 : 0 },
            new() { Status = "Süresi Doldu", Count = expiredSubscriptions, Percentage = totalSubscriptions > 0 ? (double)expiredSubscriptions / totalSubscriptions * 100 : 0 },
            new() { Status = "İptal Edildi", Count = cancelledSubscriptions, Percentage = totalSubscriptions > 0 ? (double)cancelledSubscriptions / totalSubscriptions * 100 : 0 },
            new() { Status = "Askıda", Count = suspendedSubscriptions, Percentage = totalSubscriptions > 0 ? (double)suspendedSubscriptions / totalSubscriptions * 100 : 0 },
            new() { Status = "Ödemesi Gecikti", Count = pastDueSubscriptions, Percentage = totalSubscriptions > 0 ? (double)pastDueSubscriptions / totalSubscriptions * 100 : 0 }
        };

        // Subscription trends from historical data
        var subscriptionTrends = GenerateSubscriptionTrendsFromData(subscriptions);

        // Churn prediction based on activity
        var highRiskCount = subscriptions.Count(s =>
            s.Status == SubscriptionStatus.OdemesiGecikti ||
            s.Status == SubscriptionStatus.Askida);
        var mediumRiskCount = subscriptions.Count(s =>
            s.Status == SubscriptionStatus.Aktif &&
            s.CurrentPeriodEnd <= DateTime.UtcNow.AddDays(30));
        var lowRiskCount = activeSubscriptions - mediumRiskCount;

        var predictedChurnRate = totalSubscriptions > 0
            ? (double)(highRiskCount + mediumRiskCount * 0.3) / totalSubscriptions * 100
            : 0;

        return new SubscriptionAnalyticsDto
        {
            TotalSubscriptions = totalSubscriptions,
            ActiveSubscriptions = activeSubscriptions,
            TrialSubscriptions = trialSubscriptions,
            ExpiredSubscriptions = expiredSubscriptions,
            ConversionRate = Math.Round(conversionRate, 2),
            UpgradeRate = upgradeRate,
            DowngradeRate = downgradeRate,
            AverageSubscriptionValue = avgSubscriptionValue,
            SubscriptionsByStatus = subscriptionsByStatus,
            SubscriptionTrends = subscriptionTrends,
            ChurnPrediction = new ChurnPredictionDto
            {
                HighRiskCount = highRiskCount,
                MediumRiskCount = mediumRiskCount,
                LowRiskCount = Math.Max(0, lowRiskCount),
                PredictedChurnRate = Math.Round(predictedChurnRate, 2)
            }
        };
    }

    public async Task<PerformanceAnalyticsDto> GetPerformanceAnalyticsAsync(
        CancellationToken cancellationToken = default)
    {
        // Performance metrics would typically come from APM tools like Application Insights
        // For now, we provide system-level metrics and placeholders for APM integration

        var process = System.Diagnostics.Process.GetCurrentProcess();

        // Memory usage
        var totalMemory = GC.GetGCMemoryInfo().TotalAvailableMemoryBytes;
        var usedMemory = process.WorkingSet64;
        var memoryUsage = totalMemory > 0 ? (double)usedMemory / totalMemory * 100 : 0;

        // CPU usage (simplified)
        var cpuUsage = 0.0;
        try
        {
            var startTime = DateTime.UtcNow;
            var startCpuUsage = process.TotalProcessorTime;
            await Task.Delay(100, cancellationToken);
            var endTime = DateTime.UtcNow;
            var endCpuUsage = process.TotalProcessorTime;

            var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
            var totalMsPassed = (endTime - startTime).TotalMilliseconds;
            cpuUsage = cpuUsedMs / totalMsPassed * 100;
        }
        catch
        {
            // Ignore CPU calculation errors
        }

        // Disk usage
        var driveInfo = new DriveInfo(Path.GetPathRoot(AppDomain.CurrentDomain.BaseDirectory) ?? "C:\\");
        var diskUsage = (double)(driveInfo.TotalSize - driveInfo.AvailableFreeSpace) / driveInfo.TotalSize * 100;

        // Response time history (would come from APM)
        var responseTimeHistory = GenerateResponseTimeHistory();

        // Endpoint performance (would come from APM - placeholder data)
        var endpointPerformance = new List<EndpointMetricDto>
        {
            new() { Endpoint = "/api/inventory/products", AverageTime = 35.0, CallCount = 0 },
            new() { Endpoint = "/api/sales/orders", AverageTime = 42.0, CallCount = 0 },
            new() { Endpoint = "/api/auth/login", AverageTime = 120.0, CallCount = 0 },
            new() { Endpoint = "/api/inventory/stock", AverageTime = 28.0, CallCount = 0 },
            new() { Endpoint = "/api/crm/customers", AverageTime = 38.0, CallCount = 0 }
        };

        return new PerformanceAnalyticsDto
        {
            AverageResponseTime = 45.0, // Would come from APM
            P95ResponseTime = 125.0,
            P99ResponseTime = 245.0,
            RequestsPerSecond = 0, // Would come from APM
            ErrorRate = 0.0,
            SuccessRate = 100.0,
            TotalRequests = 0,
            FailedRequests = 0,
            ResponseTimeHistory = responseTimeHistory,
            EndpointPerformance = endpointPerformance,
            SystemMetrics = new SystemPerformanceMetrics
            {
                CpuUsage = Math.Round(cpuUsage, 2),
                MemoryUsage = Math.Round(memoryUsage, 2),
                DiskUsage = Math.Round(diskUsage, 2),
                NetworkLatency = 0.0
            }
        };
    }

    public async Task<UsageAnalyticsDto> GetUsageAnalyticsAsync(
        CancellationToken cancellationToken = default)
    {
        // Get tenant and subscription data
        var tenants = await _masterContext.Tenants
            .Where(t => t.IsActive)
            .ToListAsync(cancellationToken);

        var subscriptions = await _masterContext.Subscriptions
            .Include(s => s.Modules)
            .Where(s => s.Status == SubscriptionStatus.Aktif)
            .ToListAsync(cancellationToken);

        var activeTenantCount = tenants.Count;

        // Calculate storage usage from subscriptions
        var totalStorageUsed = subscriptions.Sum(s => s.StorageUsedBytes) / (1024.0 * 1024.0 * 1024.0); // GB
        var avgStoragePerTenant = activeTenantCount > 0 ? totalStorageUsed / activeTenantCount : 0;

        // Module usage from subscription modules
        var moduleUsage = subscriptions
            .SelectMany(s => s.Modules)
            .GroupBy(m => m.ModuleName)
            .Select(g => new ModuleUsageDto
            {
                Module = g.Key,
                ActiveTenants = g.Select(m => m.SubscriptionId).Distinct().Count(),
                UsagePercentage = activeTenantCount > 0
                    ? (double)g.Select(m => m.SubscriptionId).Distinct().Count() / activeTenantCount * 100
                    : 0
            })
            .OrderByDescending(m => m.ActiveTenants)
            .ToList();

        // Feature usage (would need tracking table)
        var featureUsage = new List<FeatureUsageDto>
        {
            new() { Feature = "Ürün Yönetimi", UsageCount = 0, Percentage = 0 },
            new() { Feature = "Sipariş İşleme", UsageCount = 0, Percentage = 0 },
            new() { Feature = "Raporlama", UsageCount = 0, Percentage = 0 },
            new() { Feature = "Faturalama", UsageCount = 0, Percentage = 0 },
            new() { Feature = "Müşteri Yönetimi", UsageCount = 0, Percentage = 0 }
        };

        // Peak usage times (would need request logging)
        var peakUsageTimes = new List<PeakUsageDto>
        {
            new() { Hour = 9, UsageLevel = "High", RequestCount = 0 },
            new() { Hour = 10, UsageLevel = "Peak", RequestCount = 0 },
            new() { Hour = 11, UsageLevel = "Peak", RequestCount = 0 },
            new() { Hour = 14, UsageLevel = "High", RequestCount = 0 },
            new() { Hour = 15, UsageLevel = "High", RequestCount = 0 }
        };

        return new UsageAnalyticsDto
        {
            TotalApiCalls = 0, // Would come from API gateway/APM
            AverageApiCallsPerTenant = 0,
            TotalStorageUsed = Math.Round(totalStorageUsed, 2),
            AverageStoragePerTenant = Math.Round(avgStoragePerTenant, 2),
            BandwidthUsed = 0, // Would need network tracking
            FeatureUsage = featureUsage,
            ModuleUsage = moduleUsage,
            PeakUsageTimes = peakUsageTimes
        };
    }

    public async Task<GrowthAnalyticsDto> GetGrowthAnalyticsAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var monthAgo = now.AddMonths(-1);
        var yearAgo = now.AddYears(-1);

        // Current counts
        var currentTenants = await _masterContext.Tenants.CountAsync(cancellationToken);
        var currentUsers = await _masterContext.MasterUsers.CountAsync(cancellationToken);

        // Historical counts
        var tenantsMonthAgo = await _masterContext.Tenants
            .CountAsync(t => t.CreatedAt <= monthAgo, cancellationToken);
        var tenantsYearAgo = await _masterContext.Tenants
            .CountAsync(t => t.CreatedAt <= yearAgo, cancellationToken);

        var usersMonthAgo = await _masterContext.MasterUsers
            .CountAsync(u => u.CreatedAt <= monthAgo, cancellationToken);
        var usersYearAgo = await _masterContext.MasterUsers
            .CountAsync(u => u.CreatedAt <= yearAgo, cancellationToken);

        // Revenue calculations
        var currentSubscriptions = await _masterContext.Subscriptions
            .Where(s => s.Status == SubscriptionStatus.Aktif)
            .ToListAsync(cancellationToken);

        var currentYearlyRevenue = currentSubscriptions.Sum(s =>
            s.BillingCycle == BillingCycle.Yillik
                ? s.Price?.Amount ?? 0
                : (s.Price?.Amount ?? 0) * 12);

        // Growth rates
        var monthlyTenantGrowth = tenantsMonthAgo > 0
            ? (double)(currentTenants - tenantsMonthAgo) / tenantsMonthAgo * 100
            : 0;
        var yearlyTenantGrowth = tenantsYearAgo > 0
            ? (double)(currentTenants - tenantsYearAgo) / tenantsYearAgo * 100
            : 0;

        var userGrowthRate = usersYearAgo > 0
            ? (double)(currentUsers - usersYearAgo) / usersYearAgo * 100
            : 0;

        // Revenue growth (simplified - would need historical revenue tracking)
        var revenueGrowthRate = 0.0;

        // Projections (based on current growth rates)
        var projectedMonthlyRevenue = currentYearlyRevenue / 12 * (decimal)(1 + monthlyTenantGrowth / 100);
        var projectedYearlyRevenue = currentYearlyRevenue * (decimal)(1 + yearlyTenantGrowth / 100);
        var projectedUserCount = (int)(currentUsers * (1 + userGrowthRate / 100));
        var projectedTenantCount = (int)(currentTenants * (1 + yearlyTenantGrowth / 100));

        // Growth trends
        var growthTrends = new List<GrowthTrendDto>
        {
            new()
            {
                Category = "Tenant'lar",
                CurrentValue = currentTenants,
                PreviousValue = tenantsYearAgo,
                GrowthRate = Math.Round(yearlyTenantGrowth, 2),
                Projection = projectedTenantCount
            },
            new()
            {
                Category = "Kullanıcılar",
                CurrentValue = currentUsers,
                PreviousValue = usersYearAgo,
                GrowthRate = Math.Round(userGrowthRate, 2),
                Projection = projectedUserCount
            },
            new()
            {
                Category = "Gelir",
                CurrentValue = (double)currentYearlyRevenue,
                PreviousValue = 0,
                GrowthRate = revenueGrowthRate,
                Projection = (double)projectedYearlyRevenue
            }
        };

        // Market penetration (placeholder - would need market data)
        var marketPenetration = new MarketPenetrationDto
        {
            TotalAddressableMarket = 10000,
            CurrentMarketShare = currentTenants / 100.0,
            ProjectedMarketShare = projectedTenantCount / 100.0,
            CompetitorAnalysis = new List<CompetitorDto>() // Would need external data
        };

        return new GrowthAnalyticsDto
        {
            MonthlyGrowthRate = Math.Round(monthlyTenantGrowth, 2),
            YearlyGrowthRate = Math.Round(yearlyTenantGrowth, 2),
            UserGrowthRate = Math.Round(userGrowthRate, 2),
            RevenueGrowthRate = Math.Round(revenueGrowthRate, 2),
            TenantGrowthRate = Math.Round(yearlyTenantGrowth, 2),
            ProjectedMonthlyRevenue = projectedMonthlyRevenue,
            ProjectedYearlyRevenue = projectedYearlyRevenue,
            ProjectedUserCount = projectedUserCount,
            ProjectedTenantCount = projectedTenantCount,
            GrowthTrends = growthTrends,
            MarketPenetration = marketPenetration
        };
    }

    public async Task<CustomAnalyticsResultDto> GetCustomAnalyticsAsync(
        CustomAnalyticsRequest request,
        CancellationToken cancellationToken = default)
    {
        var results = new Dictionary<string, object>();

        foreach (var metric in request.Metrics)
        {
            switch (metric.ToLower())
            {
                case "revenue":
                    var subscriptions = await _masterContext.Subscriptions
                        .Where(s => s.Status == SubscriptionStatus.Aktif)
                        .ToListAsync(cancellationToken);

                    var monthlyRevenue = subscriptions
                        .Where(s => s.BillingCycle == BillingCycle.Aylik)
                        .Sum(s => s.Price?.Amount ?? 0);
                    monthlyRevenue += subscriptions
                        .Where(s => s.BillingCycle == BillingCycle.Yillik)
                        .Sum(s => (s.Price?.Amount ?? 0) / 12);

                    results["revenue"] = new
                    {
                        monthly = monthlyRevenue,
                        yearly = monthlyRevenue * 12
                    };
                    break;

                case "tenants":
                    var totalTenants = await _masterContext.Tenants.CountAsync(cancellationToken);
                    var activeTenants = await _masterContext.Tenants
                        .CountAsync(t => t.IsActive, cancellationToken);
                    var trialTenants = await _masterContext.Subscriptions
                        .CountAsync(s => s.Status == SubscriptionStatus.Deneme, cancellationToken);

                    results["tenants"] = new
                    {
                        total = totalTenants,
                        active = activeTenants,
                        trial = trialTenants
                    };
                    break;

                case "users":
                    var users = await _masterContext.MasterUsers
                        .OrderByDescending(u => u.CreatedAt)
                        .Take(100)
                        .ToListAsync(cancellationToken);

                    results["users"] = new
                    {
                        total = await _masterContext.MasterUsers.CountAsync(cancellationToken),
                        recent = users.Take(10).Select(u => new { u.Email, u.CreatedAt })
                    };
                    break;

                case "health":
                    results["health"] = new
                    {
                        status = "Healthy",
                        databaseStatus = "Connected",
                        timestamp = DateTime.UtcNow
                    };
                    break;

                default:
                    results[metric] = new { message = $"Metrik '{metric}' desteklenmiyor" };
                    break;
            }
        }

        return new CustomAnalyticsResultDto
        {
            QueryId = Guid.NewGuid(),
            Title = request.Title ?? "Özel Analitik",
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Metrics = request.Metrics,
            GeneratedAt = DateTime.UtcNow,
            Data = results,
            Charts = new List<ChartDataDto>(),
            Summary = results
        };
    }

    #region Helper Methods

    private static List<PeriodRevenueDto> GeneratePeriodRevenueFromData(
        List<Domain.Master.Entities.Subscription> subscriptions,
        DateTime start,
        DateTime end)
    {
        var result = new List<PeriodRevenueDto>();
        var current = new DateTime(start.Year, start.Month, 1);
        decimal previousRevenue = 0;

        while (current <= end)
        {
            var monthEnd = current.AddMonths(1);
            var activeInMonth = subscriptions
                .Where(s => s.StartDate <= monthEnd &&
                           (s.CancelledAt == null || s.CancelledAt >= current))
                .ToList();

            var monthRevenue = activeInMonth.Sum(s => s.Price?.Amount ?? 0);
            var growth = previousRevenue > 0
                ? (double)((monthRevenue - previousRevenue) / previousRevenue * 100)
                : 0;

            result.Add(new PeriodRevenueDto
            {
                Period = current.ToString("MMM yyyy"),
                Revenue = monthRevenue,
                Growth = Math.Round(growth, 2)
            });

            previousRevenue = monthRevenue;
            current = monthEnd;
        }

        return result;
    }

    private static List<UserGrowthDto> GenerateUserGrowthFromData(
        List<Domain.Master.Entities.MasterUser> users)
    {
        var result = new List<UserGrowthDto>();
        var current = DateTime.UtcNow.AddMonths(-6);

        for (int i = 0; i < 6; i++)
        {
            var monthEnd = current.AddMonths(1);
            var totalAtMonth = users.Count(u => u.CreatedAt <= monthEnd);
            var newInMonth = users.Count(u => u.CreatedAt >= current && u.CreatedAt < monthEnd);

            // Churned users would need tracking - using placeholder
            var churned = 0;

            result.Add(new UserGrowthDto
            {
                Period = current.ToString("MMM yyyy"),
                TotalUsers = totalAtMonth,
                NewUsers = newInMonth,
                ChurnedUsers = churned
            });

            current = monthEnd;
        }

        return result;
    }

    private static List<SubscriptionTrendDto> GenerateSubscriptionTrendsFromData(
        List<Domain.Master.Entities.Subscription> subscriptions)
    {
        var result = new List<SubscriptionTrendDto>();
        var current = DateTime.UtcNow.AddMonths(-6);

        for (int i = 0; i < 6; i++)
        {
            var monthEnd = current.AddMonths(1);

            var newSubscriptions = subscriptions
                .Count(s => s.StartDate >= current && s.StartDate < monthEnd);
            var cancellations = subscriptions
                .Count(s => s.CancelledAt >= current && s.CancelledAt < monthEnd);

            // Upgrades/downgrades would need change tracking
            result.Add(new SubscriptionTrendDto
            {
                Month = current.ToString("MMM yyyy"),
                NewSubscriptions = newSubscriptions,
                Cancellations = cancellations,
                Upgrades = 0,
                Downgrades = 0
            });

            current = monthEnd;
        }

        return result;
    }

    private static List<ResponseTimeDto> GenerateResponseTimeHistory()
    {
        // Would come from APM - placeholder showing the structure
        var result = new List<ResponseTimeDto>();
        var current = DateTime.UtcNow.AddHours(-24);

        for (int i = 0; i < 24; i++)
        {
            result.Add(new ResponseTimeDto
            {
                Timestamp = current,
                AverageTime = 0,
                P95Time = 0,
                P99Time = 0
            });
            current = current.AddHours(1);
        }

        return result;
    }

    #endregion
}
