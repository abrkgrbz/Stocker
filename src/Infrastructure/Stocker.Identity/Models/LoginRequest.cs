namespace Stocker.Identity.Models;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Optional: Eğer belirtilmezse TenantResolutionMiddleware'den gelen tenant bilgisi kullanılır.
    /// Sadece özel durumlar için (örn: admin panelinden farklı tenant'a login) kullanılmalıdır.
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// When true, extends refresh token lifetime (30 days instead of 7 days)
    /// </summary>
    public bool RememberMe { get; set; } = false;

    /// <summary>
    /// Optional device identifier for session tracking
    /// </summary>
    public string? DeviceId { get; set; }

    /// <summary>
    /// Optional device info (browser/OS) for session display
    /// </summary>
    public string? DeviceInfo { get; set; }

    /// <summary>
    /// Client IP address for security audit and login notifications
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// User-Agent header for device detection
    /// </summary>
    public string? UserAgent { get; set; }
}

public class RefreshTokenRequest
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string? DeviceInfo { get; set; }
    public string? IpAddress { get; set; }
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}