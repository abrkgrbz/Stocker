using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Settings;
using Stocker.Domain.Entities.Settings;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using System.Text.Json;

namespace Stocker.Application.Features.Settings.Queries.GetAllSettings;

public class GetAllSettingsQueryHandler : IRequestHandler<GetAllSettingsQuery, Result<SettingsDto>>
{
    private readonly IMasterDbContext _context;

    public GetAllSettingsQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SettingsDto>> Handle(GetAllSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await _context.SystemSettings
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var dto = new SettingsDto
        {
            General = GetGeneralSettings(settings),
            Email = GetEmailSettings(settings),
            Security = GetSecuritySettings(settings),
            Backup = GetBackupSettings(settings),
            Maintenance = GetMaintenanceSettings(settings),
            Notifications = GetNotificationSettings(settings)
        };

        return Result<SettingsDto>.Success(dto);
    }

    private GeneralSettingsDto GetGeneralSettings(List<SystemSettings> settings)
    {
        var category = settings.Where(s => s.Category == SettingCategories.General).ToList();
        
        return new GeneralSettingsDto
        {
            SiteName = GetSettingValue(category, SettingKeys.SiteName, "Stocker"),
            SiteUrl = GetSettingValue(category, SettingKeys.SiteUrl, "https://stoocker.app"),
            AdminEmail = GetSettingValue(category, SettingKeys.AdminEmail, "admin@stoocker.app"),
            DefaultLanguage = GetSettingValue(category, SettingKeys.DefaultLanguage, "tr"),
            DefaultTimezone = GetSettingValue(category, SettingKeys.DefaultTimezone, "Europe/Istanbul"),
            DateFormat = GetSettingValue(category, SettingKeys.DateFormat, "DD/MM/YYYY"),
            TimeFormat = GetSettingValue(category, SettingKeys.TimeFormat, "HH:mm"),
            Currency = GetSettingValue(category, SettingKeys.Currency, "TRY"),
            MaxUploadSize = GetSettingValue(category, SettingKeys.MaxUploadSize, 10),
            AllowRegistration = GetSettingValue(category, SettingKeys.AllowRegistration, true),
            RequireEmailVerification = GetSettingValue(category, SettingKeys.RequireEmailVerification, true),
            MaintenanceMode = GetSettingValue(category, SettingKeys.MaintenanceMode, false)
        };
    }

    private EmailSettingsDto GetEmailSettings(List<SystemSettings> settings)
    {
        // Get all email-related settings (both from Email category and keys starting with Email. or Smtp.)
        var emailSettings = settings.Where(s => 
            s.Category == SettingCategories.Email || 
            s.Key.StartsWith("Email.") || 
            s.Key.StartsWith("Smtp.")
        ).ToList();
        
        return new EmailSettingsDto
        {
            EnableEmail = GetSettingValue(emailSettings, SettingKeys.EmailEnable, true),
            Provider = GetSettingValue(emailSettings, SettingKeys.EmailProvider, "SMTP"),
            SmtpHost = GetSettingValue(emailSettings, SettingKeys.SmtpHost, "mail.privateemail.com"),
            SmtpPort = GetSettingValue(emailSettings, SettingKeys.SmtpPort, 465),
            SmtpUsername = GetSettingValue(emailSettings, SettingKeys.SmtpUsername, "info@stoocker.app"),
            SmtpPassword = GetSettingValue(emailSettings, SettingKeys.SmtpPassword, ""),
            SmtpEnableSsl = GetSettingValue(emailSettings, SettingKeys.SmtpEnableSsl, true),
            SmtpEncryption = GetSettingValue(emailSettings, SettingKeys.SmtpEncryption, "SSL"),
            FromEmail = GetSettingValue(emailSettings, SettingKeys.EmailFromAddress, "info@stoocker.app"),
            FromName = GetSettingValue(emailSettings, SettingKeys.EmailFromName, "Stoocker"),
            TestMode = GetSettingValue(emailSettings, SettingKeys.EmailTestMode, false)
        };
    }

    private SecuritySettingsDto GetSecuritySettings(List<SystemSettings> settings)
    {
        var category = settings.Where(s => s.Category == SettingCategories.Security).ToList();
        
        return new SecuritySettingsDto
        {
            EnforcePasswordPolicy = GetSettingValue(category, SettingKeys.EnforcePasswordPolicy, true),
            MinPasswordLength = GetSettingValue(category, SettingKeys.MinPasswordLength, 8),
            RequireUppercase = GetSettingValue(category, SettingKeys.RequireUppercase, true),
            RequireLowercase = GetSettingValue(category, SettingKeys.RequireLowercase, true),
            RequireNumbers = GetSettingValue(category, SettingKeys.RequireNumbers, true),
            RequireSpecialChars = GetSettingValue(category, SettingKeys.RequireSpecialChars, false),
            PasswordExpiryDays = GetSettingValue(category, SettingKeys.PasswordExpiryDays, 90),
            MaxLoginAttempts = GetSettingValue(category, SettingKeys.MaxLoginAttempts, 5),
            LockoutDuration = GetSettingValue(category, SettingKeys.LockoutDuration, 30),
            EnableTwoFactor = GetSettingValue(category, SettingKeys.EnableTwoFactor, false),
            SessionTimeout = GetSettingValue(category, SettingKeys.SessionTimeout, 60),
            EnableCaptcha = GetSettingValue(category, SettingKeys.EnableCaptcha, false),
            AllowedIpAddresses = GetSettingValue<List<string>>(category, "AllowedIpAddresses", new List<string>()),
            BlockedIpAddresses = GetSettingValue<List<string>>(category, "BlockedIpAddresses", new List<string>())
        };
    }

    private BackupSettingsDto GetBackupSettings(List<SystemSettings> settings)
    {
        var category = settings.Where(s => s.Category == SettingCategories.Backup).ToList();
        
        return new BackupSettingsDto
        {
            Enabled = GetSettingValue(category, SettingKeys.BackupEnabled, true),
            Frequency = GetSettingValue(category, SettingKeys.BackupFrequency, "daily"),
            Time = GetSettingValue(category, SettingKeys.BackupTime, "03:00"),
            RetentionDays = GetSettingValue(category, SettingKeys.BackupRetentionDays, 30),
            BackupLocation = GetSettingValue(category, SettingKeys.BackupLocation, "/backups"),
            IncludeDatabase = GetSettingValue(category, SettingKeys.BackupIncludeDatabase, true),
            IncludeFiles = GetSettingValue(category, SettingKeys.BackupIncludeFiles, true),
            EmailNotification = GetSettingValue(category, SettingKeys.BackupEmailNotification, true),
            NotificationEmail = GetSettingValue(category, SettingKeys.BackupNotificationEmail, "admin@stoocker.app")
        };
    }

    private MaintenanceSettingsDto GetMaintenanceSettings(List<SystemSettings> settings)
    {
        var category = settings.Where(s => s.Category == SettingCategories.Maintenance).ToList();
        
        return new MaintenanceSettingsDto
        {
            Enabled = GetSettingValue(category, "MaintenanceEnabled", false),
            Message = GetSettingValue(category, "MaintenanceMessage", "System is under maintenance."),
            AllowedIPs = GetSettingValue<List<string>>(category, "MaintenanceAllowedIPs", new List<string>()),
            ShowCountdown = GetSettingValue(category, "MaintenanceShowCountdown", true)
        };
    }

    private NotificationSettingsDto GetNotificationSettings(List<SystemSettings> settings)
    {
        var category = settings.Where(s => s.Category == SettingCategories.Notifications).ToList();
        
        return new NotificationSettingsDto
        {
            EmailNotifications = GetSettingValue(category, "EmailNotifications", true),
            PushNotifications = GetSettingValue(category, "PushNotifications", false),
            SmsNotifications = GetSettingValue(category, "SmsNotifications", false),
            NewUserNotification = GetSettingValue(category, "NewUserNotification", true),
            NewTenantNotification = GetSettingValue(category, "NewTenantNotification", true),
            ErrorNotification = GetSettingValue(category, "ErrorNotification", true),
            SystemUpdateNotification = GetSettingValue(category, "SystemUpdateNotification", true),
            ReportNotification = GetSettingValue(category, "ReportNotification", true),
            NotificationEmails = GetSettingValue<List<string>>(category, "NotificationEmails", new List<string>())
        };
    }

    private T GetSettingValue<T>(List<SystemSettings> settings, string key, T defaultValue)
    {
        var setting = settings.FirstOrDefault(s => s.Key == key);
        
        if (setting == null)
            return defaultValue;

        try
        {
            if (typeof(T) == typeof(string))
                return (T)(object)setting.Value;
                
            if (typeof(T) == typeof(int))
                return (T)(object)int.Parse(setting.Value);
                
            if (typeof(T) == typeof(bool))
                return (T)(object)bool.Parse(setting.Value);
                
            if (typeof(T).IsGenericType && typeof(T).GetGenericTypeDefinition() == typeof(List<>))
                return JsonSerializer.Deserialize<T>(setting.Value) ?? defaultValue;
                
            return setting.GetValue<T>();
        }
        catch
        {
            return defaultValue;
        }
    }
}