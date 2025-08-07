using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.Events;
using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class MasterUser : AggregateRoot
{
    private readonly List<ValueObjects.RefreshToken> _refreshTokens = new();
    private readonly List<UserTenant> _tenants = new();
    private readonly List<UserLoginHistory> _loginHistory = new();

    public string Username { get; private set; }
    public Email Email { get; private set; }
    public HashedPassword Password { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public PhoneNumber? PhoneNumber { get; private set; }
    public UserType UserType { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsEmailVerified { get; private set; }
    public bool TwoFactorEnabled { get; private set; }
    public string? TwoFactorSecret { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public DateTime? EmailVerifiedAt { get; private set; }
    public DateTime? PasswordChangedAt { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutEndAt { get; private set; }
    public string? ProfilePictureUrl { get; private set; }
    public string? Timezone { get; private set; }
    public string? PreferredLanguage { get; private set; }
    public IReadOnlyList<ValueObjects.RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();
    public IReadOnlyList<UserTenant> Tenants => _tenants.AsReadOnly();
    public IReadOnlyList<UserLoginHistory> LoginHistory => _loginHistory.AsReadOnly();

    private MasterUser() { } // EF Constructor

    private MasterUser(
        string username,
        Email email,
        HashedPassword password,
        string firstName,
        string lastName,
        UserType userType,
        PhoneNumber? phoneNumber = null)
    {
        Id = Guid.NewGuid();
        Username = username;
        Email = email;
        Password = password;
        FirstName = firstName;
        LastName = lastName;
        UserType = userType;
        PhoneNumber = phoneNumber;
        IsActive = false; // Start as inactive until activated
        IsEmailVerified = false;
        TwoFactorEnabled = false;
        CreatedAt = DateTime.UtcNow;
        FailedLoginAttempts = 0;
        PreferredLanguage = "en";
        Timezone = "UTC";

        RaiseDomainEvent(new MasterUserCreatedDomainEvent(Id, username, email.Value, userType));
    }

    public static MasterUser Create(
        string username,
        Email email,
        string plainPassword,
        string firstName,
        string lastName,
        UserType userType,
        PhoneNumber? phoneNumber = null)
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

        var hashedPassword = HashedPassword.Create(plainPassword);

        return new MasterUser(username, email, hashedPassword, firstName, lastName, userType, phoneNumber);
    }

    public static MasterUser Create(
        string username,
        Email email,
        string passwordHash,
        string firstName,
        string lastName,
        PhoneNumber? phoneNumber = null)
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

        var hashedPassword = HashedPassword.CreateFromHash(passwordHash);

        return new MasterUser(username, email, hashedPassword, firstName, lastName, UserType.Regular, phoneNumber);
    }

    public void Activate()
    {
        if (IsActive)
        {
            throw new InvalidOperationException("User is already active.");
        }

        IsActive = true;
        RaiseDomainEvent(new MasterUserActivatedDomainEvent(Id));
    }

    public void Deactivate()
    {
        if (!IsActive)
        {
            throw new InvalidOperationException("User is already inactive.");
        }

        IsActive = false;
    }

    public void VerifyEmail()
    {
        if (IsEmailVerified)
        {
            throw new InvalidOperationException("Email is already verified.");
        }

        IsEmailVerified = true;
        EmailVerifiedAt = DateTime.UtcNow;

        // Automatically activate user when email is verified
        if (!IsActive)
        {
            Activate();
        }
    }

    public void ChangePassword(string currentPassword, string newPassword)
    {
        if (!Password.Verify(currentPassword))
        {
            throw new InvalidOperationException("Current password is incorrect.");
        }

        Password = HashedPassword.Create(newPassword);
        PasswordChangedAt = DateTime.UtcNow;

        // Invalidate all refresh tokens on password change
        _refreshTokens.Clear();

        RaiseDomainEvent(new MasterUserPasswordChangedDomainEvent(Id));
    }

    public void ResetPassword(string newPassword)
    {
        Password = HashedPassword.Create(newPassword);
        PasswordChangedAt = DateTime.UtcNow;
        FailedLoginAttempts = 0;
        LockoutEndAt = null;

        // Invalidate all refresh tokens on password reset
        _refreshTokens.Clear();

        RaiseDomainEvent(new MasterUserPasswordResetDomainEvent(Id));
    }

    public void EnableTwoFactor(string secret)
    {
        if (TwoFactorEnabled)
        {
            throw new InvalidOperationException("Two-factor authentication is already enabled.");
        }

        TwoFactorEnabled = true;
        TwoFactorSecret = secret;
    }

    public void DisableTwoFactor()
    {
        if (!TwoFactorEnabled)
        {
            throw new InvalidOperationException("Two-factor authentication is not enabled.");
        }

        TwoFactorEnabled = false;
        TwoFactorSecret = null;
    }

    public ValueObjects.RefreshToken GenerateRefreshToken(string? deviceInfo = null, string? ipAddress = null)
    {
        var refreshToken = ValueObjects.RefreshToken.Create(30, deviceInfo, ipAddress);
        _refreshTokens.Add(refreshToken);

        // Keep only the last 5 refresh tokens per user
        if (_refreshTokens.Count > 5)
        {
            var tokensToRemove = _refreshTokens
                .OrderBy(t => t.CreatedAt)
                .Take(_refreshTokens.Count - 5)
                .ToList();

            foreach (var token in tokensToRemove)
            {
                _refreshTokens.Remove(token);
            }
        }

        return refreshToken;
    }

    public void RevokeRefreshToken(string token)
    {
        var refreshToken = _refreshTokens.FirstOrDefault(t => t.Token == token);
        if (refreshToken != null)
        {
            _refreshTokens.Remove(refreshToken);
        }
    }

    public void RevokeAllRefreshTokens()
    {
        _refreshTokens.Clear();
    }

    public bool ValidateRefreshToken(string token)
    {
        var refreshToken = _refreshTokens.FirstOrDefault(t => t.Token == token);
        return refreshToken != null && refreshToken.IsValid();
    }

    public void RecordSuccessfulLogin(string? ipAddress = null, string? userAgent = null)
    {
        LastLoginAt = DateTime.UtcNow;
        FailedLoginAttempts = 0;
        LockoutEndAt = null;

        _loginHistory.Add(new UserLoginHistory(Id, true, ipAddress, userAgent));

        // Keep only the last 20 login history records
        if (_loginHistory.Count > 20)
        {
            var recordsToRemove = _loginHistory
                .OrderBy(h => h.LoginAt)
                .Take(_loginHistory.Count - 20)
                .ToList();

            foreach (var record in recordsToRemove)
            {
                _loginHistory.Remove(record);
            }
        }
    }

    public void RecordFailedLogin(string? ipAddress = null, string? userAgent = null)
    {
        FailedLoginAttempts++;

        _loginHistory.Add(new UserLoginHistory(Id, false, ipAddress, userAgent));

        // Lock account after 5 failed attempts
        if (FailedLoginAttempts >= 5)
        {
            LockoutEndAt = DateTime.UtcNow.AddMinutes(30);
        }
    }

    public bool IsLockedOut()
    {
        return LockoutEndAt.HasValue && LockoutEndAt.Value > DateTime.UtcNow;
    }

    public void AssignToTenant(Guid tenantId, string role)
    {
        if (_tenants.Any(t => t.TenantId == tenantId))
        {
            throw new InvalidOperationException($"User is already assigned to tenant '{tenantId}'.");
        }

        _tenants.Add(new UserTenant(Id, tenantId, role));
    }

    public void RemoveFromTenant(Guid tenantId)
    {
        var userTenant = _tenants.FirstOrDefault(t => t.TenantId == tenantId);
        if (userTenant == null)
        {
            throw new InvalidOperationException($"User is not assigned to tenant '{tenantId}'.");
        }

        _tenants.Remove(userTenant);
    }

    public void UpdateProfile(
        string firstName,
        string lastName,
        PhoneNumber? phoneNumber = null,
        string? timezone = null,
        string? preferredLanguage = null)
    {
        FirstName = firstName;
        LastName = lastName;
        PhoneNumber = phoneNumber;
        
        if (!string.IsNullOrWhiteSpace(timezone))
        {
            Timezone = timezone;
        }

        if (!string.IsNullOrWhiteSpace(preferredLanguage))
        {
            PreferredLanguage = preferredLanguage;
        }
    }

    public void UpdateProfilePicture(string? profilePictureUrl)
    {
        ProfilePictureUrl = profilePictureUrl;
    }

    public string GetFullName() => $"{FirstName} {LastName}";

    public bool HasAccessToTenant(Guid tenantId)
    {
        return UserType == UserType.SystemAdmin || _tenants.Any(t => t.TenantId == tenantId);
    }

    // Helper methods for Identity layer
    public string PasswordHash => Password.Value;
    public string? RefreshToken => _refreshTokens.OrderByDescending(t => t.CreatedAt).FirstOrDefault()?.Token;
    public DateTime? RefreshTokenExpiryTime => _refreshTokens.OrderByDescending(t => t.CreatedAt).FirstOrDefault()?.ExpiresAt;

    public void SetRefreshToken(string token, DateTime expiryTime)
    {
        var refreshToken = ValueObjects.RefreshToken.Create(token, expiryTime);
        _refreshTokens.Add(refreshToken);
        
        // Keep only the last 5 refresh tokens per user
        if (_refreshTokens.Count > 5)
        {
            var tokensToRemove = _refreshTokens
                .OrderBy(t => t.CreatedAt)
                .Take(_refreshTokens.Count - 5)
                .ToList();

            foreach (var tok in tokensToRemove)
            {
                _refreshTokens.Remove(tok);
            }
        }
    }

    public void RevokeRefreshToken()
    {
        _refreshTokens.Clear();
    }

    public void UpdatePassword(string hashedPassword)
    {
        Password = HashedPassword.CreateFromHash(hashedPassword);
        PasswordChangedAt = DateTime.UtcNow;
        _refreshTokens.Clear();
    }

    public void AddTenant(Guid tenantId, bool isActive)
    {
        if (_tenants.Any(t => t.TenantId == tenantId))
        {
            return;
        }
        _tenants.Add(new UserTenant(Id, tenantId, isActive ? "User" : "Inactive"));
    }

    public IReadOnlyList<UserTenant> UserTenants => _tenants.AsReadOnly();
}