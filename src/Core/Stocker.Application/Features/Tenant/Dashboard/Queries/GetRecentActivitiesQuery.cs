using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Dashboard.Queries;

public class GetRecentActivitiesQuery : IRequest<List<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}