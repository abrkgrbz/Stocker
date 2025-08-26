using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Entities.Settings;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Seeds.Master;

public static class SystemSettingsSeed
{
    public static async Task SeedAsync(MasterDbContext context)
    {
        if (await context.SystemSettings.AnyAsync())
            return;

        var settings = new List<SystemSettings>
        {
            // General Settings
            new SystemSettings(SettingCategories.General, SettingKeys.SiteName, "Stocker", "Application name", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.SiteUrl, "https://stoocker.app", "Main application URL", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.AdminEmail, "info@stoocker.app", "Administrator email address", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.DefaultLanguage, "tr", "Default system language", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.DefaultTimezone, "Europe/Istanbul", "Default timezone", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.DateFormat, "DD/MM/YYYY", "Date display format", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.TimeFormat, "HH:mm", "Time display format", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.Currency, "TRY", "Default currency", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.MaxUploadSize, "10", "Maximum file upload size in MB", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.AllowRegistration, "true", "Allow new user registrations", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.RequireEmailVerification, "true", "Require email verification for new users", true, false),
            new SystemSettings(SettingCategories.General, SettingKeys.MaintenanceMode, "false", "Enable maintenance mode", true, false),

            // Email Settings
            new SystemSettings(SettingCategories.Email, SettingKeys.EmailProvider, "SMTP", "Email service provider", true, false),
            new SystemSettings(SettingCategories.Email, SettingKeys.SmtpHost, "smtp.gmail.com", "SMTP server host", true, false),
            new SystemSettings(SettingCategories.Email, SettingKeys.SmtpPort, "587", "SMTP server port", true, false),
            new SystemSettings(SettingCategories.Email, SettingKeys.SmtpUsername, "info@stoocker.app", "SMTP username", true, false),
            new SystemSettings(SettingCategories.Email, SettingKeys.SmtpPassword, "", "SMTP password", true, true), // Encrypted
            new SystemSettings(SettingCategories.Email, SettingKeys.SmtpEncryption, "TLS", "SMTP encryption type", true, false),
            new SystemSettings(SettingCategories.Email, SettingKeys.FromEmail, "noreply@stoocker.app", "Default from email address", true, false),
            new SystemSettings(SettingCategories.Email, SettingKeys.FromName, "Stocker", "Default from name", true, false),
            new SystemSettings(SettingCategories.Email, SettingKeys.EmailTestMode, "false", "Enable email test mode", true, false),

            // Security Settings
            new SystemSettings(SettingCategories.Security, SettingKeys.EnforcePasswordPolicy, "true", "Enforce password policy", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.MinPasswordLength, "8", "Minimum password length", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.RequireUppercase, "true", "Require uppercase letter in password", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.RequireLowercase, "true", "Require lowercase letter in password", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.RequireNumbers, "true", "Require number in password", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.RequireSpecialChars, "true", "Require special character in password", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.PasswordExpiryDays, "90", "Password expiry in days (0 for no expiry)", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.MaxLoginAttempts, "5", "Maximum login attempts before lockout", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.LockoutDuration, "30", "Account lockout duration in minutes", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.EnableTwoFactor, "false", "Enable two-factor authentication", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.SessionTimeout, "60", "Session timeout in minutes", true, false),
            new SystemSettings(SettingCategories.Security, SettingKeys.EnableCaptcha, "false", "Enable CAPTCHA for login", true, false),
            new SystemSettings(SettingCategories.Security, "AllowedIpAddresses", "[]", "Allowed IP addresses (JSON array)", true, false),
            new SystemSettings(SettingCategories.Security, "BlockedIpAddresses", "[]", "Blocked IP addresses (JSON array)", true, false),

            // Backup Settings
            new SystemSettings(SettingCategories.Backup, SettingKeys.BackupEnabled, "true", "Enable automatic backups", true, false),
            new SystemSettings(SettingCategories.Backup, SettingKeys.BackupFrequency, "daily", "Backup frequency (daily, weekly, monthly)", true, false),
            new SystemSettings(SettingCategories.Backup, SettingKeys.BackupTime, "03:00", "Backup time (HH:mm)", true, false),
            new SystemSettings(SettingCategories.Backup, SettingKeys.BackupRetentionDays, "30", "Backup retention period in days", true, false),
            new SystemSettings(SettingCategories.Backup, SettingKeys.BackupLocation, "/backups", "Backup storage location", true, false),
            new SystemSettings(SettingCategories.Backup, SettingKeys.BackupIncludeDatabase, "true", "Include database in backup", true, false),
            new SystemSettings(SettingCategories.Backup, SettingKeys.BackupIncludeFiles, "true", "Include files in backup", true, false),
            new SystemSettings(SettingCategories.Backup, SettingKeys.BackupEmailNotification, "true", "Send email notification after backup", true, false),
            new SystemSettings(SettingCategories.Backup, SettingKeys.BackupNotificationEmail, "admin@stoocker.app", "Backup notification email address", true, false),

            // Maintenance Settings
            new SystemSettings(SettingCategories.Maintenance, "MaintenanceEnabled", "false", "Enable maintenance mode", true, false),
            new SystemSettings(SettingCategories.Maintenance, "MaintenanceMessage", "Sistem bakım çalışması yapılmaktadır. Lütfen daha sonra tekrar deneyin.", "Maintenance message", true, false),
            new SystemSettings(SettingCategories.Maintenance, "MaintenanceAllowedIPs", "[\"127.0.0.1\"]", "Allowed IPs during maintenance (JSON array)", true, false),
            new SystemSettings(SettingCategories.Maintenance, "MaintenanceShowCountdown", "true", "Show countdown timer during maintenance", true, false),

            // Notification Settings
            new SystemSettings(SettingCategories.Notifications, "EmailNotifications", "true", "Enable email notifications", true, false),
            new SystemSettings(SettingCategories.Notifications, "PushNotifications", "false", "Enable push notifications", true, false),
            new SystemSettings(SettingCategories.Notifications, "SmsNotifications", "false", "Enable SMS notifications", true, false),
            new SystemSettings(SettingCategories.Notifications, "NewUserNotification", "true", "Send notification for new user registrations", true, false),
            new SystemSettings(SettingCategories.Notifications, "NewTenantNotification", "true", "Send notification for new tenant creation", true, false),
            new SystemSettings(SettingCategories.Notifications, "ErrorNotification", "true", "Send notification for system errors", true, false),
            new SystemSettings(SettingCategories.Notifications, "SystemUpdateNotification", "true", "Send notification for system updates", true, false),
            new SystemSettings(SettingCategories.Notifications, "ReportNotification", "true", "Send notification for reports", true, false),
            new SystemSettings(SettingCategories.Notifications, "NotificationEmails", "[\"admin@stoocker.app\", \"info@stoocker.app\"]", "Notification email addresses (JSON array)", true, false),
        };

        await context.SystemSettings.AddRangeAsync(settings);
        await context.SaveChangesAsync();
    }
}