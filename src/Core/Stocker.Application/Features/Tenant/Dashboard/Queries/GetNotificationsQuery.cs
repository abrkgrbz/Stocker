using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Dashboard.Queries;

public class GetNotificationsQuery : IRequest<List<NotificationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? UserId { get; set; }
}