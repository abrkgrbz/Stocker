using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly TenantDbContext _context;

    public GetDashboardSummaryQueryHandler(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var tenantId = request.TenantId;
        var userId = request.UserId;
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var tenant = await _context.Tenants
            .Include(t => t.Subscription)
            .Include(t => t.TenantModules)
                .ThenInclude(tm => tm.Module)
            .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

        if (tenant == null)
        {
            throw new InvalidOperationException("Kiracı bilgisi bulunamadı");
        }

        var employeeCount = await _context.TenantUsers
            .Where(u => u.TenantId == tenantId && u.IsActive && !u.IsDeleted)
            .CountAsync(cancellationToken);

        var todayRevenue = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed"
                && o.CreatedDate >= today && o.CreatedDate < tomorrow)
            .SumAsync(o => o.TotalAmount, cancellationToken);

        var todayOrders = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted
                && o.CreatedDate >= today && o.CreatedDate < tomorrow)
            .CountAsync(cancellationToken);

        var pendingTasks = 0;
        var unreadMessages = 0;

        if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var userGuid))
        {
            pendingTasks = await _context.Tasks
                .Where(t => t.TenantId == tenantId && t.AssignedToId == userGuid
                    && t.Status != "Completed" && !t.IsDeleted)
                .CountAsync(cancellationToken);

            unreadMessages = await _context.Notifications
                .Where(n => n.TenantId == tenantId && n.UserId == userGuid && !n.IsRead)
                .CountAsync(cancellationToken);
        }

        var storageInfo = await _context.Documents
            .Where(d => d.TenantId == tenantId && !d.IsDeleted)
            .GroupBy(d => d.TenantId)
            .Select(g => new
            {
                TotalSizeBytes = g.Sum(d => d.FileSize)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var usedStorageGB = storageInfo != null ? Math.Round(storageInfo.TotalSizeBytes / (1024.0 * 1024.0 * 1024.0), 2) : 0;

        var modules = new List<ModuleInfoDto>();
        foreach (var tm in tenant.TenantModules)
        {
            var usagePercentage = tm.IsActive ? await CalculateModuleUsage(tm.Module.Code, tenantId, cancellationToken) : 0;
            modules.Add(new ModuleInfoDto
            {
                Name = tm.Module.Name,
                Status = tm.IsActive ? "Active" : "Inactive",
                UsagePercentage = usagePercentage
            });
        }

        return new DashboardSummaryDto
        {
            Company = new CompanyInfoDto
            {
                Name = tenant.Name,
                Logo = tenant.Logo ?? "/api/tenant/company/logo",
                Industry = tenant.Industry,
                EmployeeCount = employeeCount,
                FoundedYear = tenant.CreatedDate.Year
            },
            Subscription = new SubscriptionInfoDto
            {
                Plan = tenant.Subscription?.PlanName ?? "Basic",
                Status = tenant.Subscription?.Status ?? "Active",
                ExpiryDate = tenant.Subscription?.EndDate ?? DateTime.UtcNow.AddDays(30),
                UsedStorage = usedStorageGB,
                TotalStorage = tenant.Subscription?.StorageLimit ?? 10,
                UsedUsers = employeeCount,
                TotalUsers = tenant.Subscription?.UserLimit ?? 25
            },
            Modules = modules,
            QuickStats = new QuickStatsDto
            {
                TodayRevenue = todayRevenue,
                TodayOrders = todayOrders,
                PendingTasks = pendingTasks,
                UnreadMessages = unreadMessages
            }
        };
    }

    private async Task<int> CalculateModuleUsage(string? moduleCode, Guid tenantId, CancellationToken cancellationToken)
    {
        switch (moduleCode?.ToLower())
        {
            case "crm":
                var totalCrmRecords = await _context.Customers.Where(c => c.TenantId == tenantId).CountAsync(cancellationToken) +
                                     await _context.Leads.Where(l => l.TenantId == tenantId).CountAsync(cancellationToken) +
                                     await _context.Opportunities.Where(o => o.TenantId == tenantId).CountAsync(cancellationToken);
                return Math.Min(100, (totalCrmRecords * 100) / 1000);

            case "inventory":
                var totalInventoryRecords = await _context.Products.Where(p => p.TenantId == tenantId).CountAsync(cancellationToken) +
                                           await _context.StockMovements.Where(s => s.TenantId == tenantId).CountAsync(cancellationToken);
                return Math.Min(100, (totalInventoryRecords * 100) / 500);

            case "finance":
                var totalFinanceRecords = await _context.Invoices.Where(i => i.TenantId == tenantId).CountAsync(cancellationToken) +
                                         await _context.Payments.Where(p => p.TenantId == tenantId).CountAsync(cancellationToken);
                return Math.Min(100, (totalFinanceRecords * 100) / 800);

            case "hr":
                var totalHrRecords = await _context.TenantUsers.Where(u => u.TenantId == tenantId).CountAsync(cancellationToken);
                return Math.Min(100, (totalHrRecords * 100) / 50);

            default:
                return 0;
        }
    }
}