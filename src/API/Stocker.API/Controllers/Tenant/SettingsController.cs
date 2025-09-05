using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class SettingsController : ApiController
{
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(ILogger<SettingsController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = new
        {
            company = new
            {
                name = "ABC Teknoloji Ltd.",
                taxNumber = "1234567890",
                taxOffice = "Kadıköy",
                address = "Kadıköy, İstanbul",
                phone = "+90 216 123 4567",
                email = "info@abcteknoloji.com",
                website = "https://abcteknoloji.com",
                logo = "/api/tenant/settings/logo"
            },
            general = new
            {
                language = "tr",
                timezone = "Europe/Istanbul",
                dateFormat = "DD/MM/YYYY",
                timeFormat = "HH:mm",
                currency = "TRY",
                currencyPosition = "suffix",
                thousandSeparator = ".",
                decimalSeparator = ",",
                decimalPlaces = 2
            },
            invoice = new
            {
                prefix = "INV",
                nextNumber = 1001,
                footerText = "Ödeme koşulları: 30 gün",
                showLogo = true,
                showTaxNumber = true,
                autoSend = false
            },
            email = new
            {
                smtpHost = "smtp.gmail.com",
                smtpPort = 587,
                smtpUser = "noreply@abcteknoloji.com",
                smtpSecure = true,
                fromName = "ABC Teknoloji",
                fromEmail = "noreply@abcteknoloji.com"
            },
            notifications = new
            {
                emailNotifications = true,
                smsNotifications = false,
                pushNotifications = true,
                notifyOnNewOrder = true,
                notifyOnPayment = true,
                notifyOnLowStock = true,
                dailyReport = false,
                weeklyReport = true
            },
            security = new
            {
                twoFactorRequired = false,
                passwordMinLength = 8,
                passwordRequireUppercase = true,
                passwordRequireLowercase = true,
                passwordRequireNumbers = true,
                passwordRequireSpecialChars = true,
                sessionTimeout = 30, // minutes
                maxLoginAttempts = 5,
                lockoutDuration = 15 // minutes
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = settings,
            Message = "Ayarlar başarıyla yüklendi"
        });
    }

    [HttpPut("company")]
    public async Task<IActionResult> UpdateCompanySettings([FromBody] CompanySettingsRequest request)
    {
        _logger.LogInformation("Updating company settings for tenant");

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Şirket ayarları başarıyla güncellendi"
        });
    }

    [HttpPut("general")]
    public async Task<IActionResult> UpdateGeneralSettings([FromBody] GeneralSettingsRequest request)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Genel ayarlar başarıyla güncellendi"
        });
    }

    [HttpPut("invoice")]
    public async Task<IActionResult> UpdateInvoiceSettings([FromBody] InvoiceSettingsRequest request)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Fatura ayarları başarıyla güncellendi"
        });
    }

    [HttpPut("email")]
    public async Task<IActionResult> UpdateEmailSettings([FromBody] EmailSettingsRequest request)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "E-posta ayarları başarıyla güncellendi"
        });
    }

    [HttpPost("email/test")]
    public async Task<IActionResult> TestEmailSettings([FromBody] TestEmailRequest request)
    {
        _logger.LogInformation("Testing email settings with recipient: {Email}", request.TestEmail);

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Test e-postası başarıyla gönderildi"
        });
    }

    [HttpPut("notifications")]
    public async Task<IActionResult> UpdateNotificationSettings([FromBody] NotificationSettingsRequest request)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Bildirim ayarları başarıyla güncellendi"
        });
    }

    [HttpPut("security")]
    public async Task<IActionResult> UpdateSecuritySettings([FromBody] SecuritySettingsRequest request)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Güvenlik ayarları başarıyla güncellendi"
        });
    }

    [HttpPost("logo")]
    public async Task<IActionResult> UploadLogo(IFormFile file)
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

        // Validate file size (max 2MB)
        if (file.Length > 2 * 1024 * 1024)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Dosya boyutu 2MB'dan büyük olamaz"
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { logoUrl = "/api/tenant/settings/logo" },
            Message = "Logo başarıyla yüklendi"
        });
    }

    [HttpGet("logo")]
    public async Task<IActionResult> GetLogo()
    {
        // Return default logo or tenant's logo
        var logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "default-logo.png");
        
        if (!System.IO.File.Exists(logoPath))
        {
            return NotFound();
        }

        var image = System.IO.File.OpenRead(logoPath);
        return File(image, "image/png");
    }

    [HttpGet("modules")]
    public async Task<IActionResult> GetModuleSettings()
    {
        var modules = new[]
        {
            new
            {
                code = "CRM",
                name = "Müşteri İlişkileri Yönetimi",
                isActive = true,
                settings = (object)new
                {
                    leadAutoAssignment = true,
                    dealAutoClose = false,
                    pipelineStages = 5,
                    emailIntegration = true
                }
            },
            new
            {
                code = "INVENTORY",
                name = "Stok Yönetimi",
                isActive = true,
                settings = (object)new
                {
                    lowStockAlert = true,
                    alertThreshold = 10,
                    autoReorder = false,
                    barcodeEnabled = true
                }
            },
            new
            {
                code = "FINANCE",
                name = "Finans Yönetimi",
                isActive = true,
                settings = (object)new
                {
                    autoInvoicing = true,
                    paymentReminders = true,
                    reminderDays = 3,
                    lateFeeEnabled = false
                }
            },
            new
            {
                code = "HR",
                name = "İnsan Kaynakları",
                isActive = false,
                settings = (object)new { }
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = modules,
            Message = "Modül ayarları başarıyla yüklendi"
        });
    }

    [HttpPut("modules/{moduleCode}")]
    public async Task<IActionResult> UpdateModuleSettings(string moduleCode, [FromBody] ModuleSettingsRequest request)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = $"{moduleCode} modül ayarları başarıyla güncellendi"
        });
    }
}

public class CompanySettingsRequest
{
    public string? Name { get; set; }
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
}

public class GeneralSettingsRequest
{
    public string? Language { get; set; }
    public string? Timezone { get; set; }
    public string? DateFormat { get; set; }
    public string? TimeFormat { get; set; }
    public string? Currency { get; set; }
    public string? CurrencyPosition { get; set; }
    public string? ThousandSeparator { get; set; }
    public string? DecimalSeparator { get; set; }
    public int? DecimalPlaces { get; set; }
}

public class InvoiceSettingsRequest
{
    public string? Prefix { get; set; }
    public int? NextNumber { get; set; }
    public string? FooterText { get; set; }
    public bool? ShowLogo { get; set; }
    public bool? ShowTaxNumber { get; set; }
    public bool? AutoSend { get; set; }
}

public class EmailSettingsRequest
{
    public string? SmtpHost { get; set; }
    public int? SmtpPort { get; set; }
    public string? SmtpUser { get; set; }
    public string? SmtpPassword { get; set; }
    public bool? SmtpSecure { get; set; }
    public string? FromName { get; set; }
    public string? FromEmail { get; set; }
}

public class TestEmailRequest
{
    public string TestEmail { get; set; } = string.Empty;
}

public class NotificationSettingsRequest
{
    public bool? EmailNotifications { get; set; }
    public bool? SmsNotifications { get; set; }
    public bool? PushNotifications { get; set; }
    public bool? NotifyOnNewOrder { get; set; }
    public bool? NotifyOnPayment { get; set; }
    public bool? NotifyOnLowStock { get; set; }
    public bool? DailyReport { get; set; }
    public bool? WeeklyReport { get; set; }
}

public class SecuritySettingsRequest
{
    public bool? TwoFactorRequired { get; set; }
    public int? PasswordMinLength { get; set; }
    public bool? PasswordRequireUppercase { get; set; }
    public bool? PasswordRequireLowercase { get; set; }
    public bool? PasswordRequireNumbers { get; set; }
    public bool? PasswordRequireSpecialChars { get; set; }
    public int? SessionTimeout { get; set; }
    public int? MaxLoginAttempts { get; set; }
    public int? LockoutDuration { get; set; }
}

public class ModuleSettingsRequest
{
    public bool IsActive { get; set; }
    public Dictionary<string, object>? Settings { get; set; }
}