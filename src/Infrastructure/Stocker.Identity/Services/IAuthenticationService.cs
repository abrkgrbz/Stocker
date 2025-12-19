using Stocker.Identity.Models;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;

namespace Stocker.Identity.Services;

/// <summary>
/// Provides authentication services for the Stocker application.
/// Supports both Master users (system/tenant administrators) and Tenant users.
/// </summary>
public interface IAuthenticationService
{
    /// <summary>
    /// Authenticates a user with the provided credentials.
    /// </summary>
    /// <param name="request">The login request containing username, password, and optional tenant context.</param>
    /// <returns>Authentication result with tokens and user information on success.</returns>
    Task<AuthenticationResult> LoginAsync(LoginRequest request);

    /// <summary>
    /// Refreshes an expired access token using a valid refresh token.
    /// </summary>
    /// <param name="request">The refresh token request containing the expired access token and refresh token.</param>
    /// <returns>Authentication result with new tokens on success.</returns>
    Task<AuthenticationResult> RefreshTokenAsync(RefreshTokenRequest request);

    /// <summary>
    /// Registers a new master user (tenant administrator).
    /// </summary>
    /// <param name="request">The registration request containing user details.</param>
    /// <returns>Authentication result with tokens for the newly created user on success.</returns>
    Task<AuthenticationResult> RegisterMasterUserAsync(RegisterRequest request);

    /// <summary>
    /// Registers a new tenant user within a specific tenant context.
    /// </summary>
    /// <param name="request">The registration request containing user details.</param>
    /// <param name="tenantId">The tenant identifier to associate the user with.</param>
    /// <returns>Authentication result with tokens for the newly created user on success.</returns>
    Task<AuthenticationResult> RegisterTenantUserAsync(RegisterRequest request, Guid tenantId);

    /// <summary>
    /// Changes the password for an existing user.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <param name="request">The change password request containing current and new passwords.</param>
    /// <returns>True if password was changed successfully; otherwise, false.</returns>
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);

    /// <summary>
    /// Revokes the refresh token for a user, effectively logging them out of all sessions.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <returns>True if the refresh token was revoked successfully; otherwise, false.</returns>
    Task<bool> RevokeRefreshTokenAsync(Guid userId);

    /// <summary>
    /// Generates an authentication response for a master user by their identifier.
    /// Used for internal authentication flows such as tenant creation.
    /// </summary>
    /// <param name="userId">The master user identifier.</param>
    /// <param name="cancellationToken">Cancellation token for the operation.</param>
    /// <returns>A result containing the authentication response on success.</returns>
    Task<Result<AuthResponse>> GenerateAuthResponseForMasterUserAsync(Guid userId, CancellationToken cancellationToken = default);
}