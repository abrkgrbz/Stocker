using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

public sealed class Role : TenantAggregateRoot
{
    private readonly List<RolePermission> _permissions = new();

    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsSystemRole { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public IReadOnlyList<RolePermission> Permissions => _permissions.AsReadOnly();

    private Role() { } // EF Constructor

    private Role(
        Guid tenantId,
        string name,
        string? description = null,
        bool isSystemRole = false)
    {
        Id = Guid.NewGuid();
        SetTenantId(tenantId);
        Name = name;
        Description = description;
        IsSystemRole = isSystemRole;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public static Role Create(
        Guid tenantId,
        string name,
        string? description = null,
        bool isSystemRole = false)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Role name cannot be empty.", nameof(name));
        }

        return new Role(tenantId, name, description, isSystemRole);
    }

    public void Update(string name, string? description)
    {
        if (IsSystemRole)
        {
            throw new InvalidOperationException("System roles cannot be updated.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Role name cannot be empty.", nameof(name));
        }

        Name = name;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        if (IsSystemRole)
        {
            throw new InvalidOperationException("System roles cannot be deactivated.");
        }

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddPermission(string resource, Enums.PermissionType permissionType)
    {
        if (string.IsNullOrWhiteSpace(resource))
        {
            throw new ArgumentException("Resource cannot be empty.", nameof(resource));
        }

        if (_permissions.Any(p => p.Resource == resource && p.PermissionType == permissionType))
        {
            throw new InvalidOperationException($"Role already has '{permissionType}' permission for '{resource}'.");
        }

        _permissions.Add(new RolePermission(Id, resource, permissionType));
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemovePermission(string resource, Enums.PermissionType permissionType)
    {
        var permission = _permissions.FirstOrDefault(p => p.Resource == resource && p.PermissionType == permissionType);
        if (permission == null)
        {
            throw new InvalidOperationException($"Role does not have '{permissionType}' permission for '{resource}'.");
        }

        _permissions.Remove(permission);
        UpdatedAt = DateTime.UtcNow;
    }

    public void ClearPermissions()
    {
        if (IsSystemRole)
        {
            throw new InvalidOperationException("Cannot clear permissions from system roles.");
        }

        _permissions.Clear();
        UpdatedAt = DateTime.UtcNow;
    }

    public bool HasPermission(string resource, Enums.PermissionType permissionType)
    {
        return _permissions.Any(p => p.Resource == resource && p.PermissionType == permissionType);
    }
}