using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICurrentTenantService _currentTenantService;

    public DashboardController(
        IMediator mediator,
        ICurrentUserService currentUserService,
        ICurrentTenantService currentTenantService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
        _currentTenantService = currentTenantService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var today = DateTime.UtcNow.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);
            var sixMonthsAgo = today.AddMonths(-6);

            // Get total counts
            var totalCustomers = await _context.Customers
                .Where(c => c.TenantId == tenantId && !c.IsDeleted)
                .CountAsync();

            var totalProducts = await _context.Products
                .Where(p => p.TenantId == tenantId && !p.IsDeleted)
                .CountAsync();

            var totalOrders = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted)
                .CountAsync();

            var totalRevenue = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed")
                .SumAsync(o => o.TotalAmount);

            // Calculate growth rates (comparing with last month)
            var lastMonthCustomers = await _context.Customers
                .Where(c => c.TenantId == tenantId && !c.IsDeleted && c.CreatedDate < startOfMonth && c.CreatedDate >= startOfLastMonth)
                .CountAsync();

            var thisMonthCustomers = await _context.Customers
                .Where(c => c.TenantId == tenantId && !c.IsDeleted && c.CreatedDate >= startOfMonth)
                .CountAsync();

            var customerGrowth = lastMonthCustomers > 0 
                ? Math.Round(((double)(thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100, 1)
                : 0;

            var lastMonthOrders = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.CreatedDate < startOfMonth && o.CreatedDate >= startOfLastMonth)
                .CountAsync();

            var thisMonthOrders = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.CreatedDate >= startOfMonth)
                .CountAsync();

            var orderGrowth = lastMonthOrders > 0
                ? Math.Round(((double)(thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100, 1)
                : 0;

            var lastMonthRevenue = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed" 
                    && o.CreatedDate < startOfMonth && o.CreatedDate >= startOfLastMonth)
                .SumAsync(o => o.TotalAmount);

            var thisMonthRevenue = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed" && o.CreatedDate >= startOfMonth)
                .SumAsync(o => o.TotalAmount);

            var revenueGrowth = lastMonthRevenue > 0
                ? Math.Round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100, 1)
                : 0;

            // Get monthly revenue for last 6 months
            var monthlyRevenue = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed" && o.CreatedDate >= sixMonthsAgo)
                .GroupBy(o => new { o.CreatedDate.Year, o.CreatedDate.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            var monthNames = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };
            var monthlyRevenueData = monthlyRevenue.Select(m => new
            {
                month = monthNames[m.Month],
                revenue = m.Revenue
            }).ToList();

            // Get top products by sales
            var topProducts = await _context.OrderItems
                .Where(oi => oi.Order.TenantId == tenantId && !oi.Order.IsDeleted && oi.Order.Status == "Completed")
                .GroupBy(oi => new { oi.ProductId, oi.Product.Name })
                .Select(g => new
                {
                    name = g.Key.Name,
                    sales = g.Sum(oi => oi.Quantity),
                    revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
                })
                .OrderByDescending(x => x.revenue)
                .Take(3)
                .ToListAsync();

            // Get recent orders
            var recentOrders = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted)
                .OrderByDescending(o => o.CreatedDate)
                .Take(3)
                .Select(o => new
                {
                    id = o.Id,
                    orderNumber = o.OrderNumber,
                    customer = o.Customer.Name,
                    amount = o.TotalAmount,
                    status = o.Status
                })
                .ToListAsync();

            var stats = new
            {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProducts,
                revenueGrowth,
                orderGrowth,
                customerGrowth,
                productGrowth = 0.0, // Calculate based on product additions if needed
                monthlyRevenue = monthlyRevenueData,
                topProducts,
                recentOrders
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = stats,
                Message = "Dashboard istatistikleri başarıyla yüklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Dashboard istatistikleri alınırken bir hata oluştu"
            });
        }
    }

    [HttpGet("activities")]
    public async Task<IActionResult> GetRecentActivities()
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var activities = new List<object>();

            // Get recent orders
            var recentOrders = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted)
                .OrderByDescending(o => o.CreatedDate)
                .Take(5)
                .Select(o => new
                {
                    id = o.Id,
                    type = "order",
                    title = "Yeni Sipariş",
                    description = $"{o.OrderNumber} numaralı sipariş oluşturuldu",
                    timestamp = o.CreatedDate,
                    user = o.CreatedBy ?? "Sistem",
                    icon = "ShoppingCart"
                })
                .ToListAsync();

            activities.AddRange(recentOrders);

            // Get recent customers
            var recentCustomers = await _context.Customers
                .Where(c => c.TenantId == tenantId && !c.IsDeleted)
                .OrderByDescending(c => c.CreatedDate)
                .Take(5)
                .Select(c => new
                {
                    id = c.Id,
                    type = "customer",
                    title = "Yeni Müşteri",
                    description = $"{c.Name} firması eklendi",
                    timestamp = c.CreatedDate,
                    user = c.CreatedBy ?? "Sistem",
                    icon = "UserPlus"
                })
                .ToListAsync();

            activities.AddRange(recentCustomers);

            // Get recent payments
            var recentPayments = await _context.Payments
                .Where(p => p.TenantId == tenantId && !p.IsDeleted)
                .OrderByDescending(p => p.CreatedDate)
                .Take(5)
                .Select(p => new
                {
                    id = p.Id,
                    type = "payment",
                    title = "Ödeme Alındı",
                    description = $"{p.Invoice.InvoiceNumber} faturası için {p.Amount:N2} TL ödeme",
                    timestamp = p.CreatedDate,
                    user = p.CreatedBy ?? "Sistem",
                    icon = "CreditCard"
                })
                .ToListAsync();

            activities.AddRange(recentPayments);

            // Sort by timestamp and take top 10
            var sortedActivities = activities
                .OrderByDescending(a => ((dynamic)a).timestamp)
                .Take(10)
                .ToList();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = sortedActivities,
                Message = "Son aktiviteler başarıyla yüklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent activities");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Son aktiviteler alınırken bir hata oluştu"
            });
        }
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications()
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var userId = _currentUserService.UserId;
            var notifications = new List<object>();

            // Check low stock products
            var lowStockProducts = await _context.Products
                .Where(p => p.TenantId == tenantId && !p.IsDeleted && p.StockQuantity <= p.MinStockLevel)
                .CountAsync();

            if (lowStockProducts > 0)
            {
                notifications.Add(new
                {
                    id = Guid.NewGuid(),
                    type = "warning",
                    title = "Düşük Stok Uyarısı",
                    message = $"{lowStockProducts} ürünün stok seviyesi kritik seviyede",
                    timestamp = DateTime.UtcNow,
                    isRead = false
                });
            }

            // Get user notifications from database
            var userNotifications = await _context.Notifications
                .Where(n => n.TenantId == tenantId && n.UserId == Guid.Parse(userId!))
                .OrderByDescending(n => n.CreatedDate)
                .Take(10)
                .Select(n => new
                {
                    id = n.Id,
                    type = n.Type,
                    title = n.Title,
                    message = n.Message,
                    timestamp = n.CreatedDate,
                    isRead = n.IsRead
                })
                .ToListAsync();

            notifications.AddRange(userNotifications);

            // Check for pending orders
            var pendingOrders = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Pending")
                .CountAsync();

            if (pendingOrders > 0)
            {
                notifications.Add(new
                {
                    id = Guid.NewGuid(),
                    type = "info",
                    title = "Bekleyen Siparişler",
                    message = $"{pendingOrders} adet bekleyen sipariş var",
                    timestamp = DateTime.UtcNow,
                    isRead = false
                });
            }

            var sortedNotifications = notifications
                .OrderByDescending(n => ((dynamic)n).timestamp)
                .Take(10)
                .ToList();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = sortedNotifications,
                Message = "Bildirimler başarıyla yüklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notifications");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Bildirimler alınırken bir hata oluştu"
            });
        }
    }

    [HttpGet("charts/revenue")]
    public async Task<IActionResult> GetRevenueChart([FromQuery] string period = "monthly")
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var today = DateTime.UtcNow.Date;
            DateTime startDate;
            List<string> labels;
            
            if (period == "weekly")
            {
                startDate = today.AddDays(-7);
                labels = new List<string>();
                for (int i = 6; i >= 0; i--)
                {
                    labels.Add(today.AddDays(-i).ToString("dd/MM"));
                }
            }
            else if (period == "yearly")
            {
                startDate = today.AddYears(-1);
                var monthNames = new[] { "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara" };
                labels = new List<string>();
                for (int i = 11; i >= 0; i--)
                {
                    var month = today.AddMonths(-i);
                    labels.Add(monthNames[month.Month - 1]);
                }
            }
            else // monthly (default)
            {
                startDate = today.AddMonths(-6);
                var monthNames = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };
                labels = new List<string>();
                for (int i = 5; i >= 0; i--)
                {
                    var month = today.AddMonths(-i);
                    labels.Add(monthNames[month.Month]);
                }
            }

            // Get revenue data
            var revenueQuery = _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed" && o.CreatedDate >= startDate);

            var revenueData = new List<decimal>();
            var expenseData = new List<decimal>();

            if (period == "weekly")
            {
                for (int i = 6; i >= 0; i--)
                {
                    var dayStart = today.AddDays(-i);
                    var dayEnd = dayStart.AddDays(1);
                    var dayRevenue = await revenueQuery
                        .Where(o => o.CreatedDate >= dayStart && o.CreatedDate < dayEnd)
                        .SumAsync(o => o.TotalAmount);
                    revenueData.Add(dayRevenue);
                    
                    // Get expenses for the day
                    var dayExpense = await _context.Expenses
                        .Where(e => e.TenantId == tenantId && !e.IsDeleted && e.Date >= dayStart && e.Date < dayEnd)
                        .SumAsync(e => e.Amount);
                    expenseData.Add(dayExpense);
                }
            }
            else if (period == "yearly")
            {
                for (int i = 11; i >= 0; i--)
                {
                    var monthStart = new DateTime(today.AddMonths(-i).Year, today.AddMonths(-i).Month, 1);
                    var monthEnd = monthStart.AddMonths(1);
                    var monthRevenue = await revenueQuery
                        .Where(o => o.CreatedDate >= monthStart && o.CreatedDate < monthEnd)
                        .SumAsync(o => o.TotalAmount);
                    revenueData.Add(monthRevenue);
                    
                    var monthExpense = await _context.Expenses
                        .Where(e => e.TenantId == tenantId && !e.IsDeleted && e.Date >= monthStart && e.Date < monthEnd)
                        .SumAsync(e => e.Amount);
                    expenseData.Add(monthExpense);
                }
            }
            else // monthly
            {
                for (int i = 5; i >= 0; i--)
                {
                    var monthStart = new DateTime(today.AddMonths(-i).Year, today.AddMonths(-i).Month, 1);
                    var monthEnd = monthStart.AddMonths(1);
                    var monthRevenue = await revenueQuery
                        .Where(o => o.CreatedDate >= monthStart && o.CreatedDate < monthEnd)
                        .SumAsync(o => o.TotalAmount);
                    revenueData.Add(monthRevenue);
                    
                    var monthExpense = await _context.Expenses
                        .Where(e => e.TenantId == tenantId && !e.IsDeleted && e.Date >= monthStart && e.Date < monthEnd)
                        .SumAsync(e => e.Amount);
                    expenseData.Add(monthExpense);
                }
            }

            var chartData = new
            {
                labels = labels.ToArray(),
                datasets = new[]
                {
                    new
                    {
                        label = "Gelir",
                        data = revenueData.ToArray(),
                        borderColor = "#1890ff",
                        backgroundColor = "rgba(24, 144, 255, 0.1)"
                    },
                    new
                    {
                        label = "Gider",
                        data = expenseData.ToArray(),
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting revenue chart data");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Grafik verisi alınırken bir hata oluştu"
            });
        }
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetDashboardSummary()
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var userId = _currentUserService.UserId;
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            // Get tenant information
            var tenant = await _context.Tenants
                .Include(t => t.Subscription)
                .Include(t => t.TenantModules)
                    .ThenInclude(tm => tm.Module)
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kiracı bilgisi bulunamadı"
                });
            }

            // Get employee count
            var employeeCount = await _context.TenantUsers
                .Where(u => u.TenantId == tenantId && u.IsActive && !u.IsDeleted)
                .CountAsync();

            // Calculate today's stats
            var todayRevenue = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed" 
                    && o.CreatedDate >= today && o.CreatedDate < tomorrow)
                .SumAsync(o => o.TotalAmount);

            var todayOrders = await _context.Orders
                .Where(o => o.TenantId == tenantId && !o.IsDeleted 
                    && o.CreatedDate >= today && o.CreatedDate < tomorrow)
                .CountAsync();

            var pendingTasks = await _context.Tasks
                .Where(t => t.TenantId == tenantId && t.AssignedToId == Guid.Parse(userId!) 
                    && t.Status != "Completed" && !t.IsDeleted)
                .CountAsync();

            var unreadMessages = await _context.Notifications
                .Where(n => n.TenantId == tenantId && n.UserId == Guid.Parse(userId!) && !n.IsRead)
                .CountAsync();

            // Calculate storage usage (in GB)
            var storageInfo = await _context.Documents
                .Where(d => d.TenantId == tenantId && !d.IsDeleted)
                .GroupBy(d => d.TenantId)
                .Select(g => new
                {
                    TotalSizeBytes = g.Sum(d => d.FileSize)
                })
                .FirstOrDefaultAsync();

            var usedStorageGB = storageInfo != null ? Math.Round(storageInfo.TotalSizeBytes / (1024.0 * 1024.0 * 1024.0), 2) : 0;

            // Get active modules with usage percentage
            var modules = tenant.TenantModules.Select(tm => new
            {
                name = tm.Module.Name,
                status = tm.IsActive ? "Active" : "Inactive",
                usagePercentage = tm.IsActive ? CalculateModuleUsage(tm.Module.Code, tenantId, _context).Result : 0
            }).ToList();

            var summary = new
            {
                company = new
                {
                    name = tenant.Name,
                    logo = tenant.Logo ?? "/api/tenant/company/logo",
                    industry = tenant.Industry,
                    employeeCount = employeeCount,
                    foundedYear = tenant.CreatedDate.Year
                },
                subscription = new
                {
                    plan = tenant.Subscription?.PlanName ?? "Basic",
                    status = tenant.Subscription?.Status ?? "Active",
                    expiryDate = tenant.Subscription?.EndDate ?? DateTime.UtcNow.AddDays(30),
                    usedStorage = usedStorageGB,
                    totalStorage = tenant.Subscription?.StorageLimit ?? 10, // GB
                    usedUsers = employeeCount,
                    totalUsers = tenant.Subscription?.UserLimit ?? 25
                },
                modules,
                quickStats = new
                {
                    todayRevenue,
                    todayOrders,
                    pendingTasks,
                    unreadMessages
                }
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = summary,
                Message = "Dashboard özeti başarıyla yüklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard summary");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Dashboard özeti alınırken bir hata oluştu"
            });
        }
    }

    private async Task<int> CalculateModuleUsage(string moduleCode, Guid tenantId, TenantDbContext context)
    {
        // Calculate usage percentage based on module
        switch (moduleCode?.ToLower())
        {
            case "crm":
                var totalCrmRecords = await context.Customers.Where(c => c.TenantId == tenantId).CountAsync() +
                                     await context.Leads.Where(l => l.TenantId == tenantId).CountAsync() +
                                     await context.Opportunities.Where(o => o.TenantId == tenantId).CountAsync();
                return Math.Min(100, (totalCrmRecords * 100) / 1000); // Assume 1000 records is 100% usage

            case "inventory":
                var totalInventoryRecords = await context.Products.Where(p => p.TenantId == tenantId).CountAsync() +
                                           await context.StockMovements.Where(s => s.TenantId == tenantId).CountAsync();
                return Math.Min(100, (totalInventoryRecords * 100) / 500); // Assume 500 records is 100% usage

            case "finance":
                var totalFinanceRecords = await context.Invoices.Where(i => i.TenantId == tenantId).CountAsync() +
                                         await context.Payments.Where(p => p.TenantId == tenantId).CountAsync();
                return Math.Min(100, (totalFinanceRecords * 100) / 800); // Assume 800 records is 100% usage

            case "hr":
                var totalHrRecords = await context.TenantUsers.Where(u => u.TenantId == tenantId).CountAsync();
                return Math.Min(100, (totalHrRecords * 100) / 50); // Assume 50 employees is 100% usage

            default:
                return 0;
        }
    }
}