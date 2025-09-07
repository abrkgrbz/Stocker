using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Services;

public class DashboardService : IDashboardRepository
{
    private readonly TenantDbContext _tenantContext;
    private readonly MasterDbContext _masterContext;

    public DashboardService(TenantDbContext tenantContext, MasterDbContext masterContext)
    {
        _tenantContext = tenantContext;
        _masterContext = masterContext;
    }

    // Tenant Dashboard Methods
    public async Task<DashboardStatsDto> GetTenantDashboardStatsAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var stats = new DashboardStatsDto();

        // Get invoice statistics
        var invoices = await _tenantContext.Invoices
            .Where(i => i.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;
        var lastMonth = DateTime.UtcNow.AddMonths(-1);

        // Calculate revenue
        stats.TotalRevenue = invoices.Sum(i => i.TotalAmount);
        var lastMonthRevenue = invoices
            .Where(i => i.CreatedDate.Month == lastMonth.Month && i.CreatedDate.Year == lastMonth.Year)
            .Sum(i => i.TotalAmount);
        
        stats.RevenueGrowth = lastMonthRevenue > 0 
            ? ((double)(stats.TotalRevenue - lastMonthRevenue) / (double)lastMonthRevenue) * 100 
            : 0;

        // Get order count
        stats.TotalOrders = invoices.Count;
        var lastMonthOrders = invoices.Count(i => i.CreatedDate.Month == lastMonth.Month && i.CreatedDate.Year == lastMonth.Year);
        stats.OrderGrowth = lastMonthOrders > 0 
            ? ((double)(stats.TotalOrders - lastMonthOrders) / lastMonthOrders) * 100 
            : 0;

        // Get customer count (from TenantUsers for now)
        stats.TotalCustomers = await _tenantContext.TenantUsers
            .Where(u => u.TenantId == tenantId)
            .CountAsync(cancellationToken);
        
        // Product count - will be updated when inventory module is integrated
        stats.TotalProducts = 0;

        // Monthly revenue
        var monthlyRevenue = invoices
            .GroupBy(i => new { i.CreatedDate.Year, i.CreatedDate.Month })
            .Select(g => new MonthlyRevenueDto
            {
                Month = GetMonthName(g.Key.Month),
                Revenue = g.Sum(i => i.TotalAmount)
            })
            .OrderBy(m => m.Month)
            .Take(12)
            .ToList();

        stats.MonthlyRevenue = monthlyRevenue.Any() ? monthlyRevenue : GetMockMonthlyRevenue();

        // Top products - will be updated when inventory module is integrated
        stats.TopProducts = GetMockTopProducts();

        // Recent orders
        stats.RecentOrders = invoices
            .OrderByDescending(i => i.CreatedDate)
            .Take(5)
            .Select(i => new RecentOrderDto
            {
                Id = i.Id,
                OrderNumber = i.InvoiceNumber,
                Customer = i.CustomerName ?? "N/A",
                Amount = i.TotalAmount,
                Status = i.Status?.ToString() ?? "Pending"
            })
            .ToList();

        return stats;
    }

    public async Task<List<ActivityDto>> GetRecentActivitiesAsync(Guid tenantId, int count = 10, CancellationToken cancellationToken = default)
    {
        var activities = await _tenantContext.AuditLogs
            .Where(a => a.TenantId == tenantId)
            .OrderByDescending(a => a.CreatedDate)
            .Take(count)
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                Type = a.Action ?? "unknown",
                Description = a.Details ?? "No description",
                User = a.UserName ?? "System",
                Timestamp = a.CreatedDate,
                Icon = GetActivityIcon(a.Action),
                Color = GetActivityColor(a.Action)
            })
            .ToListAsync(cancellationToken);

        return activities;
    }

    public async Task<List<NotificationDto>> GetNotificationsAsync(Guid tenantId, string userId, CancellationToken cancellationToken = default)
    {
        // For now, generate notifications from audit logs
        var notifications = await _tenantContext.AuditLogs
            .Where(a => a.TenantId == tenantId)
            .OrderByDescending(a => a.CreatedDate)
            .Take(20)
            .Select(a => new NotificationDto
            {
                Id = a.Id,
                Title = GetNotificationTitle(a.Action),
                Message = a.Details ?? "System notification",
                Type = GetNotificationType(a.Action),
                IsRead = false,
                CreatedAt = a.CreatedDate
            })
            .ToListAsync(cancellationToken);

        return notifications;
    }

    public async Task<RevenueChartDto> GetRevenueChartDataAsync(Guid tenantId, string period, CancellationToken cancellationToken = default)
    {
        var chart = new RevenueChartDto
        {
            Period = period,
            Labels = new List<string>(),
            Data = new List<decimal>(),
            Comparison = new List<decimal>()
        };

        var invoices = await _tenantContext.Invoices
            .Where(i => i.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        if (period.ToLower() == "daily")
        {
            // Last 7 days
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i);
                chart.Labels.Add(date.ToString("dd/MM"));
                
                var dayRevenue = invoices
                    .Where(inv => inv.CreatedDate.Date == date.Date)
                    .Sum(inv => inv.TotalAmount);
                chart.Data.Add(dayRevenue);

                // Previous week same day
                var compareDate = date.AddDays(-7);
                var compareDayRevenue = invoices
                    .Where(inv => inv.CreatedDate.Date == compareDate.Date)
                    .Sum(inv => inv.TotalAmount);
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
                    .Where(inv => inv.CreatedDate >= weekStart && inv.CreatedDate <= weekEnd)
                    .Sum(inv => inv.TotalAmount);
                chart.Data.Add(weekRevenue);

                // Previous month same week
                var compareWeekStart = weekStart.AddDays(-28);
                var compareWeekEnd = compareWeekStart.AddDays(6);
                var compareWeekRevenue = invoices
                    .Where(inv => inv.CreatedDate >= compareWeekStart && inv.CreatedDate <= compareWeekEnd)
                    .Sum(inv => inv.TotalAmount);
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
                    .Where(inv => inv.CreatedDate.Month == date.Month && inv.CreatedDate.Year == date.Year)
                    .Sum(inv => inv.TotalAmount);
                chart.Data.Add(monthRevenue);

                // Previous year same month
                var compareDate = date.AddYears(-1);
                var compareMonthRevenue = invoices
                    .Where(inv => inv.CreatedDate.Month == compareDate.Month && inv.CreatedDate.Year == compareDate.Year)
                    .Sum(inv => inv.TotalAmount);
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
        var summary = new DashboardSummaryDto
        {
            TotalUsers = await _tenantContext.TenantUsers.Where(u => u.TenantId == tenantId).CountAsync(cancellationToken),
            ActiveUsers = await _tenantContext.TenantUsers.Where(u => u.TenantId == tenantId && u.IsActive).CountAsync(cancellationToken),
            TotalInvoices = await _tenantContext.Invoices.Where(i => i.TenantId == tenantId).CountAsync(cancellationToken),
            PendingInvoices = await _tenantContext.Invoices.Where(i => i.TenantId == tenantId && i.Status == Domain.Tenant.Enums.InvoiceStatus.Beklemede).CountAsync(cancellationToken),
            TotalRevenue = await _tenantContext.Invoices.Where(i => i.TenantId == tenantId).SumAsync(i => i.TotalAmount, cancellationToken),
            OutstandingAmount = await _tenantContext.Invoices.Where(i => i.TenantId == tenantId && i.Status != Domain.Tenant.Enums.InvoiceStatus.Odendi).SumAsync(i => i.TotalAmount, cancellationToken)
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
            .OrderByDescending(t => t.CreatedDate)
            .Take(count)
            .Select(t => new
            {
                id = t.Id,
                name = t.Name,
                subdomain = t.Subdomain,
                plan = "Premium",
                createdAt = t.CreatedAt,
                status = t.IsActive ? "Active" : "Inactive",
                userCount = _masterContext.UserTenants.Count(ut => ut.TenantId == t.Id)
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
                tenant = _masterContext.UserTenants.Where(ut => ut.UserId == u.Id).Join(_masterContext.Tenants, ut => ut.TenantId, t => t.Id, (ut, t) => t.Name).FirstOrDefault() ?? "N/A",
                createdAt = u.CreatedAt,
                status = u.IsActive ? "Active" : "Inactive",
                role = "User" // This would come from role assignments
            })
            .ToListAsync(cancellationToken);

        return users.Cast<object>().ToList();
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