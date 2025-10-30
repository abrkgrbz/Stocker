using MediatR;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Application.Features.Tenant.Roles.Commands;

public class UpdateRoleCommand : IRequest<bool>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid RoleId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<PermissionDto> Permissions { get; set; } = new();
}
