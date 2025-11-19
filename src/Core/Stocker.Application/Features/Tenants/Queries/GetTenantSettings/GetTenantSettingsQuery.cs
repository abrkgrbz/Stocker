using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantSettings;

public record GetTenantSettingsQuery : IRequest<Result<GetTenantSettingsResponse>>
{
    public Guid TenantId { get; init; }
}

public class GetTenantSettingsResponse
{
    public GeneralSettings General { get; set; } = new();
    public BrandingSettings Branding { get; set; } = new();
    public EmailSettings Email { get; set; } = new();
    public NotificationSettings Notifications { get; set; } = new();
    public SecuritySettings Security { get; set; } = new();
    public ApiSettings Api { get; set; } = new();
    public StorageSettings Storage { get; set; } = new();
    public AdvancedSettings Advanced { get; set; } = new();
}

public class GeneralSettings
{
    public string CompanyName { get; set; } = string.Empty;
    public string Timezone { get; set; } = "Europe/Istanbul";
    public string Language { get; set; } = "tr";
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    public string TimeFormat { get; set; } = "24h";
    public string Currency { get; set; } = "TRY";
    public string? FiscalYearStart { get; set; }
    public string? WeekStart { get; set; }
}

public class BrandingSettings
{
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
    public string? CustomFooter { get; set; }
    public string? CustomCSS { get; set; }
    public bool HideWatermark { get; set; }
}

public class EmailSettings
{
    public string? SmtpHost { get; set; }
    public int? SmtpPort { get; set; }
    public string? SmtpUser { get; set; }
    public string? SmtpEncryption { get; set; }
    public string? FromName { get; set; }
    public string? FromEmail { get; set; }
    public string? ReplyToEmail { get; set; }
    public string? EmailSignature { get; set; }
}

public class NotificationSettings
{
    public bool EmailNotifications { get; set; } = true;
    public bool SmsNotifications { get; set; }
    public bool PushNotifications { get; set; } = true;
    public bool WeeklyReport { get; set; } = true;
    public bool MonthlyReport { get; set; } = true;
    public bool SystemAlerts { get; set; } = true;
    public bool SecurityAlerts { get; set; } = true;
    public bool BillingAlerts { get; set; } = true;
    public bool UserActivityAlerts { get; set; }
}

public class SecuritySettings
{
    public string TwoFactorAuth { get; set; } = "optional";
    public int SessionTimeout { get; set; } = 30;
    public string PasswordPolicy { get; set; } = "strong";
    public int PasswordExpiry { get; set; } = 90;
    public List<string> IpWhitelist { get; set; } = new();
    public List<string> IpBlacklist { get; set; } = new();
    public int MaxLoginAttempts { get; set; } = 5;
    public int LockoutDuration { get; set; } = 30;
    public bool ForceHttps { get; set; } = true;
    public bool CorsEnabled { get; set; } = true;
    public List<string> AllowedOrigins { get; set; } = new();
}

public class ApiSettings
{
    public bool Enabled { get; set; } = true;
    public int RateLimit { get; set; } = 1000;
    public int RateLimitWindow { get; set; } = 3600;
    public string ApiVersion { get; set; } = "v2";
    public string? WebhookUrl { get; set; }
}

public class StorageSettings
{
    public string Provider { get; set; } = "local";
    public string? Region { get; set; }
    public string? Bucket { get; set; }
    public int MaxFileSize { get; set; } = 100;
    public List<string> AllowedFormats { get; set; } = new();
    public bool AutoBackup { get; set; } = true;
    public string BackupFrequency { get; set; } = "daily";
    public int BackupRetention { get; set; } = 30;
}

public class AdvancedSettings
{
    public bool MaintenanceMode { get; set; }
    public string? MaintenanceMessage { get; set; }
    public string? CustomDomain { get; set; }
    public bool CdnEnabled { get; set; } = true;
    public bool CacheEnabled { get; set; } = true;
    public int CacheTTL { get; set; } = 3600;
    public bool DebugMode { get; set; }
    public bool AuditLog { get; set; } = true;
    public int DataRetention { get; set; } = 365;
}
