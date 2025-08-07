using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public sealed class UserPermission : Entity
{
    public Guid UserId { get; private set; }
    public string Resource { get; private set; }
    public PermissionType PermissionType { get; private set; }
    public DateTime GrantedAt { get; private set; }
    public Guid? GrantedBy { get; private set; }

    private UserPermission() { } // EF Constructor

    public UserPermission(
        Guid userId,
        string resource,
        PermissionType permissionType,
        Guid? grantedBy = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Resource = resource ?? throw new ArgumentNullException(nameof(resource));
        PermissionType = permissionType;
        GrantedAt = DateTime.UtcNow;
        GrantedBy = grantedBy;
    }
}