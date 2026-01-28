using Stocker.Domain.Master.Entities;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for managing user sessions, enabling features like:
/// - Concurrent session limits
/// - Logout from all devices
/// - Session tracking and management
/// </summary>
public interface ISessionManagementService
{
    /// <summary>
    /// Creates a new session for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="isMasterUser">True for MasterUser, false for TenantUser</param>
    /// <param name="tenantId">TenantId for TenantUser sessions</param>
    /// <param name="refreshToken">The refresh token to associate with this session</param>
    /// <param name="expiresAt">When the session expires</param>
    /// <param name="deviceId">Optional device identifier</param>
    /// <param name="deviceInfo">Optional device description</param>
    /// <param name="ipAddress">Optional IP address</param>
    /// <param name="maxConcurrentSessions">Maximum allowed concurrent sessions (0 = unlimited)</param>
    /// <returns>The created session</returns>
    Task<UserSession> CreateSessionAsync(
        Guid userId,
        bool isMasterUser,
        Guid? tenantId,
        string refreshToken,
        DateTime expiresAt,
        string? deviceId = null,
        string? deviceInfo = null,
        string? ipAddress = null,
        int maxConcurrentSessions = 5);

    /// <summary>
    /// Validates a refresh token and returns the associated session if valid
    /// </summary>
    Task<UserSession?> ValidateSessionAsync(string refreshToken);

    /// <summary>
    /// Updates session activity (called on token refresh)
    /// </summary>
    Task UpdateSessionActivityAsync(Guid sessionId, string? newRefreshToken = null, DateTime? newExpiresAt = null);

    /// <summary>
    /// Gets all active sessions for a user
    /// </summary>
    Task<List<UserSession>> GetUserSessionsAsync(Guid userId, bool isMasterUser);

    /// <summary>
    /// Revokes a specific session (single device logout)
    /// </summary>
    Task RevokeSessionAsync(Guid sessionId, string? reason = null);

    /// <summary>
    /// Revokes all sessions for a user (logout from all devices)
    /// </summary>
    Task RevokeAllSessionsAsync(Guid userId, bool isMasterUser, string? reason = null, Guid? exceptSessionId = null);

    /// <summary>
    /// Revokes session by refresh token
    /// </summary>
    Task RevokeSessionByTokenAsync(string refreshToken, string? reason = null);

    /// <summary>
    /// Gets the count of active sessions for a user
    /// </summary>
    Task<int> GetActiveSessionCountAsync(Guid userId, bool isMasterUser);

    /// <summary>
    /// Cleans up expired sessions
    /// </summary>
    Task CleanupExpiredSessionsAsync();
}
