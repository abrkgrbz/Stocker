namespace Stocker.Domain.Common.Interfaces;

/// <summary>
/// Interface for entities that support password reset functionality.
/// Implemented by MasterUser and TenantUser to share password reset logic.
/// </summary>
public interface IPasswordResettable
{
    /// <summary>
    /// The password reset token (URL-safe Base64 encoded)
    /// </summary>
    string? PasswordResetToken { get; }

    /// <summary>
    /// When the password reset token expires
    /// </summary>
    DateTime? PasswordResetTokenExpiry { get; }

    /// <summary>
    /// Generates a new password reset token with default expiry (1 hour)
    /// </summary>
    void GeneratePasswordResetToken();

    /// <summary>
    /// Generates a new password reset token with custom expiry
    /// </summary>
    /// <param name="expiryHours">Number of hours until token expires</param>
    void GeneratePasswordResetToken(int expiryHours);

    /// <summary>
    /// Validates if the provided token matches and hasn't expired
    /// </summary>
    /// <param name="token">Token to validate</param>
    /// <returns>True if token is valid and not expired</returns>
    bool ValidatePasswordResetToken(string token);

    /// <summary>
    /// Clears the password reset token without changing the password
    /// </summary>
    void ClearPasswordResetToken();
}
