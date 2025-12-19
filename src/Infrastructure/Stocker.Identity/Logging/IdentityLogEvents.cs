namespace Stocker.Identity.Logging;

/// <summary>
/// Structured logging event IDs for the Identity library.
/// Event IDs are organized by category for easy filtering and monitoring.
/// </summary>
public static class IdentityLogEvents
{
    // ═══════════════════════════════════════════════════════════════════════
    // Authentication Events (1000-1099)
    // ═══════════════════════════════════════════════════════════════════════

    /// <summary>User authentication succeeded</summary>
    public const int AuthenticationSuccess = 1000;

    /// <summary>User authentication failed due to invalid credentials</summary>
    public const int AuthenticationFailed = 1001;

    /// <summary>User account is locked or disabled</summary>
    public const int AccountLocked = 1002;

    /// <summary>User logged out successfully</summary>
    public const int LogoutSuccess = 1003;

    /// <summary>Authentication attempt for non-existent user</summary>
    public const int UserNotFound = 1004;

    /// <summary>Account is inactive or pending activation</summary>
    public const int AccountInactive = 1005;

    // ═══════════════════════════════════════════════════════════════════════
    // Token Events (1100-1199)
    // ═══════════════════════════════════════════════════════════════════════

    /// <summary>JWT token generated successfully</summary>
    public const int TokenGenerated = 1100;

    /// <summary>JWT token validation failed</summary>
    public const int TokenValidationFailed = 1101;

    /// <summary>Refresh token used successfully</summary>
    public const int TokenRefreshed = 1102;

    /// <summary>Refresh token is invalid or expired</summary>
    public const int RefreshTokenInvalid = 1103;

    /// <summary>Token revoked successfully</summary>
    public const int TokenRevoked = 1104;

    /// <summary>JWT message received (debug level)</summary>
    public const int JwtMessageReceived = 1105;

    /// <summary>JWT token validated successfully</summary>
    public const int JwtTokenValidated = 1106;

    /// <summary>JWT authentication challenge issued</summary>
    public const int JwtChallenge = 1107;

    /// <summary>JWT forbidden response issued</summary>
    public const int JwtForbidden = 1108;

    // ═══════════════════════════════════════════════════════════════════════
    // Password Events (1200-1299)
    // ═══════════════════════════════════════════════════════════════════════

    /// <summary>Password hashed successfully</summary>
    public const int PasswordHashed = 1200;

    /// <summary>Password verification succeeded</summary>
    public const int PasswordVerified = 1201;

    /// <summary>Password verification failed</summary>
    public const int PasswordVerificationFailed = 1202;

    /// <summary>Password changed successfully</summary>
    public const int PasswordChanged = 1203;

    /// <summary>Password reset requested</summary>
    public const int PasswordResetRequested = 1204;

    /// <summary>Password reset completed</summary>
    public const int PasswordResetCompleted = 1205;

    /// <summary>Password validation failed (policy violation)</summary>
    public const int PasswordValidationFailed = 1206;

    /// <summary>Legacy password hash detected, needs rehash</summary>
    public const int LegacyPasswordHashDetected = 1207;

    /// <summary>Password rehashed with updated algorithm</summary>
    public const int PasswordRehashed = 1208;

    // ═══════════════════════════════════════════════════════════════════════
    // Registration Events (1300-1399)
    // ═══════════════════════════════════════════════════════════════════════

    /// <summary>User registration succeeded</summary>
    public const int RegistrationSuccess = 1300;

    /// <summary>User registration failed</summary>
    public const int RegistrationFailed = 1301;

    /// <summary>Email already exists during registration</summary>
    public const int EmailAlreadyExists = 1302;

    /// <summary>Username already exists during registration</summary>
    public const int UsernameAlreadyExists = 1303;

    /// <summary>Tenant user created successfully</summary>
    public const int TenantUserCreated = 1304;

    /// <summary>Tenant user creation failed</summary>
    public const int TenantUserCreationFailed = 1305;

    // ═══════════════════════════════════════════════════════════════════════
    // Two-Factor Authentication Events (1400-1499)
    // ═══════════════════════════════════════════════════════════════════════

    /// <summary>Two-factor authentication enabled</summary>
    public const int TwoFactorEnabled = 1400;

    /// <summary>Two-factor authentication disabled</summary>
    public const int TwoFactorDisabled = 1401;

    /// <summary>Two-factor code verified successfully</summary>
    public const int TwoFactorVerified = 1402;

    /// <summary>Two-factor code verification failed</summary>
    public const int TwoFactorVerificationFailed = 1403;

    /// <summary>Recovery code used</summary>
    public const int RecoveryCodeUsed = 1404;

    // ═══════════════════════════════════════════════════════════════════════
    // Session Events (1500-1599)
    // ═══════════════════════════════════════════════════════════════════════

    /// <summary>User session created</summary>
    public const int SessionCreated = 1500;

    /// <summary>User session terminated</summary>
    public const int SessionTerminated = 1501;

    /// <summary>User session expired</summary>
    public const int SessionExpired = 1502;

    /// <summary>All user sessions terminated</summary>
    public const int AllSessionsTerminated = 1503;

    // ═══════════════════════════════════════════════════════════════════════
    // Security Events (1600-1699)
    // ═══════════════════════════════════════════════════════════════════════

    /// <summary>Suspicious login attempt detected</summary>
    public const int SuspiciousLoginAttempt = 1600;

    /// <summary>Account lockout triggered</summary>
    public const int AccountLockoutTriggered = 1601;

    /// <summary>Account unlocked</summary>
    public const int AccountUnlocked = 1602;

    /// <summary>Password brute force attempt detected</summary>
    public const int BruteForceAttemptDetected = 1603;

    /// <summary>Security token generated</summary>
    public const int SecurityTokenGenerated = 1604;

    // ═══════════════════════════════════════════════════════════════════════
    // Configuration Events (1700-1799)
    // ═══════════════════════════════════════════════════════════════════════

    /// <summary>Identity services configured</summary>
    public const int IdentityServicesConfigured = 1700;

    /// <summary>JWT configuration loaded</summary>
    public const int JwtConfigurationLoaded = 1701;

    /// <summary>Identity configuration error</summary>
    public const int ConfigurationError = 1702;

    // ═══════════════════════════════════════════════════════════════════════
    // Error Events (1900-1999)
    // ═══════════════════════════════════════════════════════════════════════

    /// <summary>Unexpected error during authentication</summary>
    public const int AuthenticationError = 1900;

    /// <summary>Unexpected error during token operation</summary>
    public const int TokenError = 1901;

    /// <summary>Unexpected error during password operation</summary>
    public const int PasswordError = 1902;

    /// <summary>Unexpected error during registration</summary>
    public const int RegistrationError = 1903;

    /// <summary>Unexpected error during session operation</summary>
    public const int SessionError = 1904;

    /// <summary>Generic identity service error</summary>
    public const int IdentityServiceError = 1999;
}
