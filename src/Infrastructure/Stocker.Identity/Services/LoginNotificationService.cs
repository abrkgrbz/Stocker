using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Identity.Services;

/// <summary>
/// Service for sending login notifications when new devices or locations are detected.
/// Uses IServiceScopeFactory to create new DbContext instances for fire-and-forget operations,
/// avoiding DbContext concurrency issues.
/// </summary>
public class LoginNotificationService : ILoginNotificationService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<LoginNotificationService> _logger;

    public LoginNotificationService(
        IServiceScopeFactory serviceScopeFactory,
        IHttpClientFactory httpClientFactory,
        ILogger<LoginNotificationService> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<bool> CheckAndNotifyAsync(
        Guid userId,
        string email,
        bool isMasterUser,
        string? deviceId,
        string? deviceInfo,
        string? ipAddress,
        string? location)
    {
        try
        {
            // Create a new scope for fire-and-forget operations to avoid DbContext concurrency issues
            // This is critical because this method is called with fire-and-forget pattern (_ = CheckAndNotifyAsync(...))
            // and the parent scope's DbContext might still be in use
            using var scope = _serviceScopeFactory.CreateScope();
            var masterContext = scope.ServiceProvider.GetRequiredService<IMasterDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            // Check if this device/IP has been seen before for this user
            var existingSession = await masterContext.UserSessions
                .Where(s => s.UserId == userId &&
                           s.IsMasterUser == isMasterUser &&
                           !s.IsRevoked)
                .Where(s => (deviceId != null && s.DeviceId == deviceId) ||
                           (ipAddress != null && s.IpAddress == ipAddress))
                .AnyAsync();

            if (existingSession)
            {
                // Known device/location, no notification needed
                _logger.LogDebug("Known device/location for user {UserId}, skipping notification", userId);
                return false;
            }

            // New device or location detected - send notification
            await SendNewLoginNotificationAsync(emailService, email, deviceInfo, ipAddress, location);

            _logger.LogInformation(
                "New login notification sent to {Email} for user {UserId} from {IpAddress}",
                email, userId, ipAddress ?? "unknown IP");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking/sending login notification for user {UserId}", userId);
            // Don't block login if notification fails
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<string?> GetLocationFromIpAsync(string ipAddress)
    {
        try
        {
            // Skip for empty or null IPs
            if (string.IsNullOrEmpty(ipAddress))
            {
                return null;
            }

            // Normalize IPv6-mapped IPv4 addresses
            var normalizedIp = NormalizeIpAddress(ipAddress);

            // Skip for local/private IPs
            if (IsPrivateOrLocalIp(normalizedIp))
            {
                return "Yerel Ağ";
            }

            // Use ip-api.com free service (rate limit: 45 requests per minute)
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(5); // Quick timeout for non-blocking operation

            var response = await client.GetFromJsonAsync<IpApiResponse>(
                $"http://ip-api.com/json/{normalizedIp}?fields=status,city,regionName,country");

            if (response?.Status == "success" && !string.IsNullOrEmpty(response.City))
            {
                // Format: "İstanbul, Turkey" or "City, Country"
                var location = !string.IsNullOrEmpty(response.RegionName)
                    ? $"{response.City}, {response.RegionName}, {response.Country}"
                    : $"{response.City}, {response.Country}";

                _logger.LogDebug("IP {IpAddress} resolved to location: {Location}", ipAddress, location);
                return location;
            }

            _logger.LogDebug("Could not resolve location for IP {IpAddress}: {Status}",
                ipAddress, response?.Status ?? "no response");
            return null;
        }
        catch (TaskCanceledException)
        {
            // Timeout - don't block login for geolocation
            _logger.LogDebug("Geolocation request timed out for IP {IpAddress}", ipAddress);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get location for IP {IpAddress}", ipAddress);
            return null;
        }
    }

    /// <summary>
    /// Response model for ip-api.com
    /// </summary>
    private class IpApiResponse
    {
        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("city")]
        public string? City { get; set; }

        [JsonPropertyName("regionName")]
        public string? RegionName { get; set; }

        [JsonPropertyName("country")]
        public string? Country { get; set; }
    }

    /// <inheritdoc />
    public string ParseUserAgent(string userAgent)
    {
        if (string.IsNullOrEmpty(userAgent))
            return "Unknown Device";

        try
        {
            // Basic User-Agent parsing
            var browser = "Unknown Browser";
            var os = "Unknown OS";

            // Detect browser
            if (userAgent.Contains("Chrome") && !userAgent.Contains("Edg"))
                browser = "Chrome";
            else if (userAgent.Contains("Firefox"))
                browser = "Firefox";
            else if (userAgent.Contains("Safari") && !userAgent.Contains("Chrome"))
                browser = "Safari";
            else if (userAgent.Contains("Edg"))
                browser = "Edge";
            else if (userAgent.Contains("MSIE") || userAgent.Contains("Trident"))
                browser = "Internet Explorer";
            else if (userAgent.Contains("Opera") || userAgent.Contains("OPR"))
                browser = "Opera";

            // Detect OS
            if (userAgent.Contains("Windows"))
                os = "Windows";
            else if (userAgent.Contains("Mac OS"))
                os = "macOS";
            else if (userAgent.Contains("Linux"))
                os = "Linux";
            else if (userAgent.Contains("Android"))
                os = "Android";
            else if (userAgent.Contains("iPhone") || userAgent.Contains("iPad"))
                os = "iOS";

            return $"{browser} on {os}";
        }
        catch
        {
            return "Unknown Device";
        }
    }

    private async Task SendNewLoginNotificationAsync(
        IEmailService emailService,
        string email,
        string? deviceInfo,
        string? ipAddress,
        string? location)
    {
        // Normalize IP for display (remove ::ffff: prefix)
        var displayIp = !string.IsNullOrEmpty(ipAddress) ? NormalizeIpAddress(ipAddress) : null;

        var subject = "Yeni Cihaz Girişi Algılandı - Stocker";
        var body = $@"
            <h2>Yeni Bir Cihazdan Giriş Yapıldı</h2>
            <p>Hesabınıza yeni bir cihazdan veya konumdan giriş yapıldı.</p>
            <table style='border-collapse: collapse; margin: 20px 0;'>
                <tr>
                    <td style='padding: 8px; border: 1px solid #ddd;'><strong>Cihaz:</strong></td>
                    <td style='padding: 8px; border: 1px solid #ddd;'>{deviceInfo ?? "Bilinmiyor"}</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border: 1px solid #ddd;'><strong>IP Adresi:</strong></td>
                    <td style='padding: 8px; border: 1px solid #ddd;'>{displayIp ?? "Bilinmiyor"}</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border: 1px solid #ddd;'><strong>Konum:</strong></td>
                    <td style='padding: 8px; border: 1px solid #ddd;'>{location ?? "Bilinmiyor"}</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border: 1px solid #ddd;'><strong>Tarih:</strong></td>
                    <td style='padding: 8px; border: 1px solid #ddd;'>{DateTime.UtcNow:dd.MM.yyyy HH:mm} UTC</td>
                </tr>
            </table>
            <p>Bu giriş size ait değilse, lütfen hemen şifrenizi değiştirin ve tüm cihazlardan çıkış yapın.</p>
            <p style='color: #666; font-size: 12px;'>
                Bu e-posta hesabınızın güvenliği için otomatik olarak gönderilmiştir.
            </p>
        ";

        await emailService.SendAsync(new Application.Common.Interfaces.EmailMessage
        {
            To = email,
            Subject = subject,
            Body = body,
            IsHtml = true
        });
    }

    /// <summary>
    /// Normalizes IP address by stripping IPv6-mapped IPv4 prefix (::ffff:)
    /// </summary>
    private static string NormalizeIpAddress(string ipAddress)
    {
        if (string.IsNullOrEmpty(ipAddress))
            return ipAddress;

        // Handle IPv6-mapped IPv4 addresses like "::ffff:10.0.1.15"
        const string ipv6MappedPrefix = "::ffff:";
        if (ipAddress.StartsWith(ipv6MappedPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return ipAddress.Substring(ipv6MappedPrefix.Length);
        }

        return ipAddress;
    }

    private static bool IsPrivateOrLocalIp(string ipAddress)
    {
        if (string.IsNullOrEmpty(ipAddress))
            return true;

        // Normalize IPv6-mapped IPv4 addresses first
        var normalizedIp = NormalizeIpAddress(ipAddress);

        // Localhost
        if (normalizedIp == "127.0.0.1" || normalizedIp == "::1" || normalizedIp == "localhost")
            return true;

        // Private IP ranges (RFC 1918)
        if (normalizedIp.StartsWith("10.") ||
            normalizedIp.StartsWith("192.168.") ||
            normalizedIp.StartsWith("172.16.") ||
            normalizedIp.StartsWith("172.17.") ||
            normalizedIp.StartsWith("172.18.") ||
            normalizedIp.StartsWith("172.19.") ||
            normalizedIp.StartsWith("172.20.") ||
            normalizedIp.StartsWith("172.21.") ||
            normalizedIp.StartsWith("172.22.") ||
            normalizedIp.StartsWith("172.23.") ||
            normalizedIp.StartsWith("172.24.") ||
            normalizedIp.StartsWith("172.25.") ||
            normalizedIp.StartsWith("172.26.") ||
            normalizedIp.StartsWith("172.27.") ||
            normalizedIp.StartsWith("172.28.") ||
            normalizedIp.StartsWith("172.29.") ||
            normalizedIp.StartsWith("172.30.") ||
            normalizedIp.StartsWith("172.31."))
            return true;

        // Link-local (169.254.x.x)
        if (normalizedIp.StartsWith("169.254."))
            return true;

        return false;
    }
}
