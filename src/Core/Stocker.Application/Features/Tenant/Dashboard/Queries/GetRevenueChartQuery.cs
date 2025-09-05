using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Dashboard.Queries;

public class GetRevenueChartQuery : IRequest<RevenueChartDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Period { get; set; } = "monthly";
}