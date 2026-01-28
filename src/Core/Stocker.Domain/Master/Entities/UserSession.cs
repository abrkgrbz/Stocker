using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Represents an active user session for session management.
/// Tracks devices, locations, and enables logout all functionality.
/// </summary>
public sealed class UserSession : Entity
{
    /// <summary>
    /// The user this session belongs to
    /// </summary>
    public Guid UserId { get; private set; }

    /// <summary>
    /// Whether this is a MasterUser (true) or TenantUser (false)
    /// </summary>
    public bool IsMasterUser { get; private set; }

    /// <summary>
    /// TenantId for TenantUser sessions (null for MasterUser)
    /// </summary>
    public Guid? TenantId { get; private set; }

    /// <summary>
    /// The refresh token associated with this session (hashed)
    /// </summary>
    public string RefreshTokenHash { get; private set; }

    /// <summary>
    /// Device/browser identifier (User-Agent hash or device fingerprint)
    /// </summary>
    public string? DeviceId { get; private set; }

    /// <summary>
    /// Human-readable device description (e.g., "Chrome on Windows")
    /// </summary>
    public string? DeviceInfo { get; private set; }

    /// <summary>
    /// IP address of the session
    /// </summary>
    public string? IpAddress { get; private set; }

    /// <summary>
    /// Geolocation info if available (e.g., "Istanbul, Turkey")
    /// </summary>
    public string? Location { get; private set; }

    /// <summary>
    /// When this session was created (first login)
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// When this session was last active (last token refresh)
    /// </summary>
    public DateTime LastActivityAt { get; private set; }

    /// <summary>
    /// When this session expires
    /// </summary>
    public DateTime ExpiresAt { get; private set; }

    /// <summary>
    /// Whether this session has been revoked
    /// </summary>
    public bool IsRevoked { get; private set; }

    /// <summary>
    /// When this session was revoked (if revoked)
    /// </summary>
    public DateTime? RevokedAt { get; private set; }

    /// <summary>
    /// Reason for revocation (if revoked)
    /// </summary>
    public string? RevokedReason { get; private set; }

    private UserSession() { } // EF Constructor

    private UserSession(
        Guid userId,
        bool isMasterUser,
        Guid? tenantId,
        string refreshTokenHash,
        string? deviceId,
        string? deviceInfo,
        string? ipAddress,
        DateTime expiresAt)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        IsMasterUser = isMasterUser;
        TenantId = tenantId;
        RefreshTokenHash = refreshTokenHash;
        DeviceId = deviceId;
        DeviceInfo = deviceInfo;
        IpAddress = ipAddress;
        CreatedAt = DateTime.UtcNow;
        LastActivityAt = DateTime.UtcNow;
        ExpiresAt = expiresAt;
        IsRevoked = false;
    }

    /// <summary>
    /// Creates a new session for a MasterUser
    /// </summary>
    public static UserSession CreateForMasterUser(
        Guid userId,
        string refreshTokenHash,
        DateTime expiresAt,
        string? deviceId = null,
        string? deviceInfo = null,
        string? ipAddress = null)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("UserId cannot be empty", nameof(userId));

        if (string.IsNullOrWhiteSpace(refreshTokenHash))
            throw new ArgumentException("RefreshTokenHash cannot be empty", nameof(refreshTokenHash));

        return new UserSession(
            userId,
            isMasterUser: true,
            tenantId: null,
            refreshTokenHash,
            deviceId,
            deviceInfo,
            ipAddress,
            expiresAt);
    }

    /// <summary>
    /// Creates a new session for a TenantUser
    /// </summary>
    public static UserSession CreateForTenantUser(
        Guid userId,
        Guid tenantId,
        string refreshTokenHash,
        DateTime expiresAt,
        string? deviceId = null,
        string? deviceInfo = null,
        string? ipAddress = null)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("UserId cannot be empty", nameof(userId));

        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId cannot be empty for TenantUser session", nameof(tenantId));

        if (string.IsNullOrWhiteSpace(refreshTokenHash))
            throw new ArgumentException("RefreshTokenHash cannot be empty", nameof(refreshTokenHash));

        return new UserSession(
            userId,
            isMasterUser: false,
            tenantId,
            refreshTokenHash,
            deviceId,
            deviceInfo,
            ipAddress,
            expiresAt);
    }

    /// <summary>
    /// Updates the session activity timestamp and optionally the refresh token
    /// </summary>
    public void UpdateActivity(string? newRefreshTokenHash = null, DateTime? newExpiresAt = null)
    {
        LastActivityAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(newRefreshTokenHash))
        {
            RefreshTokenHash = newRefreshTokenHash;
        }

        if (newExpiresAt.HasValue)
        {
            ExpiresAt = newExpiresAt.Value;
        }
    }

    /// <summary>
    /// Updates location information for the session
    /// </summary>
    public void UpdateLocation(string? ipAddress, string? location)
    {
        IpAddress = ipAddress;
        Location = location;
        LastActivityAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Revokes this session (logout)
    /// </summary>
    public void Revoke(string? reason = null)
    {
        IsRevoked = true;
        RevokedAt = DateTime.UtcNow;
        RevokedReason = reason ?? "User logout";
    }

    /// <summary>
    /// Checks if the session is valid (not expired and not revoked)
    /// </summary>
    public bool IsValid()
    {
        return !IsRevoked && ExpiresAt > DateTime.UtcNow;
    }

    /// <summary>
    /// Checks if this is the current device
    /// </summary>
    public bool IsCurrentDevice(string? deviceId)
    {
        if (string.IsNullOrWhiteSpace(deviceId) || string.IsNullOrWhiteSpace(DeviceId))
            return false;

        return DeviceId == deviceId;
    }
}
