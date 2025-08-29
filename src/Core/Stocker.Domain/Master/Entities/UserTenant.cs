using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class UserTenant : Entity
{
    public Guid UserId { get; private set; }
    public Guid TenantId { get; private set; }
    public UserType UserType { get; private set; }
    public DateTime AssignedAt { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsActive { get; private set; }

    private UserTenant() { } // EF Constructor

    public UserTenant(Guid userId, Guid tenantId, UserType userType, bool isDefault = false)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        TenantId = tenantId;
        UserType = userType;
        AssignedAt = DateTime.UtcNow;
        IsDefault = isDefault;
        IsActive = true;
    }

    public void UpdateUserType(UserType newUserType)
    {
        UserType = newUserType;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
    }

    public void UnsetAsDefault()
    {
        IsDefault = false;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}