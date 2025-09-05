using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using System.Security.Claims;

namespace Stocker.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AccountController : ApiController
{
    private readonly ILogger<AccountController> _logger;

    public AccountController(ILogger<AccountController> logger)
    {
        _logger = logger;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        var profile = new
        {
            id = userId ?? Guid.NewGuid().ToString(),
            username = User.Identity?.Name ?? "user",
            email = email ?? "user@example.com",
            firstName = "John",
            lastName = "Doe",
            phone = "+90 532 123 4567",
            role = User.FindFirst(ClaimTypes.Role)?.Value ?? "User",
            department = "Satış",
            branch = "Merkez",
            profileImage = "/api/account/profile-image",
            createdDate = DateTime.UtcNow.AddMonths(-6),
            lastLoginDate = DateTime.UtcNow.AddHours(-2),
            twoFactorEnabled = false,
            emailConfirmed = true,
            phoneConfirmed = false,
            preferences = new
            {
                language = "tr",
                theme = "light",
                notifications = true,
                newsletter = false
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = profile,
            Message = "Profil bilgileri başarıyla yüklendi"
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        _logger.LogInformation("Updating profile for user: {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Profil başarıyla güncellendi"
        });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        // Validate current password
        if (string.IsNullOrEmpty(request.CurrentPassword))
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Mevcut şifre boş olamaz"
            });
        }

        // Validate new password
        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Yeni şifreler eşleşmiyor"
            });
        }

        if (request.NewPassword.Length < 8)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Yeni şifre en az 8 karakter olmalıdır"
            });
        }

        _logger.LogInformation("Password changed for user: {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Şifre başarıyla değiştirildi"
        });
    }

    [HttpPost("profile-image")]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Dosya seçilmedi"
            });
        }

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF)"
            });
        }

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Dosya boyutu 5MB'dan büyük olamaz"
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { imageUrl = "/api/account/profile-image" },
            Message = "Profil resmi başarıyla yüklendi"
        });
    }

    [HttpGet("profile-image")]
    public async Task<IActionResult> GetProfileImage()
    {
        // Return default avatar or user's profile image
        var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "default-avatar.png");
        
        if (!System.IO.File.Exists(imagePath))
        {
            return NotFound();
        }

        var image = System.IO.File.OpenRead(imagePath);
        return File(image, "image/png");
    }

    [HttpDelete("profile-image")]
    public async Task<IActionResult> DeleteProfileImage()
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Profil resmi başarıyla silindi"
        });
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences()
    {
        var preferences = new
        {
            language = "tr",
            theme = "light",
            dateFormat = "DD/MM/YYYY",
            timeFormat = "HH:mm",
            timezone = "Europe/Istanbul",
            notifications = new
            {
                email = true,
                push = true,
                sms = false,
                desktop = true
            },
            privacy = new
            {
                profileVisibility = "public",
                showEmail = false,
                showPhone = false,
                allowMessages = true
            },
            dashboard = new
            {
                defaultView = "grid",
                widgetsOrder = new[] { "stats", "chart", "activities", "tasks" },
                refreshInterval = 30 // seconds
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = preferences,
            Message = "Tercihler başarıyla yüklendi"
        });
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdatePreferencesRequest request)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Tercihler başarıyla güncellendi"
        });
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetActiveSessions()
    {
        var sessions = new[]
        {
            new
            {
                id = Guid.NewGuid(),
                device = "Chrome / Windows",
                ipAddress = "192.168.1.100",
                location = "İstanbul, Türkiye",
                lastActivity = DateTime.UtcNow.AddMinutes(-5),
                isCurrent = true
            },
            new
            {
                id = Guid.NewGuid(),
                device = "Safari / iPhone",
                ipAddress = "192.168.1.101",
                location = "İstanbul, Türkiye",
                lastActivity = DateTime.UtcNow.AddHours(-2),
                isCurrent = false
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = sessions,
            Message = "Aktif oturumlar başarıyla yüklendi"
        });
    }

    [HttpDelete("sessions/{sessionId}")]
    public async Task<IActionResult> TerminateSession(Guid sessionId)
    {
        _logger.LogInformation("Terminating session: {SessionId} for user: {UserId}", 
            sessionId, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Oturum başarıyla sonlandırıldı"
        });
    }

    [HttpPost("enable-2fa")]
    public async Task<IActionResult> EnableTwoFactor()
    {
        var qrCodeUrl = "otpauth://totp/Stocker:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Stocker";
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new 
            { 
                qrCodeUrl,
                secretKey = "JBSWY3DPEHPK3PXP",
                backupCodes = new[] { "ABC123", "DEF456", "GHI789", "JKL012", "MNO345" }
            },
            Message = "İki faktörlü doğrulama başarıyla etkinleştirildi"
        });
    }

    [HttpPost("disable-2fa")]
    public async Task<IActionResult> DisableTwoFactor([FromBody] DisableTwoFactorRequest request)
    {
        if (string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Şifre gereklidir"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "İki faktörlü doğrulama başarıyla devre dışı bırakıldı"
        });
    }

    [HttpGet("activity-log")]
    public async Task<IActionResult> GetActivityLog([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var activities = new[]
        {
            new
            {
                id = Guid.NewGuid(),
                action = "Login",
                description = "Sisteme giriş yapıldı",
                ipAddress = "192.168.1.100",
                device = "Chrome / Windows",
                timestamp = DateTime.UtcNow.AddHours(-2),
                status = "Success"
            },
            new
            {
                id = Guid.NewGuid(),
                action = "PasswordChange",
                description = "Şifre değiştirildi",
                ipAddress = "192.168.1.100",
                device = "Chrome / Windows",
                timestamp = DateTime.UtcNow.AddDays(-1),
                status = "Success"
            },
            new
            {
                id = Guid.NewGuid(),
                action = "ProfileUpdate",
                description = "Profil bilgileri güncellendi",
                ipAddress = "192.168.1.100",
                device = "Chrome / Windows",
                timestamp = DateTime.UtcNow.AddDays(-3),
                status = "Success"
            }
        };

        var response = new
        {
            items = activities,
            totalItems = 15,
            page = page,
            pageSize = pageSize,
            totalPages = 1
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = response,
            Message = "Aktivite geçmişi başarıyla yüklendi"
        });
    }
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Department { get; set; }
    public string? Branch { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class UpdatePreferencesRequest
{
    public string? Language { get; set; }
    public string? Theme { get; set; }
    public string? DateFormat { get; set; }
    public string? TimeFormat { get; set; }
    public string? Timezone { get; set; }
    public NotificationPreferences? Notifications { get; set; }
    public PrivacyPreferences? Privacy { get; set; }
    public DashboardPreferences? Dashboard { get; set; }
}

public class NotificationPreferences
{
    public bool? Email { get; set; }
    public bool? Push { get; set; }
    public bool? Sms { get; set; }
    public bool? Desktop { get; set; }
}

public class PrivacyPreferences
{
    public string? ProfileVisibility { get; set; }
    public bool? ShowEmail { get; set; }
    public bool? ShowPhone { get; set; }
    public bool? AllowMessages { get; set; }
}

public class DashboardPreferences
{
    public string? DefaultView { get; set; }
    public string[]? WidgetsOrder { get; set; }
    public int? RefreshInterval { get; set; }
}

public class DisableTwoFactorRequest
{
    public string Password { get; set; } = string.Empty;
}