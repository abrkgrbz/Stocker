namespace Stocker.Application.Common.Interfaces;

public interface IValidationService
{
    Task<EmailValidationResult> ValidateEmailAsync(string email);
    Task<PhoneValidationResult> ValidatePhoneAsync(string phoneNumber, string countryCode = "TR");
    Task<PasswordStrengthResult> CheckPasswordStrengthAsync(string password);
    Task<DomainAvailabilityResult> CheckDomainAvailabilityAsync(string domain);
    Task<CompanyNameValidationResult> ValidateCompanyNameAsync(string companyName);
    Task<IdentityValidationResult> ValidateIdentityNumberAsync(string identityNumber);
}

public class EmailValidationResult
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? NormalizedEmail { get; set; }
    public bool IsDisposable { get; set; }
    public bool HasMxRecord { get; set; }
    public string? SuggestedEmail { get; set; }
    public Dictionary<string, string> Details { get; set; } = new();
}

public class PhoneValidationResult
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? FormattedNumber { get; set; }
    public string? CountryCode { get; set; }
    public string? CountryName { get; set; }
    public string? Carrier { get; set; }
    public string? NumberType { get; set; } // Mobile, Landline, VoIP
    public Dictionary<string, string> Details { get; set; } = new();
}

public class PasswordStrengthResult
{
    public int Score { get; set; } // 0-5
    public string Level { get; set; } = "VeryWeak"; // VeryWeak, Weak, Fair, Strong, VeryStrong
    public string Color { get; set; } = "#ff4d4f";
    public List<string> Suggestions { get; set; } = new();
    public bool HasLowercase { get; set; }
    public bool HasUppercase { get; set; }
    public bool HasNumbers { get; set; }
    public bool HasSpecialChars { get; set; }
    public int Length { get; set; }
    public bool ContainsCommonPassword { get; set; }
    public double EntropyBits { get; set; }
}

public class DomainAvailabilityResult
{
    public bool IsAvailable { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Suggestions { get; set; } = new();
    public string? CurrentOwner { get; set; }
    public bool IsPremium { get; set; }
    public Dictionary<string, string> Details { get; set; } = new();
}

public class CompanyNameValidationResult
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsUnique { get; set; }
    public bool ContainsRestrictedWords { get; set; }
    public List<string> SimilarNames { get; set; } = new();
    public Dictionary<string, string> Details { get; set; } = new();
}

public class IdentityValidationResult
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public string NumberType { get; set; } = string.Empty; // TCKimlik, VergiNo
    public string? FormattedNumber { get; set; }
    public bool IsTestNumber { get; set; }
    public Dictionary<string, string> Details { get; set; } = new();
}