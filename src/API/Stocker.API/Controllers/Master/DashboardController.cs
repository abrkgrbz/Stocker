using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Persistence.Contexts;

namespace Stocker.API.Controllers.Master;

[ApiController]
[Route("api/master/dashboard")]
[Authorize(Policy = "RequireMasterAccess")]
public class DashboardController : ControllerBase
{
    private readonly MasterDbContext _context;
    private readonly IMediator _mediator;

    public DashboardController(MasterDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalTenants = await _context.Tenants.CountAsync();
        var activeTenants = await _context.Tenants.CountAsync(t => t.IsActive);
        var totalUsers = await _context.MasterUsers.CountAsync();
        var activeUsers = await _context.MasterUsers.CountAsync(u => u.IsActive);
        
        // Calculate revenue (mock data for now)
        var totalRevenue = await _context.Subscriptions
            .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif)
            .SumAsync(s => s.Price.Amount);

        // Get package distribution
        var packageDistribution = await _context.Subscriptions
            .Where(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif)
            .GroupBy(s => s.Package.Name)
            .Select(g => new { Package = g.Key, Count = g.Count() })
            .ToListAsync();

        // Calculate growth rates (mock for now)
        var lastMonthTenants = totalTenants - 5; // Mock data
        var tenantGrowth = lastMonthTenants > 0 ? ((totalTenants - lastMonthTenants) / (double)lastMonthTenants) * 100 : 0;

        var lastMonthUsers = totalUsers - 10; // Mock data
        var userGrowth = lastMonthUsers > 0 ? ((totalUsers - lastMonthUsers) / (double)lastMonthUsers) * 100 : 0;

        var lastMonthRevenue = totalRevenue * 0.9m; // Mock data
        var revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        var stats = new
        {
            success = true,
            data = new
            {
                totalTenants,
                activeTenants,
                totalUsers,
                activeUsers,
                totalRevenue,
                packageDistribution,
                growth = new
                {
                    tenants = Math.Round(tenantGrowth, 1),
                    users = Math.Round(userGrowth, 1),
                    revenue = Math.Round((double)revenueGrowth, 1)
                },
                systemHealth = new
                {
                    uptime = 99.9,
                    cpu = 45,
                    memory = 62,
                    disk = 38,
                    activeConnections = 156
                }
            }
        };

        return Ok(stats);
    }

    [HttpGet("recent-activities")]
    public async Task<IActionResult> GetRecentActivities()
    {
        var activities = new List<object>();

        // Get recent tenants
        var recentTenants = await _context.Tenants
            .OrderByDescending(t => t.CreatedAt)
            .Take(3)
            .Select(t => new
            {
                type = "tenant",
                title = "Yeni Tenant",
                description = $"{t.Name} sisteme katıldı",
                time = t.CreatedAt,
                status = "success"
            })
            .ToListAsync();

        activities.AddRange(recentTenants);

        // Get recent users
        var recentUsers = await _context.MasterUsers
            .OrderByDescending(u => u.CreatedAt)
            .Take(2)
            .Select(u => new
            {
                type = "user",
                title = "Yeni Kullanıcı",
                description = $"{u.FirstName} {u.LastName} kayıt oldu",
                time = u.CreatedAt,
                status = "info"
            })
            .ToListAsync();

        activities.AddRange(recentUsers);

        // Sort by time and take top 10
        var sortedActivities = activities
            .OrderByDescending(a => ((dynamic)a).time)
            .Take(10)
            .Select(a => new
            {
                ((dynamic)a).type,
                ((dynamic)a).title,
                ((dynamic)a).description,
                time = GetRelativeTime(((dynamic)a).time),
                ((dynamic)a).status
            });

        return Ok(new { success = true, data = sortedActivities });
    }

    [HttpGet("revenue-chart")]
    public async Task<IActionResult> GetRevenueChart([FromQuery] string period = "month")
    {
        var data = new List<object>();

        if (period == "month")
        {
            // Last 30 days
            for (int i = 29; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i);
                data.Add(new
                {
                    date = date.ToString("dd MMM"),
                    revenue = Random.Shared.Next(8000, 15000),
                    tenants = Random.Shared.Next(1, 5)
                });
            }
        }
        else if (period == "year")
        {
            // Last 12 months
            var months = new[] { "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara" };
            for (int i = 0; i < 12; i++)
            {
                data.Add(new
                {
                    date = months[i],
                    revenue = Random.Shared.Next(80000, 150000),
                    tenants = Random.Shared.Next(10, 50)
                });
            }
        }

        return Ok(new { success = true, data });
    }

    [HttpGet("top-tenants")]
    public async Task<IActionResult> GetTopTenants()
    {
        var tenants = await _context.Tenants
            .Where(t => t.IsActive)
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .Select(t => new
            {
                id = t.Id,
                name = t.Name,
                plan = t.Subscriptions.FirstOrDefault() != null ? t.Subscriptions.First().Package.Name : "Free",
                users = 0, // Will be calculated later when tenant user access is properly implemented
                revenue = t.Subscriptions.Sum(s => s.Price.Amount),
                growth = Random.Shared.Next(-10, 30),
                status = t.IsActive ? "active" : "inactive",
                createdAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = tenants });
    }

    private string GetRelativeTime(DateTime dateTime)
    {
        var timeSpan = DateTime.UtcNow - dateTime;

        if (timeSpan.TotalMinutes < 1)
            return "Az önce";
        if (timeSpan.TotalMinutes < 60)
            return $"{(int)timeSpan.TotalMinutes} dakika önce";
        if (timeSpan.TotalHours < 24)
            return $"{(int)timeSpan.TotalHours} saat önce";
        if (timeSpan.TotalDays < 30)
            return $"{(int)timeSpan.TotalDays} gün önce";
        if (timeSpan.TotalDays < 365)
            return $"{(int)(timeSpan.TotalDays / 30)} ay önce";

        return $"{(int)(timeSpan.TotalDays / 365)} yıl önce";
    }
}