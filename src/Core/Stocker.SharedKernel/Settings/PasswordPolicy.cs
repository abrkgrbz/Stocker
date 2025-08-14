namespace Stocker.SharedKernel.Settings;

/// <summary>
/// Password policy configuration settings
/// </summary>
public class PasswordPolicy
{
    public int MinimumLength { get; set; } = 8;
    public int MaximumLength { get; set; } = 128;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireDigit { get; set; } = true;
    public bool RequireNonAlphanumeric { get; set; } = true;
    public int RequiredUniqueChars { get; set; } = 4;
    public bool PreventCommonPasswords { get; set; } = true;
    public bool PreventUserInfoInPassword { get; set; } = true;
    public int PasswordHistoryCount { get; set; } = 5;
    public int PasswordExpirationDays { get; set; } = 90;
    public int MaxFailedAccessAttempts { get; set; } = 5;
    public int LockoutDurationMinutes { get; set; } = 15;
    
    // Password strength requirements
    public int MinimumStrengthScore { get; set; } = 3; // 0-5 scale
    
    // Special character set
    public string SpecialCharacters { get; set; } = "!@#$%^&*()_+-=[]{}|;:,.<>?";
}