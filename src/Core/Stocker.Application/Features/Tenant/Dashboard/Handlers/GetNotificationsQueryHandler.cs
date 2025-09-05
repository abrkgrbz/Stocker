using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, List<NotificationDto>>
{
    public Task<List<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        // Mock data for now - will be replaced when modules are ready
        var notifications = new List<NotificationDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Yeni Sipariş",
                Message = "ORD-2024-001 numaralı yeni sipariş alındı",
                Type = "info",
                IsRead = false,
                Timestamp = DateTime.UtcNow.AddMinutes(-15)
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Stok Uyarısı",
                Message = "Laptop stok seviyesi kritik seviyenin altında",
                Type = "warning",
                IsRead = false,
                Timestamp = DateTime.UtcNow.AddHours(-1)
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Ödeme Onaylandı",
                Message = "INV-2024-015 numaralı fatura ödemesi onaylandı",
                Type = "success",
                IsRead = true,
                Timestamp = DateTime.UtcNow.AddHours(-2)
            }
        };

        return Task.FromResult(notifications);
    }
}