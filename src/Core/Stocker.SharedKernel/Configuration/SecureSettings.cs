using Microsoft.Extensions.Configuration;
using System;
using System.Security.Cryptography;
using System.Text;

namespace Stocker.SharedKernel.Configuration;

/// <summary>
/// Secure settings manager for handling sensitive configuration
/// </summary>
public class SecureSettings
{
    private readonly IConfiguration _configuration;
    
    public SecureSettings(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    // Database Settings
    public string GetDatabaseConnection()
    {
        var server = GetRequiredSetting("DB_SERVER");
        var database = GetRequiredSetting("DB_NAME");
        var user = GetRequiredSetting("DB_USER");
        var password = GetRequiredSetting("DB_PASSWORD");
        
        return $"Server={server};Database={database};User Id={user};Password={password};TrustServerCertificate=True;MultipleActiveResultSets=true";
    }
    
    // JWT Settings
    public string JwtSecret => GetRequiredSetting("JWT_SECRET");
    public string JwtIssuer => GetRequiredSetting("JWT_ISSUER", "https://api.stoocker.app");
    public string JwtAudience => GetRequiredSetting("JWT_AUDIENCE", "https://stoocker.app");
    public int JwtExpiryMinutes => GetIntSetting("JWT_EXPIRY_MINUTES", 60);
    public int JwtRefreshExpiryDays => GetIntSetting("JWT_REFRESH_EXPIRY_DAYS", 7);
    
    // Admin Settings (First Run)
    public string AdminEmail => GetRequiredSetting("ADMIN_EMAIL", "admin@stoocker.app");
    public string AdminPassword => GetRequiredSetting("ADMIN_PASSWORD");
    public string AdminPhone => GetRequiredSetting("ADMIN_PHONE", "5551234567");
    
    // Email Settings
    public string SmtpHost => GetRequiredSetting("SMTP_HOST");
    public int SmtpPort => GetIntSetting("SMTP_PORT", 587);
    public string SmtpUser => GetRequiredSetting("SMTP_USER");
    public string SmtpPassword => GetRequiredSetting("SMTP_PASSWORD");
    public string SmtpFromEmail => GetRequiredSetting("SMTP_FROM_EMAIL");
    public string SmtpFromName => GetRequiredSetting("SMTP_FROM_NAME", "Stocker ERP");
    
    // Redis Settings
    public string RedisConnection => GetRequiredSetting("REDIS_CONNECTION", "localhost:6379");
    public string? RedisPassword => GetOptionalSetting("REDIS_PASSWORD");
    public int RedisDatabase => GetIntSetting("REDIS_DATABASE", 0);
    
    // Hangfire Settings
    public string HangfireUser => GetRequiredSetting("HANGFIRE_DASHBOARD_USER", "admin");
    public string HangfirePassword => GetRequiredSetting("HANGFIRE_DASHBOARD_PASSWORD");
    
    // Helper Methods
    private string GetRequiredSetting(string key, string? defaultValue = null)
    {
        // Try environment variable first
        var value = Environment.GetEnvironmentVariable(key);
        
        // Then try configuration
        if (string.IsNullOrEmpty(value))
        {
            value = _configuration[key];
        }
        
        // Then try with colon notation for nested config
        if (string.IsNullOrEmpty(value))
        {
            value = _configuration[$"SecureSettings:{key}"];
        }
        
        // Use default if provided
        if (string.IsNullOrEmpty(value) && !string.IsNullOrEmpty(defaultValue))
        {
            value = defaultValue;
        }
        
        // Throw if still empty and no default
        if (string.IsNullOrEmpty(value))
        {
            throw new InvalidOperationException(
                $"Required configuration '{key}' is missing. " +
                $"Please set it as an environment variable or in configuration.");
        }
        
        return value;
    }
    
    private string? GetOptionalSetting(string key)
    {
        var value = Environment.GetEnvironmentVariable(key);
        
        if (string.IsNullOrEmpty(value))
        {
            value = _configuration[key];
        }
        
        return string.IsNullOrEmpty(value) ? null : value;
    }
    
    private int GetIntSetting(string key, int defaultValue)
    {
        var value = GetOptionalSetting(key);
        
        if (string.IsNullOrEmpty(value))
        {
            return defaultValue;
        }
        
        if (int.TryParse(value, out var result))
        {
            return result;
        }
        
        return defaultValue;
    }
    
    /// <summary>
    /// Validates all required settings are present
    /// </summary>
    public void ValidateConfiguration()
    {
        var requiredSettings = new[]
        {
            "DB_PASSWORD",
            "JWT_SECRET",
            "ADMIN_PASSWORD",
            "SMTP_PASSWORD",
            "HANGFIRE_DASHBOARD_PASSWORD"
        };
        
        var missingSettings = new List<string>();
        
        foreach (var setting in requiredSettings)
        {
            try
            {
                GetRequiredSetting(setting);
            }
            catch
            {
                missingSettings.Add(setting);
            }
        }
        
        if (missingSettings.Any())
        {
            throw new InvalidOperationException(
                $"Missing required security settings: {string.Join(", ", missingSettings)}. " +
                "Please check your environment variables or configuration.");
        }
    }
}

/// <summary>
/// Extension methods for IServiceCollection
/// </summary>
public static class SecureSettingsExtensions
{
    public static IServiceCollection AddSecureSettings(this IServiceCollection services, IConfiguration configuration)
    {
        var secureSettings = new SecureSettings(configuration);
        
        // Validate on startup
        secureSettings.ValidateConfiguration();
        
        // Register as singleton
        services.AddSingleton(secureSettings);
        
        return services;
    }
}