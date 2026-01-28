namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for sending login notifications to users when a new device or location is detected.
/// </summary>
public interface ILoginNotificationService
{
    /// <summary>
    /// Checks if this is a new device/location and sends notification if needed.
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="email">User's email address</param>
    /// <param name="isMasterUser">True for MasterUser, false for TenantUser</param>
    /// <param name="deviceId">Device identifier (fingerprint/user-agent hash)</param>
    /// <param name="deviceInfo">Human-readable device info (e.g., "Chrome on Windows")</param>
    /// <param name="ipAddress">IP address of the login</param>
    /// <param name="location">Geo-location if available</param>
    /// <returns>True if notification was sent (new device/location), false otherwise</returns>
    Task<bool> CheckAndNotifyAsync(
        Guid userId,
        string email,
        bool isMasterUser,
        string? deviceId,
        string? deviceInfo,
        string? ipAddress,
        string? location);

    /// <summary>
    /// Gets the location from an IP address (if geolocation service is available).
    /// </summary>
    Task<string?> GetLocationFromIpAsync(string ipAddress);

    /// <summary>
    /// Parses User-Agent to get a human-readable device description.
    /// </summary>
    string ParseUserAgent(string userAgent);
}
