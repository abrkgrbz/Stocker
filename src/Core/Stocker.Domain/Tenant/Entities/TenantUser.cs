using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

public sealed class TenantUser : TenantAggregateRoot
{
    private readonly List<UserRole> _userRoles = new();
    private readonly List<UserPermission> _userPermissions = new();

    public Guid MasterUserId { get; private set; }
    public string Username { get; private set; }
    public Email Email { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string? EmployeeCode { get; private set; }
    public PhoneNumber? Phone { get; private set; }
    public PhoneNumber? Mobile { get; private set; }
    public string? Title { get; private set; }
    public Guid? DepartmentId { get; private set; }
    public Guid? BranchId { get; private set; }
    public Guid? ManagerId { get; private set; }
    public TenantUserStatus Status { get; private set; }
    public DateTime? HireDate { get; private set; }
    public DateTime? TerminationDate { get; private set; }
    public string? ProfilePictureUrl { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public IReadOnlyList<UserRole> UserRoles => _userRoles.AsReadOnly();
    public IReadOnlyList<UserPermission> UserPermissions => _userPermissions.AsReadOnly();

    private TenantUser() { } // EF Constructor

    private TenantUser(
        Guid tenantId,
        Guid masterUserId,
        string username,
        Email email,
        string firstName,
        string lastName,
        string? employeeCode = null,
        PhoneNumber? phone = null,
        PhoneNumber? mobile = null,
        string? title = null,
        Guid? departmentId = null,
        Guid? branchId = null,
        DateTime? hireDate = null)
    {
        Id = Guid.NewGuid();
        SetTenantId(tenantId);
        MasterUserId = masterUserId;
        Username = username;
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        EmployeeCode = employeeCode;
        Phone = phone;
        Mobile = mobile;
        Title = title;
        DepartmentId = departmentId;
        BranchId = branchId;
        Status = TenantUserStatus.Active;
        HireDate = hireDate;
        CreatedAt = DateTime.UtcNow;
    }

    public static TenantUser Create(
        Guid tenantId,
        Guid masterUserId,
        string username,
        Email email,
        string firstName,
        string lastName,
        string? employeeCode = null,
        PhoneNumber? phone = null,
        PhoneNumber? mobile = null,
        string? title = null,
        Guid? departmentId = null,
        Guid? branchId = null,
        DateTime? hireDate = null)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            throw new ArgumentException("Username cannot be empty.", nameof(username));
        }

        if (string.IsNullOrWhiteSpace(firstName))
        {
            throw new ArgumentException("First name cannot be empty.", nameof(firstName));
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            throw new ArgumentException("Last name cannot be empty.", nameof(lastName));
        }

        return new TenantUser(
            tenantId,
            masterUserId,
            username,
            email,
            firstName,
            lastName,
            employeeCode,
            phone,
            mobile,
            title,
            departmentId,
            branchId,
            hireDate);
    }

    public void UpdateProfile(
        string firstName,
        string lastName,
        PhoneNumber? phone = null,
        PhoneNumber? mobile = null,
        string? title = null)
    {
        FirstName = firstName;
        LastName = lastName;
        Phone = phone;
        Mobile = mobile;
        Title = title;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateEmployeeInfo(
        string? employeeCode,
        Guid? departmentId,
        Guid? branchId,
        Guid? managerId)
    {
        EmployeeCode = employeeCode;
        DepartmentId = departmentId;
        BranchId = branchId;
        ManagerId = managerId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateProfilePicture(string? profilePictureUrl)
    {
        ProfilePictureUrl = profilePictureUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        if (Status == TenantUserStatus.Terminated)
        {
            throw new InvalidOperationException("Cannot activate terminated users.");
        }

        Status = TenantUserStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        Status = TenantUserStatus.Inactive;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Suspend(string reason)
    {
        if (Status == TenantUserStatus.Terminated)
        {
            throw new InvalidOperationException("Cannot suspend terminated users.");
        }

        Status = TenantUserStatus.Suspended;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetOnLeave()
    {
        if (Status == TenantUserStatus.Terminated)
        {
            throw new InvalidOperationException("Cannot set terminated users on leave.");
        }

        Status = TenantUserStatus.OnLeave;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Terminate(DateTime terminationDate)
    {
        Status = TenantUserStatus.Terminated;
        TerminationDate = terminationDate;
        UpdatedAt = DateTime.UtcNow;

        // Remove all roles and permissions on termination
        _userRoles.Clear();
        _userPermissions.Clear();
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    public void AssignRole(Guid roleId)
    {
        if (_userRoles.Any(ur => ur.RoleId == roleId))
        {
            throw new InvalidOperationException($"User already has role '{roleId}'.");
        }

        _userRoles.Add(new UserRole(Id, roleId));
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveRole(Guid roleId)
    {
        var userRole = _userRoles.FirstOrDefault(ur => ur.RoleId == roleId);
        if (userRole == null)
        {
            throw new InvalidOperationException($"User does not have role '{roleId}'.");
        }

        _userRoles.Remove(userRole);
        UpdatedAt = DateTime.UtcNow;
    }

    public void GrantPermission(string resource, PermissionType permissionType)
    {
        if (_userPermissions.Any(p => p.Resource == resource && p.PermissionType == permissionType))
        {
            throw new InvalidOperationException($"User already has '{permissionType}' permission for '{resource}'.");
        }

        _userPermissions.Add(new UserPermission(Id, resource, permissionType));
        UpdatedAt = DateTime.UtcNow;
    }

    public void RevokePermission(string resource, PermissionType permissionType)
    {
        var permission = _userPermissions.FirstOrDefault(p => p.Resource == resource && p.PermissionType == permissionType);
        if (permission == null)
        {
            throw new InvalidOperationException($"User does not have '{permissionType}' permission for '{resource}'.");
        }

        _userPermissions.Remove(permission);
        UpdatedAt = DateTime.UtcNow;
    }

    public bool HasRole(Guid roleId)
    {
        return _userRoles.Any(ur => ur.RoleId == roleId);
    }

    public bool HasPermission(string resource, PermissionType permissionType)
    {
        return _userPermissions.Any(p => p.Resource == resource && p.PermissionType == permissionType);
    }

    public string GetFullName() => $"{FirstName} {LastName}";

    public bool IsActive() => Status == TenantUserStatus.Active;
}