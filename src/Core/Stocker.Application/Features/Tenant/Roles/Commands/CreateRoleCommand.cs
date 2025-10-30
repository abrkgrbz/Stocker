using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Application.Features.Tenant.Roles.Commands;

public class CreateRoleCommand : IRequest<RoleDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<PermissionDto> Permissions { get; set; } = new();
}

public class PermissionDto
{
    public string Resource { get; set; } = string.Empty;
    public int PermissionType { get; set; }
}
