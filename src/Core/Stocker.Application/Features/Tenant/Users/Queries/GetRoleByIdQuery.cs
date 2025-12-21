using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Users.Queries;

public class GetRoleByIdQuery : IRequest<RoleDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid RoleId { get; set; }
}
