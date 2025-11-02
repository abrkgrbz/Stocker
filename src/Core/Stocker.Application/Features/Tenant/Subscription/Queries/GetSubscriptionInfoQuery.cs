using MediatR;
using Stocker.Application.DTOs.Tenant;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Subscription.Queries;

public class GetSubscriptionInfoQuery : IRequest<TenantSubscriptionInfoDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
}
