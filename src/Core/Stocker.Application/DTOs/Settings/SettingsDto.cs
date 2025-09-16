namespace Stocker.Application.DTOs.Settings;

public class SettingsDto
{
    public GeneralSettingsDto General { get; set; } = new();
    public EmailSettingsDto Email { get; set; } = new();
    public SecuritySettingsDto Security { get; set; } = new();
    public BackupSettingsDto Backup { get; set; } = new();
    public MaintenanceSettingsDto Maintenance { get; set; } = new();
    public NotificationSettingsDto Notifications { get; set; } = new();
}

public class GeneralSettingsDto
{
    public string SiteName { get; set; } = "Stocker";
    public string SiteUrl { get; set; } = "https://stoocker.app";
    public string AdminEmail { get; set; } = "admin@stoocker.app";
    public string DefaultLanguage { get; set; } = "tr";
    public string DefaultTimezone { get; set; } = "Europe/Istanbul";
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    public string TimeFormat { get; set; } = "HH:mm";
    public string Currency { get; set; } = "TRY";
    public int MaxUploadSize { get; set; } = 10;
    public bool AllowRegistration { get; set; } = true;
    public bool RequireEmailVerification { get; set; } = true;
    public bool MaintenanceMode { get; set; } = false;
}

public class EmailSettingsDto
{
    public bool EnableEmail { get; set; } = true;
    public string Provider { get; set; } = "SMTP";
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUsername { get; set; } = string.Empty;
    public string? SmtpPassword { get; set; }
    public bool SmtpEnableSsl { get; set; } = true;
    public string SmtpEncryption { get; set; } = "TLS";
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
    public string? ApiKey { get; set; }
    public bool TestMode { get; set; } = false;
}

public class SecuritySettingsDto
{
    public bool EnforcePasswordPolicy { get; set; } = true;
    public int MinPasswordLength { get; set; } = 8;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireNumbers { get; set; } = true;
    public bool RequireSpecialChars { get; set; } = false;
    public int PasswordExpiryDays { get; set; } = 90;
    public int MaxLoginAttempts { get; set; } = 5;
    public int LockoutDuration { get; set; } = 30;
    public bool EnableTwoFactor { get; set; } = false;
    public int SessionTimeout { get; set; } = 60;
    public bool EnableCaptcha { get; set; } = false;
    public List<string> AllowedIpAddresses { get; set; } = new();
    public List<string> BlockedIpAddresses { get; set; } = new();
}

public class BackupSettingsDto
{
    public bool Enabled { get; set; } = true;
    public string Frequency { get; set; } = "daily";
    public string Time { get; set; } = "03:00";
    public int RetentionDays { get; set; } = 30;
    public string BackupLocation { get; set; } = "/backups";
    public bool IncludeDatabase { get; set; } = true;
    public bool IncludeFiles { get; set; } = true;
    public bool EmailNotification { get; set; } = true;
    public string NotificationEmail { get; set; } = string.Empty;
}

public class MaintenanceSettingsDto
{
    public bool Enabled { get; set; } = false;
    public string Message { get; set; } = "System is under maintenance. Please try again later.";
    public List<string> AllowedIPs { get; set; } = new();
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool ShowCountdown { get; set; } = true;
}

public class NotificationSettingsDto
{
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = false;
    public bool SmsNotifications { get; set; } = false;
    public bool NewUserNotification { get; set; } = true;
    public bool NewTenantNotification { get; set; } = true;
    public bool ErrorNotification { get; set; } = true;
    public bool SystemUpdateNotification { get; set; } = true;
    public bool ReportNotification { get; set; } = true;
    public List<string> NotificationEmails { get; set; } = new();
}

public class TestEmailRequestDto
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = "Test Email";
    public string Body { get; set; } = "This is a test email from Stocker.";
}