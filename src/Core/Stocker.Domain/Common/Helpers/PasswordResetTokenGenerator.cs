using System.Security.Cryptography;
using Stocker.Domain.Constants;

namespace Stocker.Domain.Common.Helpers;

/// <summary>
/// Helper class for generating secure password reset tokens.
/// Used by MasterUser and TenantUser to avoid code duplication.
/// </summary>
public static class PasswordResetTokenGenerator
{
    /// <summary>
    /// Generates a cryptographically secure URL-safe token
    /// </summary>
    /// <returns>URL-safe Base64 encoded token</returns>
    public static string GenerateToken()
    {
        var bytes = new byte[TokenConstants.TokenByteLength];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }

        // Convert to URL-safe Base64
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    /// <summary>
    /// Calculates the token expiry date
    /// </summary>
    /// <param name="hours">Number of hours until expiry</param>
    /// <returns>UTC DateTime when token expires</returns>
    public static DateTime CalculateExpiry(int hours = PasswordConstants.DefaultResetTokenExpiryHours)
    {
        return DateTime.UtcNow.AddHours(hours);
    }

    /// <summary>
    /// Calculates the token expiry date in days (for invitation flows)
    /// </summary>
    /// <param name="days">Number of days until expiry</param>
    /// <returns>UTC DateTime when token expires</returns>
    public static DateTime CalculateExpiryInDays(int days = PasswordConstants.InvitationTokenExpiryDays)
    {
        return DateTime.UtcNow.AddDays(days);
    }

    /// <summary>
    /// Validates if a token matches and hasn't expired
    /// </summary>
    /// <param name="storedToken">The stored token to compare against</param>
    /// <param name="providedToken">The token provided by the user</param>
    /// <param name="expiry">The token expiry date</param>
    /// <returns>True if token is valid and not expired</returns>
    public static bool ValidateToken(string? storedToken, string providedToken, DateTime? expiry)
    {
        return storedToken == providedToken &&
               expiry.HasValue &&
               expiry.Value > DateTime.UtcNow;
    }
}
