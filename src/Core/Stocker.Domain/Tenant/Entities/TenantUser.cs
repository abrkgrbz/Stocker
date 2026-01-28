using Stocker.Domain.Common.Helpers;
using Stocker.Domain.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Constants;
using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

public sealed class TenantUser : TenantAggregateRoot, IPasswordResettable
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
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutEndAt { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }
    // Refresh token for invited users (no MasterUser association)
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }

    // Two-Factor Authentication
    public bool TwoFactorEnabled { get; private set; }
    public string? TwoFactorSecret { get; private set; }
    public string? BackupCodes { get; private set; }
    public int TwoFactorFailedAttempts { get; private set; }
    public DateTime? TwoFactorLockoutEndAt { get; private set; }

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
        FailedLoginAttempts = 0;
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
            DomainConstants.PendingActivationPasswordPlaceholder, // Placeholder - cannot be used for login
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
        // Extend token validity for invitation flow
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddDays(PasswordConstants.InvitationTokenExpiryDays);

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

    /// <summary>
    /// Records a successful login and resets lockout counters
    /// </summary>
    public void RecordSuccessfulLogin()
    {
        LastLoginAt = DateTime.UtcNow;
        FailedLoginAttempts = 0;
        LockoutEndAt = null;
    }

    /// <summary>
    /// Records a failed login attempt and applies lockout if threshold exceeded
    /// </summary>
    public void RecordFailedLogin()
    {
        FailedLoginAttempts++;
        UpdatedAt = DateTime.UtcNow;

        // Lock account after 5 failed attempts for 30 minutes
        if (FailedLoginAttempts >= 5)
        {
            LockoutEndAt = DateTime.UtcNow.AddMinutes(30);
        }
    }

    /// <summary>
    /// Checks if the user account is currently locked out
    /// </summary>
    public bool IsLockedOut()
    {
        return LockoutEndAt.HasValue && LockoutEndAt.Value > DateTime.UtcNow;
    }

    /// <summary>
    /// Gets the remaining lockout time, or null if not locked out
    /// </summary>
    public TimeSpan? GetLockoutTimeRemaining()
    {
        if (!IsLockedOut())
            return null;

        return LockoutEndAt!.Value - DateTime.UtcNow;
    }

    /// <summary>
    /// Manually unlocks the user account (admin action)
    /// </summary>
    public void Unlock()
    {
        FailedLoginAttempts = 0;
        LockoutEndAt = null;
        UpdatedAt = DateTime.UtcNow;
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

    /// <inheritdoc />
    public void GeneratePasswordResetToken()
    {
        GeneratePasswordResetToken(PasswordConstants.DefaultResetTokenExpiryHours);
    }

    /// <inheritdoc />
    public void GeneratePasswordResetToken(int expiryHours)
    {
        PasswordResetToken = PasswordResetTokenGenerator.GenerateToken();
        PasswordResetTokenExpiry = PasswordResetTokenGenerator.CalculateExpiry(expiryHours);
        UpdatedAt = DateTime.UtcNow;
    }

    /// <inheritdoc />
    public bool ValidatePasswordResetToken(string token)
    {
        return PasswordResetTokenGenerator.ValidateToken(PasswordResetToken, token, PasswordResetTokenExpiry);
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

    /// <inheritdoc />
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

    #region Refresh Token Management (for Invited Users)

    /// <summary>
    /// Sets the refresh token for invited users (users without MasterUser association).
    /// Only applicable when MasterUserId == Guid.Empty.
    /// </summary>
    public void SetRefreshToken(string token, DateTime expiryTime)
    {
        RefreshToken = token;
        RefreshTokenExpiryTime = expiryTime;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Validates the refresh token for invited users.
    /// </summary>
    public bool ValidateRefreshToken(string token)
    {
        return RefreshToken == token &&
               RefreshTokenExpiryTime.HasValue &&
               RefreshTokenExpiryTime.Value > DateTime.UtcNow;
    }

    /// <summary>
    /// Revokes the refresh token for invited users.
    /// </summary>
    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiryTime = null;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Checks if this user is an invited user (no MasterUser association).
    /// Invited users have their refresh token stored directly in TenantUser.
    /// </summary>
    public bool IsInvitedUser() => MasterUserId == Guid.Empty;

    #endregion

    #region Two-Factor Authentication

    /// <summary>
    /// Sets up two-factor authentication with a secret and backup codes
    /// </summary>
    public void SetupTwoFactor(string secret, string backupCodes)
    {
        if (string.IsNullOrWhiteSpace(secret))
            throw new ArgumentException("Secret cannot be empty.", nameof(secret));

        if (string.IsNullOrWhiteSpace(backupCodes))
            throw new ArgumentException("Backup codes cannot be empty.", nameof(backupCodes));

        TwoFactorSecret = secret;
        BackupCodes = backupCodes;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Enables two-factor authentication
    /// </summary>
    public void EnableTwoFactor(string secret)
    {
        if (TwoFactorEnabled)
            throw new InvalidOperationException("Two-factor authentication is already enabled.");

        TwoFactorEnabled = true;
        TwoFactorSecret = secret;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Disables two-factor authentication
    /// </summary>
    public void DisableTwoFactor()
    {
        if (!TwoFactorEnabled)
            throw new InvalidOperationException("Two-factor authentication is not enabled.");

        TwoFactorEnabled = false;
        TwoFactorSecret = null;
        BackupCodes = null;
        TwoFactorFailedAttempts = 0;
        TwoFactorLockoutEndAt = null;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Uses a backup code for authentication. Returns true if the code was valid.
    /// </summary>
    public bool UseBackupCode(string code)
    {
        if (string.IsNullOrEmpty(BackupCodes))
            return false;

        var codes = BackupCodes.Split(',')
            .Select(c => c.Trim())
            .Where(c => !string.IsNullOrEmpty(c))
            .ToList();

        // Find and remove the used code (case-insensitive)
        var normalizedCode = code.Replace(" ", "").Replace("-", "").ToUpperInvariant();
        var matchingCode = codes.FirstOrDefault(c =>
            c.Replace(" ", "").Replace("-", "").Equals(normalizedCode, StringComparison.OrdinalIgnoreCase));

        if (matchingCode == null)
            return false;

        // Remove the used code
        var updatedCodes = codes.Where(c => c != matchingCode).ToList();
        BackupCodes = string.Join(",", updatedCodes);
        UpdatedAt = DateTime.UtcNow;

        return true;
    }

    /// <summary>
    /// Records a failed 2FA attempt and applies lockout if threshold exceeded
    /// </summary>
    public void RecordFailedTwoFactorAttempt()
    {
        TwoFactorFailedAttempts++;
        UpdatedAt = DateTime.UtcNow;

        // Progressive lockout: 1 min after 3, 5 min after 6, 15 min after 9
        if (TwoFactorFailedAttempts >= 9)
        {
            TwoFactorLockoutEndAt = DateTime.UtcNow.AddMinutes(15);
        }
        else if (TwoFactorFailedAttempts >= 6)
        {
            TwoFactorLockoutEndAt = DateTime.UtcNow.AddMinutes(5);
        }
        else if (TwoFactorFailedAttempts >= 3)
        {
            TwoFactorLockoutEndAt = DateTime.UtcNow.AddMinutes(1);
        }
    }

    /// <summary>
    /// Records a successful 2FA verification and resets lockout counters
    /// </summary>
    public void RecordSuccessfulTwoFactorVerification()
    {
        TwoFactorFailedAttempts = 0;
        TwoFactorLockoutEndAt = null;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Checks if the user is locked out from 2FA attempts
    /// </summary>
    public bool IsTwoFactorLockedOut()
    {
        return TwoFactorLockoutEndAt.HasValue && TwoFactorLockoutEndAt.Value > DateTime.UtcNow;
    }

    /// <summary>
    /// Gets the remaining 2FA lockout time, or null if not locked out
    /// </summary>
    public TimeSpan? GetTwoFactorLockoutTimeRemaining()
    {
        if (!IsTwoFactorLockedOut())
            return null;

        return TwoFactorLockoutEndAt!.Value - DateTime.UtcNow;
    }

    /// <summary>
    /// Gets the count of remaining backup codes
    /// </summary>
    public int GetRemainingBackupCodesCount()
    {
        if (string.IsNullOrEmpty(BackupCodes))
            return 0;

        return BackupCodes.Split(',')
            .Select(c => c.Trim())
            .Count(c => !string.IsNullOrEmpty(c));
    }

    /// <summary>
    /// Regenerates backup codes (replaces existing ones)
    /// </summary>
    public void RegenerateBackupCodes(string newBackupCodes)
    {
        if (string.IsNullOrWhiteSpace(newBackupCodes))
            throw new ArgumentException("Backup codes cannot be empty.", nameof(newBackupCodes));

        BackupCodes = newBackupCodes;
        UpdatedAt = DateTime.UtcNow;
    }

    #endregion

    /// <summary>
    /// Marks the user account as deleted (soft delete).
    /// User will be terminated and all roles/permissions removed.
    /// </summary>
    public void Delete()
    {
        Terminate(DateTime.UtcNow);
    }
}