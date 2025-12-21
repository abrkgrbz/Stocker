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
    public string PasswordHash { get; private set; }
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
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }
    public IReadOnlyList<UserRole> UserRoles => _userRoles.AsReadOnly();
    public IReadOnlyList<UserPermission> UserPermissions => _userPermissions.AsReadOnly();

    private TenantUser() { } // EF Constructor

    private TenantUser(
        Guid tenantId,
        Guid masterUserId,
        string username,
        string passwordHash,
        Email email,
        string firstName,
        string lastName,
        string? employeeCode = null,
        PhoneNumber? phone = null,
        PhoneNumber? mobile = null,
        string? title = null,
        Guid? departmentId = null,
        Guid? branchId = null,
        DateTime? hireDate = null) : base(Guid.NewGuid(), tenantId)
    {
        MasterUserId = masterUserId;
        Username = username;
        PasswordHash = passwordHash;
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
        string passwordHash,
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

        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new ArgumentException("Password hash cannot be empty.", nameof(passwordHash));
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
            passwordHash,
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

    /// <summary>
    /// Creates a new user for invitation flow (without password).
    /// The user will be in PendingActivation status until they set their password.
    /// </summary>
    public static TenantUser CreateForInvitation(
        Guid tenantId,
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

        // Create with a placeholder password hash - will be set during activation
        var user = new TenantUser(
            tenantId,
            Guid.Empty, // No master user association for invited users
            username,
            "PENDING_ACTIVATION", // Placeholder - cannot be used for login
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

        // Set status to PendingActivation
        user.Status = TenantUserStatus.PendingActivation;

        // Generate activation token immediately
        user.GeneratePasswordResetToken();
        // Extend token validity to 7 days for invitation flow
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddDays(7);

        return user;
    }

    /// <summary>
    /// Activates a pending user account by setting their password.
    /// Only works for users in PendingActivation status.
    /// </summary>
    public void ActivateWithPassword(string passwordHash, string activationToken)
    {
        if (Status != TenantUserStatus.PendingActivation)
        {
            throw new InvalidOperationException("User account is already activated.");
        }

        if (!ValidatePasswordResetToken(activationToken))
        {
            throw new InvalidOperationException("Invalid or expired activation token.");
        }

        PasswordHash = passwordHash;
        Status = TenantUserStatus.Active;
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Checks if this user is pending activation (invited but not yet set password).
    /// </summary>
    public bool IsPendingActivation() => Status == TenantUserStatus.PendingActivation;

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

    public void GeneratePasswordResetToken()
    {
        var bytes = new byte[32];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }
        PasswordResetToken = Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
        PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // Token expires in 1 hour
        UpdatedAt = DateTime.UtcNow;
    }

    public bool ValidatePasswordResetToken(string token)
    {
        return PasswordResetToken == token &&
               PasswordResetTokenExpiry.HasValue &&
               PasswordResetTokenExpiry.Value > DateTime.UtcNow;
    }

    public void ResetPassword(string newPasswordHash, string resetToken)
    {
        if (!ValidatePasswordResetToken(resetToken))
        {
            throw new InvalidOperationException("Invalid or expired password reset token.");
        }

        PasswordHash = newPasswordHash;
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Clears the password reset token without changing the password.
    /// Used when the password is reset through an external mechanism.
    /// </summary>
    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        UpdatedAt = DateTime.UtcNow;
    }
}