using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly TenantDbContext _tenantContext;
    private readonly MasterDbContext _masterContext;

    public DashboardRepository(TenantDbContext tenantContext, MasterDbContext masterContext)
    {
        _tenantContext = tenantContext;
        _masterContext = masterContext;
    }

    // Tenant Dashboard Methods
    public async Task<DashboardStatsDto> GetTenantDashboardStatsAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        if (_tenantContext == null)
        {
            throw new InvalidOperationException("Tenant context is not available. Make sure the request has a valid tenant context.");
        }

        var stats = new DashboardStatsDto();

        // Get invoice statistics
        // Get invoice statistics - no TenantId filter needed (database-per-tenant)
        var invoices = await _tenantContext.Invoices
            .ToListAsync(cancellationToken);

        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;
        var lastMonth = DateTime.UtcNow.AddMonths(-1);

        // Calculate revenue
        stats.TotalRevenue = invoices.Sum(i => i.TotalAmount.Amount);
        var lastMonthRevenue = invoices
            .Where(i => i.InvoiceDate.Month == lastMonth.Month && i.InvoiceDate.Year == lastMonth.Year)
            .Sum(i => i.TotalAmount.Amount);
        
        stats.RevenueGrowth = lastMonthRevenue > 0 
            ? ((double)(stats.TotalRevenue - lastMonthRevenue) / (double)lastMonthRevenue) * 100 
            : 0;

        // Get order count
        stats.TotalOrders = invoices.Count;
        var lastMonthOrders = invoices.Count(i => i.InvoiceDate.Month == lastMonth.Month && i.InvoiceDate.Year == lastMonth.Year);
        stats.OrderGrowth = lastMonthOrders > 0 
            ? ((double)(stats.TotalOrders - lastMonthOrders) / lastMonthOrders) * 100 
            : 0;

        // Get customer count (from TenantUsers for now) - no TenantId filter needed
        stats.TotalCustomers = await _tenantContext.TenantUsers
            .CountAsync(cancellationToken);
        
        // Product count - will be updated when inventory module is integrated
        stats.TotalProducts = 0;

        // Monthly revenue
        var monthlyRevenue = invoices
            .GroupBy(i => new { i.InvoiceDate.Year, i.InvoiceDate.Month })
            .Select(g => new MonthlyRevenueDto
            {
                Month = GetMonthName(g.Key.Month),
                Revenue = g.Sum(i => i.TotalAmount.Amount)
            })
            .OrderBy(m => m.Month)
            .Take(12)
            .ToList();

        stats.MonthlyRevenue = monthlyRevenue.Any() ? monthlyRevenue : GetMockMonthlyRevenue();

        // Top products - will be updated when inventory module is integrated
        stats.TopProducts = GetMockTopProducts();

        // Recent orders
        stats.RecentOrders = invoices
            .OrderByDescending(i => i.InvoiceDate)
            .Take(5)
            .Select(i => new RecentOrderDto
            {
                Id = i.Id,
                OrderNumber = i.InvoiceNumber,
                Customer = "Customer #" + i.CustomerId.ToString().Substring(0, 8),
                Amount = i.TotalAmount.Amount,
                Status = i.Status.ToString()
            })
            .ToList();

        return stats;
    }

    public async Task<List<ActivityDto>> GetRecentActivitiesAsync(Guid tenantId, int count = 10, CancellationToken cancellationToken = default)
    {
        if (_tenantContext == null)
        {
            throw new InvalidOperationException("Tenant context is not available. Make sure the request has a valid tenant context.");
        }

        // No TenantId filter needed (database-per-tenant)
        var activities = await _tenantContext.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(count)
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                Type = a.Action ?? "unknown",
                Description = a.AdditionalData ?? "No description",
                User = a.UserName ?? "System",
                Timestamp = a.Timestamp,
                Icon = GetActivityIcon(a.Action),
                // Color = GetActivityColor(a.Action) // Removed as ActivityDto doesn't have Color
            })
            .ToListAsync(cancellationToken);

        return activities;
    }

    public async Task<List<NotificationDto>> GetNotificationsAsync(Guid tenantId, string userId, CancellationToken cancellationToken = default)
    {
        if (_tenantContext == null)
        {
            throw new InvalidOperationException("Tenant context is not available. Make sure the request has a valid tenant context.");
        }

        // For now, generate notifications from audit logs - no TenantId filter needed
        var notifications = await _tenantContext.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(20)
            .Select(a => new NotificationDto
            {
                Id = a.Id,
                Title = GetNotificationTitle(a.Action),
                Message = a.AdditionalData ?? "System notification",
                Type = GetNotificationType(a.Action),
                IsRead = false,
                Timestamp = a.Timestamp
            })
            .ToListAsync(cancellationToken);

        return notifications;
    }

    public async Task<RevenueChartDto> GetRevenueChartDataAsync(Guid tenantId, string period, CancellationToken cancellationToken = default)
    {
        if (_tenantContext == null)
        {
            throw new InvalidOperationException("Tenant context is not available. Make sure the request has a valid tenant context.");
        }

        var chart = new RevenueChartDto
        {
            Period = period,
            Labels = new List<string>(),
            Data = new List<decimal>(),
            Comparison = new List<decimal>()
        };

        // Get invoice statistics - no TenantId filter needed (database-per-tenant)
        var invoices = await _tenantContext.Invoices
            .ToListAsync(cancellationToken);

        if (period.ToLower() == "daily")
        {
            // Last 7 days
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i);
                chart.Labels.Add(date.ToString("dd/MM"));
                
                var dayRevenue = invoices
                    .Where(inv => inv.InvoiceDate.Date == date.Date)
                    .Sum(inv => inv.TotalAmount.Amount);
                chart.Data.Add(dayRevenue);

                // Previous week same day
                var compareDate = date.AddDays(-7);
                var compareDayRevenue = invoices
                    .Where(inv => inv.InvoiceDate.Date == compareDate.Date)
                    .Sum(inv => inv.TotalAmount.Amount);
                chart.Comparison.Add(compareDayRevenue);
            }
        }
        else if (period.ToLower() == "weekly")
        {
            // Last 4 weeks
            for (int i = 3; i >= 0; i--)
            {
                var weekStart = DateTime.UtcNow.AddDays(-i * 7).StartOfWeek();
                var weekEnd = weekStart.AddDays(6);
                chart.Labels.Add($"Hafta {4 - i}");
                
                var weekRevenue = invoices
                    .Where(inv => inv.InvoiceDate >= weekStart && inv.InvoiceDate <= weekEnd)
                    .Sum(inv => inv.TotalAmount.Amount);
                chart.Data.Add(weekRevenue);

                // Previous month same week
                var compareWeekStart = weekStart.AddDays(-28);
                var compareWeekEnd = compareWeekStart.AddDays(6);
                var compareWeekRevenue = invoices
                    .Where(inv => inv.InvoiceDate >= compareWeekStart && inv.InvoiceDate <= compareWeekEnd)
                    .Sum(inv => inv.TotalAmount.Amount);
                chart.Comparison.Add(compareWeekRevenue);
            }
        }
        else // monthly
        {
            // Last 12 months
            for (int i = 11; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddMonths(-i);
                chart.Labels.Add(GetMonthName(date.Month));
                
                var monthRevenue = invoices
                    .Where(inv => inv.InvoiceDate.Month == date.Month && inv.InvoiceDate.Year == date.Year)
                    .Sum(inv => inv.TotalAmount.Amount);
                chart.Data.Add(monthRevenue);

                // Previous year same month
                var compareDate = date.AddYears(-1);
                var compareMonthRevenue = invoices
                    .Where(inv => inv.InvoiceDate.Month == compareDate.Month && inv.InvoiceDate.Year == compareDate.Year)
                    .Sum(inv => inv.TotalAmount.Amount);
                chart.Comparison.Add(compareMonthRevenue);
            }
        }

        // Fill with mock data if no real data
        if (!chart.Data.Any(d => d > 0))
        {
            var random = new Random();
            for (int i = 0; i < chart.Labels.Count; i++)
            {
                chart.Data[i] = random.Next(10000, 50000);
                chart.Comparison[i] = random.Next(8000, 45000);
            }
        }

        return chart;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        if (_tenantContext == null)
        {
            throw new InvalidOperationException("Tenant context is not available. Make sure the request has a valid tenant context.");
        }

        var summary = new DashboardSummaryDto
        {
            // No TenantId filters needed (database-per-tenant)
            TotalUsers = await _tenantContext.TenantUsers.CountAsync(cancellationToken),
            ActiveUsers = await _tenantContext.TenantUsers.Where(u => u.Status == Domain.Tenant.Enums.TenantUserStatus.Active).CountAsync(cancellationToken),
            TotalInvoices = await _tenantContext.Invoices.CountAsync(cancellationToken),
            PendingInvoices = await _tenantContext.Invoices.Where(i => i.Status == Domain.Tenant.Enums.InvoiceStatus.Draft).CountAsync(cancellationToken),
            TotalRevenue = await _tenantContext.Invoices.SumAsync(i => i.TotalAmount.Amount, cancellationToken),
            OutstandingAmount = await _tenantContext.Invoices.Where(i => i.Status != Domain.Tenant.Enums.InvoiceStatus.Paid).SumAsync(i => i.TotalAmount.Amount, cancellationToken)
        };

        return summary;
    }

    // Master Dashboard Methods
    public async Task<object> GetMasterDashboardStatsAsync(CancellationToken cancellationToken = default)
    {
        var totalTenants = await _masterContext.Tenants.CountAsync(cancellationToken);
        var activeTenants = await _masterContext.Tenants.Where(t => t.IsActive).CountAsync(cancellationToken);
        var totalUsers = await _masterContext.MasterUsers.CountAsync(cancellationToken);
        var activeUsers = await _masterContext.MasterUsers.Where(u => u.IsActive).CountAsync(cancellationToken);

        // Calculate growth (mock for now)
        var lastMonthTenants = Math.Max(totalTenants - 5, 0);
        var tenantGrowth = lastMonthTenants > 0 ? ((double)(totalTenants - lastMonthTenants) / lastMonthTenants) * 100 : 0;

        var lastMonthUsers = Math.Max(totalUsers - 10, 0);
        var userGrowth = lastMonthUsers > 0 ? ((double)(totalUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

        // Revenue calculation would come from subscription/payment module
        var totalRevenue = totalTenants * 1500m; // Mock: $1500 per tenant
        var lastMonthRevenue = lastMonthTenants * 1500m;
        var revenueGrowth = lastMonthRevenue > 0 ? ((double)(totalRevenue - lastMonthRevenue) / (double)lastMonthRevenue) * 100 : 0;

        return new
        {
            totalTenants,
            activeTenants,
            totalUsers,
            activeUsers,
            totalRevenue,
            monthlyRecurringRevenue = totalRevenue,
            tenantGrowth = Math.Round(tenantGrowth, 1),
            userGrowth = Math.Round(userGrowth, 1),
            revenueGrowth = Math.Round(revenueGrowth, 1),
            systemHealth = 98.5,
            averageResponseTime = 125,
            activeSubscriptions = activeTenants
        };
    }

    public async Task<object> GetRevenueOverviewAsync(CancellationToken cancellationToken = default)
    {
        var tenantCount = await _masterContext.Tenants.Where(t => t.IsActive).CountAsync(cancellationToken);
        var monthlyRevenue = tenantCount * 1500m; // Mock calculation

        var data = new List<object>();
        for (int i = 11; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var variance = new Random().Next(-10, 20);
            data.Add(new
            {
                month = GetMonthName(date.Month),
                revenue = Math.Round(monthlyRevenue * (1 + (decimal)variance / 100m), 2),
                tenants = Math.Max(tenantCount - i + new Random().Next(-2, 5), 1)
            });
        }

        return new { data };
    }

    public async Task<object> GetTenantStatsAsync(CancellationToken cancellationToken = default)
    {
        var tenants = await _masterContext.Tenants.ToListAsync(cancellationToken);
        
        var planDistribution = tenants
            .GroupBy(t => "Premium")
            .Select(g => new { plan = g.Key, count = g.Count() })
            .ToList();

        var statusDistribution = tenants
            .GroupBy(t => t.IsActive ? "Active" : "Inactive")
            .Select(g => new { status = g.Key, count = g.Count() })
            .ToList();

        var monthlyGrowth = new List<object>();
        for (int i = 5; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var tenantsUntilMonth = tenants.Count(t => t.CreatedAt <= date);
            monthlyGrowth.Add(new
            {
                month = GetMonthName(date.Month),
                count = tenantsUntilMonth,
                growth = i == 5 ? 0 : new Random().Next(-5, 25)
            });
        }

        return new
        {
            planDistribution,
            statusDistribution,
            monthlyGrowth
        };
    }

    public async Task<object> GetSystemHealthAsync(CancellationToken cancellationToken = default)
    {
        // This would normally come from monitoring services
        return await Task.FromResult(new
        {
            cpuUsage = new Random().Next(20, 60),
            memoryUsage = new Random().Next(40, 70),
            diskUsage = new Random().Next(30, 50),
            activeConnections = new Random().Next(50, 200),
            requestsPerMinute = new Random().Next(100, 500),
            averageResponseTime = new Random().Next(50, 200),
            errorRate = Math.Round(new Random().NextDouble() * 2, 2),
            uptime = 99.9
        });
    }

    public async Task<List<object>> GetRecentTenantsAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        var tenants = await _masterContext.Tenants
            .OrderByDescending(t => t.CreatedAt)
            .Take(count)
            .Select(t => new
            {
                id = t.Id,
                name = t.Name,
                subdomain = t.Code,
                plan = "Premium",
                createdAt = t.CreatedAt,
                status = t.IsActive ? "Active" : "Inactive",
                userCount = 0 // UserTenants moved to Tenant domain - count should be retrieved from Tenant context
            })
            .ToListAsync(cancellationToken);

        return tenants.Cast<object>().ToList();
    }

    public async Task<List<object>> GetRecentUsersAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        var users = await _masterContext.MasterUsers
            .OrderByDescending(u => u.CreatedAt)
            .Take(count)
            .Select(u => new
            {
                id = u.Id,
                name = u.FirstName + " " + u.LastName,
                email = u.Email.Value,
                tenant = "N/A", // UserTenants moved to Tenant domain - tenant info should be retrieved from Tenant context
                createdAt = u.CreatedAt,
                status = u.IsActive ? "Active" : "Inactive",
                role = "User" // This would come from role assignments
            })
            .ToListAsync(cancellationToken);

        return users.Cast<object>().ToList();
    }

    // Master Dashboard - Summary & KPIs
    public async Task<MasterDashboardSummaryDto> GetMasterDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var totalTenants = await _masterContext.Tenants.CountAsync(cancellationToken);
        var activeTenants = await _masterContext.Tenants.Where(t => t.IsActive).CountAsync(cancellationToken);
        var totalUsers = await _masterContext.MasterUsers.CountAsync(cancellationToken);

        // Get subscription/invoice data for MRR
        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;
        var lastMonthStart = new DateTime(currentYear, currentMonth, 1).AddMonths(-1);
        var thisMonthStart = new DateTime(currentYear, currentMonth, 1);

        var monthlyRevenue = await _masterContext.Invoices
            .Where(i => i.IssueDate >= thisMonthStart && i.Status == Domain.Master.Enums.InvoiceStatus.Odendi)
            .SumAsync(i => i.TotalAmount.Amount, cancellationToken);

        var lastMonthRevenue = await _masterContext.Invoices
            .Where(i => i.IssueDate >= lastMonthStart && i.IssueDate < thisMonthStart && i.Status == Domain.Master.Enums.InvoiceStatus.Odendi)
            .SumAsync(i => i.TotalAmount.Amount, cancellationToken);

        var mrrGrowth = lastMonthRevenue > 0
            ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        var newTenantsThisMonth = await _masterContext.Tenants
            .Where(t => t.CreatedAt >= thisMonthStart)
            .CountAsync(cancellationToken);

        var pendingInvoices = await _masterContext.Invoices
            .Where(i => i.Status == Domain.Master.Enums.InvoiceStatus.Gonderildi || i.Status == Domain.Master.Enums.InvoiceStatus.Gecikti)
            .CountAsync(cancellationToken);

        var activeAlerts = await _masterContext.SystemAlerts
            .Where(a => a.IsActive)
            .CountAsync(cancellationToken);

        // System health
        var systemHealth = new SystemHealthSummaryDto(
            OverallStatus: activeAlerts > 0 ? "Warning" : "Healthy",
            CpuUsage: 0, // Will be filled by SystemMonitoringService
            MemoryUsage: 0,
            DiskUsage: 0,
            Uptime: 0
        );

        // Recent activities from audit logs
        var recentActivities = await _masterContext.SecurityAuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(5)
            .Select(a => new RecentActivitySummaryDto(
                a.Event,
                a.Metadata ?? "System event",
                a.Timestamp,
                a.TenantCode
            ))
            .ToListAsync(cancellationToken);

        return new MasterDashboardSummaryDto(
            TotalTenants: totalTenants,
            ActiveTenants: activeTenants,
            TotalUsers: totalUsers,
            MonthlyRevenue: monthlyRevenue,
            MrrGrowth: mrrGrowth,
            NewTenantsThisMonth: newTenantsThisMonth,
            PendingInvoices: pendingInvoices,
            ActiveAlerts: activeAlerts,
            SystemHealth: systemHealth,
            RecentActivities: recentActivities
        );
    }

    public async Task<MasterKeyMetricsDto> GetMasterKeyMetricsAsync(CancellationToken cancellationToken = default)
    {
        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;
        var thisMonthStart = new DateTime(currentYear, currentMonth, 1);
        var lastMonthStart = thisMonthStart.AddMonths(-1);

        // MRR calculation
        var mrr = await _masterContext.Subscriptions
            .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif)
            .SumAsync(s => s.Price.Amount, cancellationToken);

        var lastMonthMrr = mrr * 0.95m; // Approximate - could track historical MRR
        var mrrGrowthPercent = lastMonthMrr > 0 ? ((mrr - lastMonthMrr) / lastMonthMrr) * 100 : 0;

        // ARR = MRR * 12
        var arr = mrr * 12;

        // Churn rate (tenants cancelled in last 30 days / total at start)
        var cancelledSubscriptions = await _masterContext.Subscriptions
            .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.IptalEdildi
                && s.CancelledAt >= DateTime.UtcNow.AddDays(-30))
            .CountAsync(cancellationToken);
        var totalActiveSubscriptions = await _masterContext.Subscriptions
            .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif)
            .CountAsync(cancellationToken);
        var churnRate = totalActiveSubscriptions > 0
            ? (cancelledSubscriptions * 100) / totalActiveSubscriptions
            : 0;

        // ARPU (Average Revenue Per User)
        var totalUsers = await _masterContext.MasterUsers.CountAsync(cancellationToken);
        var arpu = totalUsers > 0 ? mrr / totalUsers : 0;

        // Customer Lifetime Value (simplified: ARPU / Churn Rate)
        var clv = churnRate > 0 ? (int)(arpu * 12 / (churnRate / 100m)) : (int)(arpu * 24);

        // Net Revenue Retention (assuming no expansion revenue for now)
        var nrr = 100 - churnRate;

        // Trial Conversion Rate
        var trialCount = await _masterContext.Subscriptions
            .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Deneme)
            .CountAsync(cancellationToken);
        var convertedTrials = await _masterContext.Subscriptions
            .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif
                && s.StartDate >= DateTime.UtcNow.AddDays(-90))
            .CountAsync(cancellationToken);
        var totalTrialsInPeriod = trialCount + convertedTrials;
        var trialConversionRate = totalTrialsInPeriod > 0
            ? (convertedTrials * 100) / totalTrialsInPeriod
            : 0;

        return new MasterKeyMetricsDto(
            Mrr: mrr,
            Arr: arr,
            MrrGrowthPercent: mrrGrowthPercent,
            ChurnRate: churnRate,
            AverageRevenuePerUser: arpu,
            CustomerLifetimeValue: clv,
            NetRevenueRetention: nrr,
            TrialConversionRate: trialConversionRate
        );
    }

    public async Task<List<QuickActionDto>> GetQuickActionsAsync(CancellationToken cancellationToken = default)
    {
        var quickActions = new List<QuickActionDto>();

        // Pending tenant registrations
        var pendingRegistrations = await _masterContext.TenantRegistrations
            .Where(r => r.Status == RegistrationStatus.Pending)
            .CountAsync(cancellationToken);
        if (pendingRegistrations > 0)
        {
            quickActions.Add(new QuickActionDto(
                Id: "pending-registrations",
                Title: "Bekleyen Kayıtlar",
                Description: "Onay bekleyen tenant kayıtları",
                ActionType: "review",
                Count: pendingRegistrations,
                Url: "/master/registrations?status=pending"
            ));
        }

        // Overdue invoices
        var overdueInvoices = await _masterContext.Invoices
            .Where(i => i.Status == Domain.Master.Enums.InvoiceStatus.Gecikti)
            .CountAsync(cancellationToken);
        if (overdueInvoices > 0)
        {
            quickActions.Add(new QuickActionDto(
                Id: "overdue-invoices",
                Title: "Vadesi Geçmiş Faturalar",
                Description: "Ödenmemiş vadesi geçmiş faturalar",
                ActionType: "urgent",
                Count: overdueInvoices,
                Url: "/master/invoices?status=overdue"
            ));
        }

        // Expiring subscriptions (next 30 days)
        var expiringSubscriptions = await _masterContext.Subscriptions
            .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif
                && s.CurrentPeriodEnd <= DateTime.UtcNow.AddDays(30))
            .CountAsync(cancellationToken);
        if (expiringSubscriptions > 0)
        {
            quickActions.Add(new QuickActionDto(
                Id: "expiring-subscriptions",
                Title: "Süresi Dolacak Abonelikler",
                Description: "30 gün içinde sona erecek abonelikler",
                ActionType: "warning",
                Count: expiringSubscriptions,
                Url: "/master/subscriptions?expiring=true"
            ));
        }

        // Active system alerts
        var activeAlerts = await _masterContext.SystemAlerts
            .Where(a => a.IsActive)
            .CountAsync(cancellationToken);
        if (activeAlerts > 0)
        {
            quickActions.Add(new QuickActionDto(
                Id: "system-alerts",
                Title: "Sistem Uyarıları",
                Description: "Dikkat gerektiren sistem uyarıları",
                ActionType: "alert",
                Count: activeAlerts,
                Url: "/master/monitoring/alerts"
            ));
        }

        return quickActions;
    }

    public async Task<AlertsSummaryDto> GetAlertsSummaryAsync(CancellationToken cancellationToken = default)
    {
        var activeAlerts = await _masterContext.SystemAlerts
            .Where(a => a.IsActive)
            .ToListAsync(cancellationToken);

        var totalActive = activeAlerts.Count;
        var critical = activeAlerts.Count(a => a.Severity == Domain.Master.Enums.AlertSeverity.Critical);
        var warning = activeAlerts.Count(a => a.Severity == Domain.Master.Enums.AlertSeverity.Warning);
        var info = activeAlerts.Count(a => a.Severity == Domain.Master.Enums.AlertSeverity.Info);

        var recentAlerts = activeAlerts
            .OrderByDescending(a => a.Timestamp)
            .Take(5)
            .Select(a => new AlertPreviewDto(
                Id: a.Id.ToString(),
                Title: a.Title,
                Severity: a.Severity.ToString(),
                Timestamp: a.Timestamp
            ))
            .ToList();

        return new AlertsSummaryDto(
            TotalActive: totalActive,
            Critical: critical,
            Warning: warning,
            Info: info,
            RecentAlerts: recentAlerts
        );
    }

    // Helper methods
    private string GetMonthName(int month)
    {
        var months = new[] { "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
                             "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };
        return months[month - 1];
    }

    private string GetActivityIcon(string? action)
    {
        return action?.ToLower() switch
        {
            "create" => "plus",
            "update" => "edit",
            "delete" => "trash",
            "login" => "login",
            "logout" => "logout",
            _ => "info"
        };
    }

    private string GetActivityColor(string? action)
    {
        return action?.ToLower() switch
        {
            "create" => "success",
            "update" => "warning",
            "delete" => "danger",
            "login" => "info",
            "logout" => "secondary",
            _ => "primary"
        };
    }

    private string GetNotificationTitle(string? action)
    {
        return action?.ToLower() switch
        {
            "create" => "Yeni Kayıt",
            "update" => "Güncelleme",
            "delete" => "Silme İşlemi",
            "login" => "Giriş Yapıldı",
            "logout" => "Çıkış Yapıldı",
            _ => "Sistem Bildirimi"
        };
    }

    private string GetNotificationType(string? action)
    {
        return action?.ToLower() switch
        {
            "create" => "success",
            "update" => "info",
            "delete" => "warning",
            "error" => "error",
            _ => "info"
        };
    }

    private List<MonthlyRevenueDto> GetMockMonthlyRevenue()
    {
        var random = new Random();
        return new List<MonthlyRevenueDto>
        {
            new() { Month = "Ocak", Revenue = random.Next(50000, 100000) },
            new() { Month = "Şubat", Revenue = random.Next(60000, 110000) },
            new() { Month = "Mart", Revenue = random.Next(70000, 120000) }
        };
    }

    private List<TopProductDto> GetMockTopProducts()
    {
        return new List<TopProductDto>
        {
            new() { Name = "Premium Paket", Sales = 45, Revenue = 67500 },
            new() { Name = "Standart Paket", Sales = 120, Revenue = 36000 },
            new() { Name = "Başlangıç Paketi", Sales = 80, Revenue = 8000 }
        };
    }
}

public static class DateTimeExtensions
{
    public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek = DayOfWeek.Monday)
    {
        int diff = (7 + (dt.DayOfWeek - startOfWeek)) % 7;
        return dt.AddDays(-1 * diff).Date;
    }
}