using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public sealed class UserRole : Entity
{
    public Guid UserId { get; private set; }
    public Guid RoleId { get; private set; }
    public DateTime AssignedAt { get; private set; }
    public Guid? AssignedBy { get; private set; }

    private UserRole() { } // EF Constructor

    public UserRole(Guid userId, Guid roleId, Guid? assignedBy = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        RoleId = roleId;
        AssignedAt = DateTime.UtcNow;
        AssignedBy = assignedBy;
    }
}