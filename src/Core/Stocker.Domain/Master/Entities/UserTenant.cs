using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class UserTenant : Entity
{
    public Guid UserId { get; private set; }
    public Guid TenantId { get; private set; }
    public string Role { get; private set; }
    public DateTime AssignedAt { get; private set; }
    public bool IsDefault { get; private set; }

    private UserTenant() { } // EF Constructor

    public UserTenant(Guid userId, Guid tenantId, string role, bool isDefault = false)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        TenantId = tenantId;
        Role = role ?? throw new ArgumentNullException(nameof(role));
        AssignedAt = DateTime.UtcNow;
        IsDefault = isDefault;
    }

    public void UpdateRole(string newRole)
    {
        if (string.IsNullOrWhiteSpace(newRole))
        {
            throw new ArgumentException("Role cannot be empty.", nameof(newRole));
        }

        Role = newRole;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
    }

    public void UnsetAsDefault()
    {
        IsDefault = false;
    }
}