using Stocker.Identity.Models;
using System.Security.Claims;

namespace Stocker.Identity.Services;

/// <summary>
/// Provides JWT token generation and validation services.
/// Handles both access tokens and refresh tokens for authentication.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Generates a JWT access token with the specified claims.
    /// </summary>
    /// <param name="claims">The claims to include in the token (user ID, roles, tenant context, etc.).</param>
    /// <returns>A signed JWT access token string.</returns>
    string GenerateAccessToken(IEnumerable<Claim> claims);

    /// <summary>
    /// Generates a cryptographically secure refresh token.
    /// </summary>
    /// <returns>A Base64-encoded refresh token string.</returns>
    string GenerateRefreshToken();

    /// <summary>
    /// Validates a JWT token and extracts the claims principal.
    /// </summary>
    /// <param name="token">The JWT token to validate.</param>
    /// <returns>The claims principal if valid; otherwise, null.</returns>
    ClaimsPrincipal? ValidateToken(string token);

    /// <summary>
    /// Gets the expiration time for new access tokens.
    /// </summary>
    /// <returns>The DateTime when newly generated access tokens will expire.</returns>
    DateTime GetAccessTokenExpiration();

    /// <summary>
    /// Gets the expiration time for new refresh tokens.
    /// </summary>
    /// <returns>The DateTime when newly generated refresh tokens will expire.</returns>
    DateTime GetRefreshTokenExpiration();
}