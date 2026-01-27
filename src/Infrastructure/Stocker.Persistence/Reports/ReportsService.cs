using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.Domain.Master.Enums;

namespace Stocker.Persistence.Reports;

public class ReportsService : IReportsService
{
    private readonly IMasterDbContext _masterContext;

    private static readonly List<ReportTypeDto> AvailableReportTypes = new()
    {
        new ReportTypeDto
        {
            Id = "tenant-summary",
            Name = "Tenant Özet Raporu",
            Description = "Tüm tenant'ların abonelik ve kullanım istatistikleri",
            Category = "Tenant'lar",
            Icon = "TeamOutlined",
            IsAvailable = true
        },
        new ReportTypeDto
        {
            Id = "subscription-report",
            Name = "Abonelik Raporu",
            Description = "Detaylı abonelik durumu ve gelir dağılımı",
            Category = "Faturalama",
            Icon = "DollarOutlined",
            IsAvailable = true
        },
        new ReportTypeDto
        {
            Id = "revenue-report",
            Name = "Gelir Raporu",
            Description = "Aylık ve yıllık gelir analizi",
            Category = "Faturalama",
            Icon = "LineChartOutlined",
            IsAvailable = true
        },
        new ReportTypeDto
        {
            Id = "user-activity-report",
            Name = "Kullanıcı Aktivite Raporu",
            Description = "Tenant'lar genelinde kullanıcı giriş ve aktivite istatistikleri",
            Category = "Kullanıcılar",
            Icon = "UserOutlined",
            IsAvailable = true
        },
        new ReportTypeDto
        {
            Id = "security-report",
            Name = "Güvenlik Raporu",
            Description = "Güvenlik olayları, başarısız girişler ve risk değerlendirmeleri",
            Category = "Güvenlik",
            Icon = "SafetyOutlined",
            IsAvailable = true
        },
        new ReportTypeDto
        {
            Id = "system-health-report",
            Name = "Sistem Sağlığı Raporu",
            Description = "Sistem performans ve sağlık metrikleri",
            Category = "Sistem",
            Icon = "HeartOutlined",
            IsAvailable = true
        },
        new ReportTypeDto
        {
            Id = "module-usage-report",
            Name = "Modül Kullanım Raporu",
            Description = "Modül aktivasyonu ve kullanım istatistikleri",
            Category = "Modüller",
            Icon = "AppstoreOutlined",
            IsAvailable = true
        }
    };

    private static readonly List<ScheduledReportDto> ScheduledReports = new();
    private static readonly List<ReportHistoryDto> ReportHistory = new();

    public ReportsService(IMasterDbContext masterContext)
    {
        _masterContext = masterContext;
    }

    public Task<List<ReportTypeDto>> GetReportTypesAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(AvailableReportTypes);
    }

    public Task<Dictionary<string, List<ReportTypeDto>>> GetReportTypesGroupedAsync(CancellationToken cancellationToken = default)
    {
        var grouped = AvailableReportTypes
            .GroupBy(r => r.Category)
            .ToDictionary(g => g.Key, g => g.ToList());

        return Task.FromResult(grouped);
    }

    public async Task<ReportResultDto?> GenerateReportAsync(
        GenerateReportRequest request,
        string currentUserEmail,
        CancellationToken cancellationToken = default)
    {
        var reportType = AvailableReportTypes.FirstOrDefault(r => r.Id == request.ReportType);
        if (reportType == null)
        {
            return null;
        }

        var startTime = DateTime.UtcNow;
        object? reportData = null;
        Dictionary<string, object> keyMetrics = new();
        int totalRecords = 0;

        var reportStartDate = request.StartDate == default ? DateTime.UtcNow.AddMonths(-1) : request.StartDate;
        var reportEndDate = request.EndDate == default ? DateTime.UtcNow : request.EndDate;

        switch (request.ReportType)
        {
            case "tenant-summary":
                var tenantSummary = await GenerateTenantSummaryReportAsync(reportStartDate, reportEndDate, cancellationToken);
                reportData = tenantSummary.Data;
                keyMetrics = tenantSummary.Metrics;
                totalRecords = tenantSummary.RecordCount;
                break;

            case "subscription-report":
                var subscriptionReport = await GenerateSubscriptionReportAsync(reportStartDate, reportEndDate, cancellationToken);
                reportData = subscriptionReport.Data;
                keyMetrics = subscriptionReport.Metrics;
                totalRecords = subscriptionReport.RecordCount;
                break;

            case "revenue-report":
                var revenueReport = await GenerateRevenueReportAsync(reportStartDate, reportEndDate, cancellationToken);
                reportData = revenueReport.Data;
                keyMetrics = revenueReport.Metrics;
                totalRecords = revenueReport.RecordCount;
                break;

            case "user-activity-report":
                var userReport = await GenerateUserActivityReportAsync(reportStartDate, reportEndDate, cancellationToken);
                reportData = userReport.Data;
                keyMetrics = userReport.Metrics;
                totalRecords = userReport.RecordCount;
                break;

            case "security-report":
                var securityReport = await GenerateSecurityReportAsync(reportStartDate, reportEndDate, cancellationToken);
                reportData = securityReport.Data;
                keyMetrics = securityReport.Metrics;
                totalRecords = securityReport.RecordCount;
                break;

            case "system-health-report":
                var healthReport = GenerateSystemHealthReport();
                reportData = healthReport.Data;
                keyMetrics = healthReport.Metrics;
                totalRecords = healthReport.RecordCount;
                break;

            case "module-usage-report":
                var moduleReport = await GenerateModuleUsageReportAsync(cancellationToken);
                reportData = moduleReport.Data;
                keyMetrics = moduleReport.Metrics;
                totalRecords = moduleReport.RecordCount;
                break;

            default:
                return null;
        }

        var processingTime = (DateTime.UtcNow - startTime).TotalMilliseconds;

        var result = new ReportResultDto
        {
            ReportId = Guid.NewGuid(),
            ReportType = request.ReportType,
            Title = reportType.Name,
            GeneratedAt = DateTime.UtcNow,
            GeneratedBy = currentUserEmail,
            StartDate = reportStartDate,
            EndDate = reportEndDate,
            Format = request.Format ?? "json",
            Status = "Tamamlandı",
            Data = reportData,
            Summary = new ReportSummaryDto
            {
                TotalRecords = totalRecords,
                ProcessingTime = processingTime,
                KeyMetrics = keyMetrics
            }
        };

        ReportHistory.Insert(0, new ReportHistoryDto
        {
            Id = result.ReportId,
            ReportType = result.ReportType,
            Title = result.Title,
            GeneratedAt = result.GeneratedAt,
            GeneratedBy = result.GeneratedBy,
            Format = result.Format,
            FileSize = EstimateFileSize(reportData),
            Status = "Tamamlandı"
        });

        if (ReportHistory.Count > 100)
        {
            ReportHistory.RemoveRange(100, ReportHistory.Count - 100);
        }

        return result;
    }

    public Task<List<ReportHistoryDto>> GetReportHistoryAsync(
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var pagedHistory = ReportHistory
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Task.FromResult(pagedHistory);
    }

    public Task<(byte[] Content, string FileName)?> DownloadReportAsync(
        Guid reportId,
        string format = "csv",
        CancellationToken cancellationToken = default)
    {
        var historyItem = ReportHistory.FirstOrDefault(r => r.Id == reportId);
        if (historyItem == null)
        {
            return Task.FromResult<(byte[] Content, string FileName)?>(null);
        }

        var csvContent = new StringBuilder();
        csvContent.AppendLine("Rapor ID,Rapor Tipi,Başlık,Oluşturulma Tarihi,Oluşturan,Format,Durum");
        csvContent.AppendLine($"{historyItem.Id},{historyItem.ReportType},{historyItem.Title},{historyItem.GeneratedAt:yyyy-MM-dd HH:mm:ss},{historyItem.GeneratedBy},{historyItem.Format},{historyItem.Status}");

        var bytes = Encoding.UTF8.GetBytes(csvContent.ToString());
        var fileName = $"rapor_{reportId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        return Task.FromResult<(byte[] Content, string FileName)?>((bytes, fileName));
    }

    public Task<ScheduledReportDto?> ScheduleReportAsync(
        ScheduleReportRequest request,
        string currentUserEmail,
        CancellationToken cancellationToken = default)
    {
        var reportType = AvailableReportTypes.FirstOrDefault(r => r.Id == request.ReportType);
        if (reportType == null)
        {
            return Task.FromResult<ScheduledReportDto?>(null);
        }

        var validFrequencies = new[] { "daily", "weekly", "monthly" };
        if (!validFrequencies.Contains(request.Frequency.ToLower()))
        {
            return Task.FromResult<ScheduledReportDto?>(null);
        }

        var nextRunTime = request.Frequency.ToLower() switch
        {
            "daily" => DateTime.UtcNow.Date.AddDays(1).AddHours(6),
            "weekly" => DateTime.UtcNow.Date.AddDays(7 - (int)DateTime.UtcNow.DayOfWeek + 1).AddHours(6),
            "monthly" => new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(1).AddHours(6),
            _ => DateTime.UtcNow.AddDays(1)
        };

        var scheduledReport = new ScheduledReportDto
        {
            Id = Guid.NewGuid(),
            ReportType = request.ReportType,
            Title = reportType.Name,
            Frequency = request.Frequency,
            Recipients = request.Recipients,
            Format = request.Format,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserEmail,
            NextRunTime = nextRunTime,
            LastRunTime = null
        };

        ScheduledReports.Add(scheduledReport);

        return Task.FromResult<ScheduledReportDto?>(scheduledReport);
    }

    public Task<List<ScheduledReportDto>> GetScheduledReportsAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ScheduledReports.OrderByDescending(r => r.CreatedAt).ToList());
    }

    public Task<ScheduledReportDto?> ToggleScheduledReportAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var report = ScheduledReports.FirstOrDefault(r => r.Id == id);
        if (report == null)
        {
            return Task.FromResult<ScheduledReportDto?>(null);
        }

        report.IsActive = !report.IsActive;

        return Task.FromResult<ScheduledReportDto?>(report);
    }

    public Task<bool> DeleteScheduledReportAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var report = ScheduledReports.FirstOrDefault(r => r.Id == id);
        if (report == null)
        {
            return Task.FromResult(false);
        }

        ScheduledReports.Remove(report);

        return Task.FromResult(true);
    }

    #region Report Generation Methods

    private async Task<(object Data, Dictionary<string, object> Metrics, int RecordCount)> GenerateTenantSummaryReportAsync(
        DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var tenants = await _masterContext.Tenants
            .Include(t => t.Subscriptions)
            .ThenInclude(s => s.Package)
            .ToListAsync(cancellationToken);

        var totalTenants = tenants.Count;
        var activeTenants = tenants.Count(t => t.IsActive);
        var inactiveTenants = totalTenants - activeTenants;
        var newTenants = tenants.Count(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate);

        var tenantsBySubscription = tenants
            .SelectMany(t => t.Subscriptions)
            .Where(s => s.Status == SubscriptionStatus.Aktif || s.Status == SubscriptionStatus.Deneme)
            .GroupBy(s => s.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToList();

        var tenantDetails = tenants
            .OrderByDescending(t => t.CreatedAt)
            .Take(50)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Code,
                t.IsActive,
                t.CreatedAt,
                ActiveSubscription = t.Subscriptions
                    .FirstOrDefault(s => s.Status == SubscriptionStatus.Aktif || s.Status == SubscriptionStatus.Deneme),
                PackageName = t.Subscriptions
                    .FirstOrDefault(s => s.Status == SubscriptionStatus.Aktif || s.Status == SubscriptionStatus.Deneme)?
                    .Package?.Name ?? "Yok"
            })
            .ToList();

        var data = new
        {
            summary = new
            {
                totalTenants,
                activeTenants,
                inactiveTenants,
                newTenants,
                period = new { start = startDate, end = endDate }
            },
            tenantsBySubscription,
            tenantDetails
        };

        var metrics = new Dictionary<string, object>
        {
            ["ToplamTenant"] = totalTenants,
            ["AktifTenant"] = activeTenants,
            ["PasifTenant"] = inactiveTenants,
            ["YeniTenant"] = newTenants
        };

        return (data, metrics, totalTenants);
    }

    private async Task<(object Data, Dictionary<string, object> Metrics, int RecordCount)> GenerateSubscriptionReportAsync(
        DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var subscriptions = await _masterContext.Subscriptions
            .Include(s => s.Tenant)
            .Include(s => s.Package)
            .ToListAsync(cancellationToken);

        var totalSubscriptions = subscriptions.Count;
        var activeSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.Aktif);
        var trialSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.Deneme);
        var cancelledSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.IptalEdildi);
        var expiredSubscriptions = subscriptions.Count(s => s.Status == SubscriptionStatus.SuresiDoldu);

        var subscriptionsByPackage = subscriptions
            .Where(s => s.Package != null)
            .GroupBy(s => s.Package!.Name)
            .Select(g => new
            {
                Package = g.Key,
                Count = g.Count(),
                TotalRevenue = g.Sum(s => s.Price?.Amount ?? 0)
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        var subscriptionsByStatus = subscriptions
            .GroupBy(s => s.Status)
            .Select(g => new
            {
                Status = g.Key switch
                {
                    SubscriptionStatus.Aktif => "Aktif",
                    SubscriptionStatus.Deneme => "Deneme",
                    SubscriptionStatus.IptalEdildi => "İptal Edildi",
                    SubscriptionStatus.SuresiDoldu => "Süresi Doldu",
                    SubscriptionStatus.Askida => "Askıda",
                    SubscriptionStatus.OdemesiGecikti => "Ödemesi Gecikti",
                    SubscriptionStatus.Beklemede => "Beklemede",
                    _ => g.Key.ToString()
                },
                Count = g.Count()
            })
            .ToList();

        var recentSubscriptions = subscriptions
            .Where(s => s.StartDate >= startDate && s.StartDate <= endDate)
            .OrderByDescending(s => s.StartDate)
            .Take(20)
            .Select(s => new
            {
                s.Id,
                s.SubscriptionNumber,
                TenantName = s.Tenant?.Name ?? "Bilinmiyor",
                PackageName = s.Package?.Name ?? "Özel",
                Status = s.Status.ToString(),
                s.StartDate,
                s.CurrentPeriodEnd,
                Price = s.Price?.Amount ?? 0
            })
            .ToList();

        var data = new
        {
            summary = new
            {
                totalSubscriptions,
                activeSubscriptions,
                trialSubscriptions,
                cancelledSubscriptions,
                expiredSubscriptions,
                period = new { start = startDate, end = endDate }
            },
            subscriptionsByPackage,
            subscriptionsByStatus,
            recentSubscriptions
        };

        var metrics = new Dictionary<string, object>
        {
            ["ToplamAbonelik"] = totalSubscriptions,
            ["AktifAbonelik"] = activeSubscriptions,
            ["DenemeAbonelik"] = trialSubscriptions,
            ["İptalEdilenAbonelik"] = cancelledSubscriptions
        };

        return (data, metrics, totalSubscriptions);
    }

    private async Task<(object Data, Dictionary<string, object> Metrics, int RecordCount)> GenerateRevenueReportAsync(
        DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var subscriptions = await _masterContext.Subscriptions
            .Include(s => s.Package)
            .Where(s => s.Status == SubscriptionStatus.Aktif)
            .ToListAsync(cancellationToken);

        var totalRevenue = subscriptions.Sum(s => s.Price?.Amount ?? 0);

        var monthlyRevenue = subscriptions
            .Where(s => s.BillingCycle == BillingCycle.Aylik)
            .Sum(s => s.Price?.Amount ?? 0);

        monthlyRevenue += subscriptions
            .Where(s => s.BillingCycle == BillingCycle.Yillik)
            .Sum(s => (s.Price?.Amount ?? 0) / 12);

        var yearlyRevenue = monthlyRevenue * 12;

        var revenueByPackage = subscriptions
            .Where(s => s.Package != null)
            .GroupBy(s => s.Package!.Name)
            .Select(g => new
            {
                Package = g.Key,
                Revenue = g.Sum(s => s.Price?.Amount ?? 0),
                SubscriptionCount = g.Count()
            })
            .OrderByDescending(x => x.Revenue)
            .ToList();

        var revenueByBillingCycle = subscriptions
            .GroupBy(s => s.BillingCycle)
            .Select(g => new
            {
                BillingCycle = g.Key switch
                {
                    BillingCycle.Aylik => "Aylık",
                    BillingCycle.UcAylik => "3 Aylık",
                    BillingCycle.AltiAylik => "6 Aylık",
                    BillingCycle.Yillik => "Yıllık",
                    _ => g.Key.ToString()
                },
                Revenue = g.Sum(s => s.Price?.Amount ?? 0),
                Count = g.Count()
            })
            .ToList();

        // Monthly breakdown for the period
        var monthlyBreakdown = new List<object>();
        var current = new DateTime(startDate.Year, startDate.Month, 1);
        while (current <= endDate)
        {
            var monthStart = current;
            var monthEnd = current.AddMonths(1);

            var monthSubscriptions = subscriptions
                .Where(s => s.StartDate <= monthEnd && (s.CancelledAt == null || s.CancelledAt >= monthStart))
                .ToList();

            monthlyBreakdown.Add(new
            {
                Month = current.ToString("MMM yyyy"),
                Revenue = monthSubscriptions.Sum(s => s.Price?.Amount ?? 0),
                SubscriptionCount = monthSubscriptions.Count
            });

            current = monthEnd;
        }

        var data = new
        {
            summary = new
            {
                totalRevenue,
                monthlyRevenue,
                yearlyRevenue,
                averageRevenuePerSubscription = subscriptions.Any() ? totalRevenue / subscriptions.Count : 0,
                period = new { start = startDate, end = endDate }
            },
            revenueByPackage,
            revenueByBillingCycle,
            monthlyBreakdown
        };

        var metrics = new Dictionary<string, object>
        {
            ["ToplamGelir"] = totalRevenue,
            ["AylıkGelir"] = monthlyRevenue,
            ["YıllıkGelir"] = yearlyRevenue,
            ["AktifAbonelikSayısı"] = subscriptions.Count
        };

        return (data, metrics, subscriptions.Count);
    }

    private async Task<(object Data, Dictionary<string, object> Metrics, int RecordCount)> GenerateUserActivityReportAsync(
        DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var users = await _masterContext.MasterUsers.ToListAsync(cancellationToken);

        var totalUsers = users.Count;
        var activeUsers = users.Count(u => u.LastLoginAt >= startDate);
        var newUsers = users.Count(u => u.CreatedAt >= startDate && u.CreatedAt <= endDate);
        var verifiedUsers = users.Count(u => u.IsEmailVerified);
        var twoFactorUsers = users.Count(u => u.TwoFactorEnabled);

        var usersByType = users
            .GroupBy(u => u.UserType)
            .Select(g => new
            {
                Type = g.Key switch
                {
                    UserType.SistemYoneticisi => "Sistem Yöneticisi",
                    UserType.FirmaYoneticisi => "Firma Yöneticisi",
                    UserType.Personel => "Personel",
                    UserType.Destek => "Destek",
                    UserType.Misafir => "Misafir",
                    _ => g.Key.ToString()
                },
                Count = g.Count()
            })
            .ToList();

        var loginActivity = await _masterContext.SecurityAuditLogs
            .Where(l => l.Timestamp >= startDate && l.Timestamp <= endDate)
            .GroupBy(l => l.Event)
            .Select(g => new { Event = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var recentUsers = users
            .OrderByDescending(u => u.CreatedAt)
            .Take(20)
            .Select(u => new
            {
                u.Id,
                u.Username,
                Email = u.Email.Value,
                FullName = u.GetFullName(),
                UserType = u.UserType.ToString(),
                u.IsActive,
                u.IsEmailVerified,
                u.TwoFactorEnabled,
                u.CreatedAt,
                u.LastLoginAt
            })
            .ToList();

        var data = new
        {
            summary = new
            {
                totalUsers,
                activeUsers,
                newUsers,
                verifiedUsers,
                twoFactorUsers,
                period = new { start = startDate, end = endDate }
            },
            usersByType,
            loginActivity,
            recentUsers
        };

        var metrics = new Dictionary<string, object>
        {
            ["ToplamKullanıcı"] = totalUsers,
            ["AktifKullanıcı"] = activeUsers,
            ["YeniKullanıcı"] = newUsers,
            ["DoğrulanmışKullanıcı"] = verifiedUsers
        };

        return (data, metrics, totalUsers);
    }

    private async Task<(object Data, Dictionary<string, object> Metrics, int RecordCount)> GenerateSecurityReportAsync(
        DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var securityLogs = await _masterContext.SecurityAuditLogs
            .Where(l => l.Timestamp >= startDate && l.Timestamp <= endDate)
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync(cancellationToken);

        var totalEvents = securityLogs.Count;
        var loginAttempts = securityLogs.Count(l => l.Event.Contains("login", StringComparison.OrdinalIgnoreCase));
        var failedLogins = securityLogs.Count(l => l.Event.Contains("failed", StringComparison.OrdinalIgnoreCase));
        var passwordChanges = securityLogs.Count(l => l.Event.Contains("password", StringComparison.OrdinalIgnoreCase));

        var eventsByType = securityLogs
            .GroupBy(l => l.Event)
            .Select(g => new { Event = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToList();

        var eventsByDay = securityLogs
            .GroupBy(l => l.Timestamp.Date)
            .Select(g => new { Date = g.Key.ToString("yyyy-MM-dd"), Count = g.Count() })
            .OrderBy(x => x.Date)
            .ToList();

        var recentSecurityEvents = securityLogs
            .Take(50)
            .Select(l => new
            {
                l.Id,
                l.Event,
                l.Metadata,
                l.IpAddress,
                l.UserAgent,
                l.Timestamp,
                l.RiskScore,
                l.Blocked
            })
            .ToList();

        // Get users with failed login attempts
        var usersWithFailedLogins = await _masterContext.MasterUsers
            .Where(u => u.FailedLoginAttempts > 0)
            .Select(u => new
            {
                u.Id,
                u.Username,
                Email = u.Email.Value,
                u.FailedLoginAttempts,
                u.LockoutEndAt
            })
            .ToListAsync(cancellationToken);

        var data = new
        {
            summary = new
            {
                totalEvents,
                loginAttempts,
                failedLogins,
                passwordChanges,
                period = new { start = startDate, end = endDate }
            },
            eventsByType,
            eventsByDay,
            recentSecurityEvents,
            usersWithFailedLogins
        };

        var metrics = new Dictionary<string, object>
        {
            ["ToplamOlay"] = totalEvents,
            ["GirişDenemesi"] = loginAttempts,
            ["BaşarısızGiriş"] = failedLogins,
            ["ŞifreDeğişikliği"] = passwordChanges
        };

        return (data, metrics, totalEvents);
    }

    private (object Data, Dictionary<string, object> Metrics, int RecordCount) GenerateSystemHealthReport()
    {
        var process = System.Diagnostics.Process.GetCurrentProcess();

        // Memory metrics
        var totalMemory = GC.GetGCMemoryInfo().TotalAvailableMemoryBytes;
        var usedMemory = process.WorkingSet64;
        var memoryUsagePercent = totalMemory > 0 ? (double)usedMemory / totalMemory * 100 : 0;

        // Disk metrics
        var driveInfo = new DriveInfo(Path.GetPathRoot(AppDomain.CurrentDomain.BaseDirectory) ?? "C:\\");
        var diskUsagePercent = (double)(driveInfo.TotalSize - driveInfo.AvailableFreeSpace) / driveInfo.TotalSize * 100;

        var uptime = DateTime.UtcNow - process.StartTime.ToUniversalTime();

        var data = new
        {
            systemStatus = "Sağlıklı",
            timestamp = DateTime.UtcNow,
            memory = new
            {
                total = FormatBytes(totalMemory),
                used = FormatBytes(usedMemory),
                available = FormatBytes(totalMemory - usedMemory),
                usagePercent = Math.Round(memoryUsagePercent, 2)
            },
            disk = new
            {
                total = FormatBytes(driveInfo.TotalSize),
                used = FormatBytes(driveInfo.TotalSize - driveInfo.AvailableFreeSpace),
                free = FormatBytes(driveInfo.AvailableFreeSpace),
                usagePercent = Math.Round(diskUsagePercent, 2)
            },
            process = new
            {
                uptime = $"{uptime.Days}g {uptime.Hours}s {uptime.Minutes}d",
                threads = process.Threads.Count,
                handles = process.HandleCount
            },
            services = new[]
            {
                new { name = "Database", status = "Sağlıklı" },
                new { name = "Cache", status = "Sağlıklı" },
                new { name = "MessageQueue", status = "Sağlıklı" }
            }
        };

        var metrics = new Dictionary<string, object>
        {
            ["Durum"] = "Sağlıklı",
            ["BellekKullanımı"] = $"{Math.Round(memoryUsagePercent, 1)}%",
            ["DiskKullanımı"] = $"{Math.Round(diskUsagePercent, 1)}%",
            ["ÇalışmaSüresi"] = $"{uptime.Days}g {uptime.Hours}s"
        };

        return (data, metrics, 1);
    }

    private async Task<(object Data, Dictionary<string, object> Metrics, int RecordCount)> GenerateModuleUsageReportAsync(
        CancellationToken cancellationToken)
    {
        var subscriptions = await _masterContext.Subscriptions
            .Include(s => s.Modules)
            .Where(s => s.Status == SubscriptionStatus.Aktif)
            .ToListAsync(cancellationToken);

        var moduleUsage = subscriptions
            .SelectMany(s => s.Modules)
            .GroupBy(m => m.ModuleName)
            .Select(g => new
            {
                Module = g.Key,
                ActiveSubscriptions = g.Select(m => m.SubscriptionId).Distinct().Count(),
                TotalCount = g.Count()
            })
            .OrderByDescending(x => x.ActiveSubscriptions)
            .ToList();

        var moduleDefinitions = await _masterContext.ModuleDefinitions
            .Where(m => m.IsActive)
            .Select(m => new
            {
                m.Code,
                m.Name,
                m.Description,
                m.IsActive
            })
            .ToListAsync(cancellationToken);

        var totalActiveSubscriptions = subscriptions.Count;
        var totalModulesInUse = moduleUsage.Count;
        var averageModulesPerSubscription = subscriptions.Any()
            ? (double)subscriptions.Sum(s => s.Modules.Count) / subscriptions.Count
            : 0;

        var data = new
        {
            summary = new
            {
                totalActiveSubscriptions,
                totalModulesInUse,
                averageModulesPerSubscription = Math.Round(averageModulesPerSubscription, 2),
                availableModules = moduleDefinitions.Count
            },
            moduleUsage,
            availableModules = moduleDefinitions
        };

        var metrics = new Dictionary<string, object>
        {
            ["AktifAbonelik"] = totalActiveSubscriptions,
            ["KullanılanModül"] = totalModulesInUse,
            ["OrtModülSayısı"] = Math.Round(averageModulesPerSubscription, 2)
        };

        return (data, metrics, totalModulesInUse);
    }

    #endregion

    #region Helper Methods

    private static string FormatBytes(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        int order = 0;
        double size = bytes;
        while (size >= 1024 && order < sizes.Length - 1)
        {
            order++;
            size /= 1024;
        }
        return $"{size:0.##} {sizes[order]}";
    }

    private static long EstimateFileSize(object? data)
    {
        if (data == null) return 0;
        try
        {
            var json = JsonSerializer.Serialize(data);
            return Encoding.UTF8.GetByteCount(json);
        }
        catch
        {
            return 0;
        }
    }

    #endregion
}
