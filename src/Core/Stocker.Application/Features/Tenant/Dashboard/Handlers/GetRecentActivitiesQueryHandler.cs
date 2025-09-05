using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetRecentActivitiesQueryHandler : IRequestHandler<GetRecentActivitiesQuery, List<ActivityDto>>
{
    private readonly TenantDbContext _context;

    public GetRecentActivitiesQueryHandler(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<List<ActivityDto>> Handle(GetRecentActivitiesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = request.TenantId;
        var activities = new List<ActivityDto>();

        var recentOrders = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedDate)
            .Take(5)
            .Select(o => new ActivityDto
            {
                Id = o.Id,
                Type = "order",
                Title = "Yeni Sipariş",
                Description = $"{o.OrderNumber} numaralı sipariş oluşturuldu",
                Timestamp = o.CreatedDate,
                User = o.CreatedBy ?? "Sistem",
                Icon = "ShoppingCart"
            })
            .ToListAsync(cancellationToken);

        activities.AddRange(recentOrders);

        var recentCustomers = await _context.Customers
            .Where(c => c.TenantId == tenantId && !c.IsDeleted)
            .OrderByDescending(c => c.CreatedDate)
            .Take(5)
            .Select(c => new ActivityDto
            {
                Id = c.Id,
                Type = "customer",
                Title = "Yeni Müşteri",
                Description = $"{c.Name} firması eklendi",
                Timestamp = c.CreatedDate,
                User = c.CreatedBy ?? "Sistem",
                Icon = "UserPlus"
            })
            .ToListAsync(cancellationToken);

        activities.AddRange(recentCustomers);

        var recentPayments = await _context.Payments
            .Where(p => p.TenantId == tenantId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedDate)
            .Take(5)
            .Select(p => new ActivityDto
            {
                Id = p.Id,
                Type = "payment",
                Title = "Ödeme Alındı",
                Description = $"{p.Invoice.InvoiceNumber} faturası için {p.Amount:N2} TL ödeme",
                Timestamp = p.CreatedDate,
                User = p.CreatedBy ?? "Sistem",
                Icon = "CreditCard"
            })
            .ToListAsync(cancellationToken);

        activities.AddRange(recentPayments);

        return activities
            .OrderByDescending(a => a.Timestamp)
            .Take(10)
            .ToList();
    }
}