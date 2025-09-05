using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, List<NotificationDto>>
{
    private readonly TenantDbContext _context;

    public GetNotificationsQueryHandler(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = request.TenantId;
        var userId = request.UserId;
        var notifications = new List<NotificationDto>();

        var lowStockProducts = await _context.Products
            .Where(p => p.TenantId == tenantId && !p.IsDeleted && p.StockQuantity <= p.MinStockLevel)
            .CountAsync(cancellationToken);

        if (lowStockProducts > 0)
        {
            notifications.Add(new NotificationDto
            {
                Id = Guid.NewGuid(),
                Type = "warning",
                Title = "Düşük Stok Uyarısı",
                Message = $"{lowStockProducts} ürünün stok seviyesi kritik seviyede",
                Timestamp = DateTime.UtcNow,
                IsRead = false
            });
        }

        if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var userGuid))
        {
            var userNotifications = await _context.Notifications
                .Where(n => n.TenantId == tenantId && n.UserId == userGuid)
                .OrderByDescending(n => n.CreatedDate)
                .Take(10)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Type = n.Type,
                    Title = n.Title,
                    Message = n.Message,
                    Timestamp = n.CreatedDate,
                    IsRead = n.IsRead
                })
                .ToListAsync(cancellationToken);

            notifications.AddRange(userNotifications);
        }

        var pendingOrders = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Pending")
            .CountAsync(cancellationToken);

        if (pendingOrders > 0)
        {
            notifications.Add(new NotificationDto
            {
                Id = Guid.NewGuid(),
                Type = "info",
                Title = "Bekleyen Siparişler",
                Message = $"{pendingOrders} adet bekleyen sipariş var",
                Timestamp = DateTime.UtcNow,
                IsRead = false
            });
        }

        return notifications
            .OrderByDescending(n => n.Timestamp)
            .Take(10)
            .ToList();
    }
}