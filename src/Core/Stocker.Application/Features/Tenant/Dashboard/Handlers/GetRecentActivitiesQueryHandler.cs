using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetRecentActivitiesQueryHandler : IRequestHandler<GetRecentActivitiesQuery, List<ActivityDto>>
{
    public Task<List<ActivityDto>> Handle(GetRecentActivitiesQuery request, CancellationToken cancellationToken)
    {
        // Mock data for now - will be replaced when modules are ready
        var activities = new List<ActivityDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Type = "order",
                Title = "Yeni Sipariş",
                Description = "ORD-2024-001 numaralı sipariş oluşturuldu",
                Timestamp = DateTime.UtcNow.AddHours(-1),
                User = "Ahmet Yılmaz",
                Icon = "ShoppingCart"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Type = "customer",
                Title = "Yeni Müşteri",
                Description = "ABC Şirketi eklendi",
                Timestamp = DateTime.UtcNow.AddHours(-2),
                User = "Mehmet Demir",
                Icon = "UserPlus"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Type = "payment",
                Title = "Ödeme Alındı",
                Description = "INV-2024-015 faturası için 5,000 TL ödeme",
                Timestamp = DateTime.UtcNow.AddHours(-3),
                User = "Sistem",
                Icon = "CreditCard"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Type = "stock",
                Title = "Stok Güncellendi",
                Description = "Laptop stok miktarı güncellendi",
                Timestamp = DateTime.UtcNow.AddHours(-4),
                User = "Ayşe Kaya",
                Icon = "Package"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Type = "task",
                Title = "Görev Tamamlandı",
                Description = "Aylık rapor hazırlama görevi tamamlandı",
                Timestamp = DateTime.UtcNow.AddHours(-5),
                User = "Fatma Öz",
                Icon = "CheckCircle"
            }
        };

        return Task.FromResult(activities);
    }
}