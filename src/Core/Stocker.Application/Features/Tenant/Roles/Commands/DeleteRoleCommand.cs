using MediatR;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Roles.Commands;

public class DeleteRoleCommand : IRequest<bool>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid RoleId { get; set; }
}
