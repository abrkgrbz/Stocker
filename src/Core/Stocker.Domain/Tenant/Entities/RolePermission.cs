using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public sealed class RolePermission : Entity
{
    public Guid RoleId { get; private set; }
    public string Resource { get; private set; }
    public PermissionType PermissionType { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private RolePermission() { } // EF Constructor

    public RolePermission(
        Guid roleId,
        string resource,
        PermissionType permissionType)
    {
        Id = Guid.NewGuid();
        RoleId = roleId;
        Resource = resource ?? throw new ArgumentNullException(nameof(resource));
        PermissionType = permissionType;
        CreatedAt = DateTime.UtcNow;
    }
}