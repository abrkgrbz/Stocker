using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using System.Security.Cryptography;
using System.Text;

namespace Stocker.Identity.Services;

/// <summary>
/// Service for managing user sessions, concurrent session limits, and logout functionality
/// </summary>
public class SessionManagementService : ISessionManagementService
{
    private readonly IMasterDbContext _masterContext;
    private readonly ILogger<SessionManagementService> _logger;

    public SessionManagementService(
        IMasterDbContext masterContext,
        ILogger<SessionManagementService> logger)
    {
        _masterContext = masterContext;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<UserSession> CreateSessionAsync(
        Guid userId,
        bool isMasterUser,
        Guid? tenantId,
        string refreshToken,
        DateTime expiresAt,
        string? deviceId = null,
        string? deviceInfo = null,
        string? ipAddress = null,
        int maxConcurrentSessions = 5)
    {
        // Hash the refresh token for storage
        var tokenHash = HashToken(refreshToken);

        // Check concurrent session limit
        if (maxConcurrentSessions > 0)
        {
            var activeSessionCount = await GetActiveSessionCountAsync(userId, isMasterUser);

            if (activeSessionCount >= maxConcurrentSessions)
            {
                // Revoke the oldest session to make room for the new one
                var oldestSession = await _masterContext.UserSessions
                    .Where(s => s.UserId == userId &&
                                s.IsMasterUser == isMasterUser &&
                                !s.IsRevoked &&
                                s.ExpiresAt > DateTime.UtcNow)
                    .OrderBy(s => s.LastActivityAt)
                    .FirstOrDefaultAsync();

                if (oldestSession != null)
                {
                    oldestSession.Revoke("Exceeded concurrent session limit");
                    _logger.LogInformation(
                        "Revoked oldest session {SessionId} for user {UserId} due to concurrent session limit",
                        oldestSession.Id, userId);
                }
            }
        }

        // Create new session
        UserSession session;
        if (isMasterUser)
        {
            session = UserSession.CreateForMasterUser(
                userId,
                tokenHash,
                expiresAt,
                deviceId,
                deviceInfo,
                ipAddress);
        }
        else
        {
            session = UserSession.CreateForTenantUser(
                userId,
                tenantId!.Value,
                tokenHash,
                expiresAt,
                deviceId,
                deviceInfo,
                ipAddress);
        }

        _masterContext.UserSessions.Add(session);
        await _masterContext.SaveChangesAsync();

        _logger.LogInformation(
            "Created session {SessionId} for {UserType} user {UserId}",
            session.Id, isMasterUser ? "Master" : "Tenant", userId);

        return session;
    }

    /// <inheritdoc />
    public async Task<UserSession?> ValidateSessionAsync(string refreshToken)
    {
        var tokenHash = HashToken(refreshToken);

        var session = await _masterContext.UserSessions
            .Where(s => s.RefreshTokenHash == tokenHash && !s.IsRevoked && s.ExpiresAt > DateTime.UtcNow)
            .FirstOrDefaultAsync();

        if (session == null)
        {
            _logger.LogDebug("No valid session found for provided refresh token");
            return null;
        }

        return session;
    }

    /// <inheritdoc />
    public async Task UpdateSessionActivityAsync(Guid sessionId, string? newRefreshToken = null, DateTime? newExpiresAt = null)
    {
        var session = await _masterContext.UserSessions.FindAsync(sessionId);
        if (session == null)
        {
            _logger.LogWarning("Session {SessionId} not found for activity update", sessionId);
            return;
        }

        var newTokenHash = newRefreshToken != null ? HashToken(newRefreshToken) : null;
        session.UpdateActivity(newTokenHash, newExpiresAt);

        await _masterContext.SaveChangesAsync();

        _logger.LogDebug("Updated activity for session {SessionId}", sessionId);
    }

    /// <inheritdoc />
    public async Task<List<UserSession>> GetUserSessionsAsync(Guid userId, bool isMasterUser)
    {
        return await _masterContext.UserSessions
            .Where(s => s.UserId == userId &&
                        s.IsMasterUser == isMasterUser &&
                        !s.IsRevoked &&
                        s.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(s => s.LastActivityAt)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task RevokeSessionAsync(Guid sessionId, string? reason = null)
    {
        var session = await _masterContext.UserSessions.FindAsync(sessionId);
        if (session == null)
        {
            _logger.LogWarning("Session {SessionId} not found for revocation", sessionId);
            return;
        }

        session.Revoke(reason);
        await _masterContext.SaveChangesAsync();

        _logger.LogInformation("Revoked session {SessionId}: {Reason}", sessionId, reason ?? "User request");
    }

    /// <inheritdoc />
    public async Task RevokeAllSessionsAsync(Guid userId, bool isMasterUser, string? reason = null, Guid? exceptSessionId = null)
    {
        var sessions = await _masterContext.UserSessions
            .Where(s => s.UserId == userId &&
                        s.IsMasterUser == isMasterUser &&
                        !s.IsRevoked)
            .ToListAsync();

        var revokedCount = 0;
        foreach (var session in sessions)
        {
            if (exceptSessionId.HasValue && session.Id == exceptSessionId.Value)
                continue;

            session.Revoke(reason ?? "Logout from all devices");
            revokedCount++;
        }

        await _masterContext.SaveChangesAsync();

        _logger.LogInformation(
            "Revoked {Count} sessions for {UserType} user {UserId}: {Reason}",
            revokedCount, isMasterUser ? "Master" : "Tenant", userId, reason ?? "Logout from all devices");
    }

    /// <inheritdoc />
    public async Task RevokeSessionByTokenAsync(string refreshToken, string? reason = null)
    {
        var tokenHash = HashToken(refreshToken);

        var session = await _masterContext.UserSessions
            .Where(s => s.RefreshTokenHash == tokenHash && !s.IsRevoked)
            .FirstOrDefaultAsync();

        if (session == null)
        {
            _logger.LogDebug("No session found for provided refresh token during revocation");
            return;
        }

        session.Revoke(reason);
        await _masterContext.SaveChangesAsync();

        _logger.LogInformation("Revoked session {SessionId} by token: {Reason}", session.Id, reason ?? "Token revocation");
    }

    /// <inheritdoc />
    public async Task<int> GetActiveSessionCountAsync(Guid userId, bool isMasterUser)
    {
        return await _masterContext.UserSessions
            .CountAsync(s => s.UserId == userId &&
                            s.IsMasterUser == isMasterUser &&
                            !s.IsRevoked &&
                            s.ExpiresAt > DateTime.UtcNow);
    }

    /// <inheritdoc />
    public async Task CleanupExpiredSessionsAsync()
    {
        var expiredSessions = await _masterContext.UserSessions
            .Where(s => s.ExpiresAt < DateTime.UtcNow || s.IsRevoked)
            .Where(s => s.ExpiresAt < DateTime.UtcNow.AddDays(-7)) // Keep revoked sessions for 7 days for audit
            .ToListAsync();

        if (expiredSessions.Any())
        {
            _masterContext.UserSessions.RemoveRange(expiredSessions);
            await _masterContext.SaveChangesAsync();

            _logger.LogInformation("Cleaned up {Count} expired/revoked sessions", expiredSessions.Count);
        }
    }

    /// <summary>
    /// Creates a SHA256 hash of the token for secure storage
    /// </summary>
    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }
}
