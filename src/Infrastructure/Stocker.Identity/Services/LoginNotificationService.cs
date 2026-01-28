using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Identity.Services;

/// <summary>
/// Service for sending login notifications when new devices or locations are detected.
/// </summary>
public class LoginNotificationService : ILoginNotificationService
{
    private readonly IMasterDbContext _masterContext;
    private readonly IEmailService _emailService;
    private readonly ILogger<LoginNotificationService> _logger;

    public LoginNotificationService(
        IMasterDbContext masterContext,
        IEmailService emailService,
        ILogger<LoginNotificationService> logger)
    {
        _masterContext = masterContext;
        _emailService = emailService;
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
            // Check if this device/IP has been seen before for this user
            var existingSession = await _masterContext.UserSessions
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
            await SendNewLoginNotificationAsync(email, deviceInfo, ipAddress, location);

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
            // Skip for local/private IPs
            if (IsPrivateOrLocalIp(ipAddress))
            {
                return "Local Network";
            }

            // TODO: Integrate with a geolocation service like ip-api.com, ipstack, or MaxMind
            // For now, return null and let the caller handle it
            // Example implementation:
            // using var client = new HttpClient();
            // var response = await client.GetStringAsync($"http://ip-api.com/json/{ipAddress}");
            // var data = JsonSerializer.Deserialize<IpApiResponse>(response);
            // return $"{data.City}, {data.Country}";

            await Task.CompletedTask;
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get location for IP {IpAddress}", ipAddress);
            return null;
        }
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
        string email,
        string? deviceInfo,
        string? ipAddress,
        string? location)
    {
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
                    <td style='padding: 8px; border: 1px solid #ddd;'>{ipAddress ?? "Bilinmiyor"}</td>
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

        await _emailService.SendAsync(new Application.Common.Interfaces.EmailMessage
        {
            To = email,
            Subject = subject,
            Body = body,
            IsHtml = true
        });
    }

    private static bool IsPrivateOrLocalIp(string ipAddress)
    {
        if (string.IsNullOrEmpty(ipAddress))
            return true;

        // Localhost
        if (ipAddress == "127.0.0.1" || ipAddress == "::1" || ipAddress == "localhost")
            return true;

        // Private IP ranges
        if (ipAddress.StartsWith("10.") ||
            ipAddress.StartsWith("192.168.") ||
            ipAddress.StartsWith("172.16.") ||
            ipAddress.StartsWith("172.17.") ||
            ipAddress.StartsWith("172.18.") ||
            ipAddress.StartsWith("172.19.") ||
            ipAddress.StartsWith("172.2") ||
            ipAddress.StartsWith("172.30.") ||
            ipAddress.StartsWith("172.31."))
            return true;

        return false;
    }
}
