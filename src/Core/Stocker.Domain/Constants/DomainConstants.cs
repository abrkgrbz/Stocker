namespace Stocker.Domain.Constants;

/// <summary>
/// Domain-wide constants used across entities
/// </summary>
public static class DomainConstants
{
    /// <summary>
    /// System user identifier for automated operations
    /// </summary>
    public const string SystemUser = "System";

    /// <summary>
    /// Default theme preset name
    /// </summary>
    public const string DefaultTheme = "default";

    /// <summary>
    /// Default profile name for security settings
    /// </summary>
    public const string DefaultProfile = "Default";

    /// <summary>
    /// Placeholder password hash for pending activation users
    /// This value cannot be used for actual login authentication
    /// </summary>
    public const string PendingActivationPasswordPlaceholder = "PENDING_ACTIVATION";
}

/// <summary>
/// Password-related constants
/// </summary>
public static class PasswordConstants
{
    /// <summary>
    /// Default password reset token expiry in hours
    /// </summary>
    public const int DefaultResetTokenExpiryHours = 24;

    /// <summary>
    /// Extended token expiry for invitation flow in days
    /// </summary>
    public const int InvitationTokenExpiryDays = 7;

    /// <summary>
    /// Number of previous passwords to check for reuse
    /// </summary>
    public const int PasswordHistoryCount = 5;

    /// <summary>
    /// Minimum password length
    /// </summary>
    public const int MinPasswordLength = 8;

    /// <summary>
    /// Maximum failed login attempts before lockout
    /// </summary>
    public const int MaxFailedLoginAttempts = 5;

    /// <summary>
    /// Account lockout duration in minutes
    /// </summary>
    public const int LockoutDurationMinutes = 15;
}

/// <summary>
/// Token-related constants
/// </summary>
public static class TokenConstants
{
    /// <summary>
    /// Length of generated tokens (Base64 encoded)
    /// </summary>
    public const int TokenByteLength = 32;

    /// <summary>
    /// Email verification token expiry in hours
    /// </summary>
    public const int EmailVerificationExpiryHours = 48;

    /// <summary>
    /// Refresh token expiry in days
    /// </summary>
    public const int RefreshTokenExpiryDays = 7;
}
