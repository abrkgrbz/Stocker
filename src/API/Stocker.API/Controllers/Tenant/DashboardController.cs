using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ApiController
{
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(ILogger<DashboardController> logger)
    {
        _logger = logger;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = new
        {
            totalRevenue = 125000,
            totalOrders = 342,
            totalCustomers = 156,
            totalProducts = 89,
            revenueGrowth = 12.5,
            orderGrowth = 8.3,
            customerGrowth = 15.2,
            productGrowth = 5.7,
            monthlyRevenue = new[]
            {
                new { month = "Ocak", revenue = 18500 },
                new { month = "Şubat", revenue = 21200 },
                new { month = "Mart", revenue = 19800 },
                new { month = "Nisan", revenue = 23400 },
                new { month = "Mayıs", revenue = 20100 },
                new { month = "Haziran", revenue = 22000 }
            },
            topProducts = new[]
            {
                new { name = "Laptop", sales = 45, revenue = 67500 },
                new { name = "Telefon", sales = 82, revenue = 41000 },
                new { name = "Tablet", sales = 33, revenue = 16500 }
            },
            recentOrders = new[]
            {
                new { id = 1, orderNumber = "ORD-2024-001", customer = "ABC Ltd.", amount = 3500, status = "Completed" },
                new { id = 2, orderNumber = "ORD-2024-002", customer = "XYZ Corp.", amount = 5200, status = "Processing" },
                new { id = 3, orderNumber = "ORD-2024-003", customer = "Tech Solutions", amount = 2800, status = "Pending" }
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = stats,
            Message = "Dashboard istatistikleri başarıyla yüklendi"
        });
    }

    [HttpGet("activities")]
    public async Task<IActionResult> GetRecentActivities()
    {
        var activities = new[]
        {
            new 
            { 
                id = 1,
                type = "order",
                title = "Yeni Sipariş",
                description = "ORD-2024-004 numaralı sipariş oluşturuldu",
                timestamp = DateTime.UtcNow.AddMinutes(-15),
                user = "Ahmet Yılmaz",
                icon = "ShoppingCart"
            },
            new
            {
                id = 2,
                type = "customer",
                title = "Yeni Müşteri",
                description = "Tech Innovations firması eklendi",
                timestamp = DateTime.UtcNow.AddMinutes(-45),
                user = "Mehmet Öz",
                icon = "UserPlus"
            },
            new
            {
                id = 3,
                type = "payment",
                title = "Ödeme Alındı",
                description = "INV-2024-0156 faturası için 5,200 TL ödeme",
                timestamp = DateTime.UtcNow.AddHours(-2),
                user = "Sistem",
                icon = "CreditCard"
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = activities,
            Message = "Son aktiviteler başarıyla yüklendi"
        });
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications()
    {
        var notifications = new[]
        {
            new
            {
                id = 1,
                type = "warning",
                title = "Düşük Stok Uyarısı",
                message = "5 ürünün stok seviyesi kritik seviyede",
                timestamp = DateTime.UtcNow.AddMinutes(-30),
                isRead = false
            },
            new
            {
                id = 2,
                type = "info",
                title = "Sistem Güncellemesi",
                message = "Yeni özellikler eklendi",
                timestamp = DateTime.UtcNow.AddHours(-3),
                isRead = true
            },
            new
            {
                id = 3,
                type = "success",
                title = "Hedef Tamamlandı",
                message = "Aylık satış hedefi %105 oranında gerçekleşti",
                timestamp = DateTime.UtcNow.AddDays(-1),
                isRead = false
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = notifications,
            Message = "Bildirimler başarıyla yüklendi"
        });
    }

    [HttpGet("charts/revenue")]
    public async Task<IActionResult> GetRevenueChart([FromQuery] string period = "monthly")
    {
        var chartData = new
        {
            labels = new[] { "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran" },
            datasets = new[]
            {
                new
                {
                    label = "Gelir",
                    data = new[] { 18500, 21200, 19800, 23400, 20100, 22000 },
                    borderColor = "#1890ff",
                    backgroundColor = "rgba(24, 144, 255, 0.1)"
                },
                new
                {
                    label = "Gider",
                    data = new[] { 12000, 13500, 14200, 15000, 13800, 14500 },
                    borderColor = "#ff4d4f",
                    backgroundColor = "rgba(255, 77, 79, 0.1)"
                }
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = chartData,
            Message = "Grafik verisi başarıyla yüklendi"
        });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetDashboardSummary()
    {
        var summary = new
        {
            company = new
            {
                name = "ABC Teknoloji Ltd.",
                logo = "/api/tenant/company/logo",
                industry = "Teknoloji",
                employeeCount = 45,
                foundedYear = 2020
            },
            subscription = new
            {
                plan = "Professional",
                status = "Active",
                expiryDate = DateTime.UtcNow.AddDays(45),
                usedStorage = 2.3, // GB
                totalStorage = 10, // GB
                usedUsers = 12,
                totalUsers = 25
            },
            modules = new[]
            {
                new { name = "CRM", status = "Active", usagePercentage = 78 },
                new { name = "Inventory", status = "Active", usagePercentage = 92 },
                new { name = "Finance", status = "Active", usagePercentage = 65 },
                new { name = "HR", status = "Inactive", usagePercentage = 0 }
            },
            quickStats = new
            {
                todayRevenue = 8500,
                todayOrders = 12,
                pendingTasks = 7,
                unreadMessages = 3
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = summary,
            Message = "Dashboard özeti başarıyla yüklendi"
        });
    }
}