using Stocker.Domain.Common.Helpers;
using Stocker.Domain.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Constants;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.Events;
using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class MasterUser : AggregateRoot, IPasswordResettable
{
    private readonly List<ValueObjects.RefreshToken> _refreshTokens = new();

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
    public string? BackupCodes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public DateTime? EmailVerifiedAt { get; private set; }
    public DateTime? PasswordChangedAt { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutEndAt { get; private set; }
    public int TwoFactorFailedAttempts { get; private set; }
    public DateTime? TwoFactorLockoutEndAt { get; private set; }
    public string? ProfilePictureUrl { get; private set; }
    public string? Timezone { get; private set; }
    public string? PreferredLanguage { get; private set; }
    public EmailVerificationToken? EmailVerificationToken { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }
    public IReadOnlyList<ValueObjects.RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();
    // LoginHistory has been consolidated into SecurityAuditLog
    // Use ISecurityAuditService.GetAuditLogsAsync(userId) to retrieve login history

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
        PreferredLanguage = "tr";
        Timezone = "UTC+3 (Istanbul)";

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

    public static MasterUser CreateFromHash(
        string username,
        Email email,
        string passwordHash,
        string firstName,
        string lastName,
        UserType userType = UserType.Personel,
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

        return new MasterUser(username, email, hashedPassword, firstName, lastName, userType, phoneNumber);
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

    public EmailVerificationToken GenerateEmailVerificationToken()
    {
        EmailVerificationToken = EmailVerificationToken.Create();
        return EmailVerificationToken;
    }

    public bool ValidateEmailVerificationToken(string token)
    {
        if (EmailVerificationToken == null)
            return false;

        return EmailVerificationToken.Token == token && EmailVerificationToken.IsValid();
    }

    public void VerifyEmail(string? token = null)
    {
        if (IsEmailVerified)
        {
            throw new InvalidOperationException("Email is already verified.");
        }

        // If token is provided, validate it
        if (token != null)
        {
            if (!ValidateEmailVerificationToken(token))
            {
                throw new InvalidOperationException("Invalid or expired verification token.");
            }

            EmailVerificationToken?.MarkAsUsed();
        }

        IsEmailVerified = true;
        EmailVerifiedAt = DateTime.UtcNow;

        // Automatically activate user when email is verified
        if (!IsActive)
        {
            Activate();
        }
    }

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
    }

    /// <inheritdoc />
    public bool ValidatePasswordResetToken(string token)
    {
        return PasswordResetTokenGenerator.ValidateToken(PasswordResetToken, token, PasswordResetTokenExpiry);
    }

    public void ResetPassword(string newPassword, string resetToken)
    {
        if (!ValidatePasswordResetToken(resetToken))
        {
            throw new InvalidOperationException("Invalid or expired password reset token.");
        }

        Password = HashedPassword.Create(newPassword);
        PasswordChangedAt = DateTime.UtcNow;
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;

        // Clear all refresh tokens for security
        RevokeAllRefreshTokens();
    }

    /// <inheritdoc />
    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
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

    public void SetupTwoFactor(string secret, string backupCodes)
    {
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new ArgumentException("Secret cannot be empty.", nameof(secret));
        }

        if (string.IsNullOrWhiteSpace(backupCodes))
        {
            throw new ArgumentException("Backup codes cannot be empty.", nameof(backupCodes));
        }

        TwoFactorSecret = secret;
        BackupCodes = backupCodes;
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
        BackupCodes = null;
    }

    public bool UseBackupCode(string code)
    {
        if (string.IsNullOrEmpty(BackupCodes))
            return false;

        var codes = BackupCodes.Split(',')
            .Select(c => c.Split(':'))
            .Where(parts => parts.Length == 2)
            .Select(parts => new { Code = parts[0], Used = bool.Parse(parts[1]) })
            .ToList();

        var matchingCode = codes.FirstOrDefault(c => c.Code == code && !c.Used);
        if (matchingCode == null)
            return false;

        // Mark backup code as used
        var updatedCodes = codes.Select(c =>
            c.Code == code ? $"{c.Code}:true" : $"{c.Code}:{c.Used}"
        ).ToList();

        BackupCodes = string.Join(",", updatedCodes);
        return true;
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

        // Login history is now tracked via SecurityAuditLog at handler level
        // See LoginCommandHandler for SecurityAuditService.LogAuthEventAsync usage
    }

    public void RecordFailedLogin(string? ipAddress = null, string? userAgent = null)
    {
        FailedLoginAttempts++;

        // Login history is now tracked via SecurityAuditLog at handler level
        // See LoginCommandHandler for SecurityAuditService.LogAuthEventAsync usage

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

    public void RecordFailedTwoFactorAttempt()
    {
        TwoFactorFailedAttempts++;

        // Exponential backoff: 3 attempts = 1 min, 6 attempts = 5 min, 9+ attempts = 15 min
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

    public void RecordSuccessfulTwoFactorVerification()
    {
        TwoFactorFailedAttempts = 0;
        TwoFactorLockoutEndAt = null;
    }

    public bool IsTwoFactorLockedOut()
    {
        return TwoFactorLockoutEndAt.HasValue && TwoFactorLockoutEndAt.Value > DateTime.UtcNow;
    }

    public TimeSpan? GetTwoFactorLockoutTimeRemaining()
    {
        if (!IsTwoFactorLockedOut())
            return null;

        return TwoFactorLockoutEndAt!.Value - DateTime.UtcNow;
    }

    public void AssignToTenant(Guid tenantId, UserType userType)
    {
        // No-op: UserTenant management moved to Tenant domain
    }

    public void RemoveFromTenant(Guid tenantId)
    {
        // No-op: UserTenant management moved to Tenant domain
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
        // System administrators have access to all tenants
        // Other users' tenant access is managed in Tenant domain
        return UserType == UserType.SistemYoneticisi;
    }

    // Helper methods for Identity layer
    public string PasswordHash => Password.Hash;
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

    /// <summary>
    /// Marks the user account as deleted (soft delete).
    /// Deactivates the account and revokes all tokens.
    /// </summary>
    public void Delete()
    {
        IsActive = false;
        IsEmailVerified = false;
        TwoFactorEnabled = false;
        TwoFactorSecret = null;
        BackupCodes = null;
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        EmailVerificationToken = null;

        // Revoke all tokens for security
        RevokeAllRefreshTokens();
    }

    /// <summary>
    /// Verifies the password for account deletion confirmation.
    /// </summary>
    public bool VerifyPassword(string password)
    {
        return Password.Verify(password);
    }
}