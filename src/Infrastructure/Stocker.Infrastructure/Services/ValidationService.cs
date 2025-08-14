using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Settings;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace Stocker.Infrastructure.Services;

public class ValidationService : IValidationService
{
    private readonly ILogger<ValidationService> _logger;
    private readonly PasswordPolicy _passwordPolicy;
    private readonly HashSet<string> _commonPasswords;
    private readonly HashSet<string> _disposableEmailDomains;
    private readonly HashSet<string> _restrictedCompanyWords;
    private readonly Dictionary<string, List<string>> _existingDomains;
    private readonly Dictionary<string, List<string>> _existingCompanyNames;

    public ValidationService(
        ILogger<ValidationService> logger,
        IOptions<PasswordPolicy> passwordPolicy)
    {
        _logger = logger;
        _passwordPolicy = passwordPolicy.Value;
        
        // Initialize common passwords list (in production, load from file/database)
        _commonPasswords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "password", "123456", "password123", "12345678", "qwerty", "abc123",
            "123456789", "password1", "1234567", "12345", "iloveyou", "admin",
            "welcome", "monkey", "1234567890", "password@123", "Password1"
        };

        // Initialize disposable email domains (in production, load from API/database)
        _disposableEmailDomains = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com",
            "10minutemail.com", "trashmail.com", "yopmail.com", "fakeinbox.com"
        };

        // Initialize restricted company words
        _restrictedCompanyWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "admin", "administrator", "root", "system", "test", "demo", "example",
            "stocker", "microsoft", "google", "apple", "amazon", "facebook", "meta"
        };

        // Mock existing domains (in production, check from database)
        _existingDomains = new Dictionary<string, List<string>>
        {
            ["stocker.app"] = new List<string> { "test", "demo", "example", "admin", "system" }
        };

        // Mock existing company names (in production, check from database)
        _existingCompanyNames = new Dictionary<string, List<string>>
        {
            ["tr"] = new List<string> { "ABC Teknoloji", "XYZ Yazılım", "Test Company", "Demo Şirket" }
        };
    }

    public async Task<EmailValidationResult> ValidateEmailAsync(string email)
    {
        var result = new EmailValidationResult();

        try
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                result.IsValid = false;
                result.Message = "Email adresi boş olamaz";
                return result;
            }

            email = email.Trim().ToLower();

            // Basic email format validation
            var emailRegex = new Regex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
            if (!emailRegex.IsMatch(email))
            {
                result.IsValid = false;
                result.Message = "Geçersiz email formatı";
                
                // Suggest corrections
                if (!email.Contains('@'))
                {
                    result.Details["suggestion"] = "Email adresi @ işareti içermelidir";
                }
                else if (!email.Contains('.'))
                {
                    result.Details["suggestion"] = "Email adresi geçerli bir domain uzantısı içermelidir";
                }
                
                return result;
            }

            var parts = email.Split('@');
            var localPart = parts[0];
            var domain = parts[1];

            // Check for disposable email
            result.IsDisposable = _disposableEmailDomains.Contains(domain);
            if (result.IsDisposable)
            {
                result.Details["warning"] = "Geçici email adresleri kabul edilmemektedir";
            }

            // Normalize email
            result.NormalizedEmail = email;

            // Check MX records (simplified - in production use DNS lookup)
            result.HasMxRecord = !result.IsDisposable && domain.Contains(".");

            // Check for typos in common domains
            var commonDomains = new Dictionary<string, string>
            {
                ["gmial.com"] = "gmail.com",
                ["gmai.com"] = "gmail.com",
                ["gmil.com"] = "gmail.com",
                ["yahooo.com"] = "yahoo.com",
                ["yaho.com"] = "yahoo.com",
                ["homail.com"] = "hotmail.com",
                ["hotmial.com"] = "hotmail.com",
                ["outlok.com"] = "outlook.com"
            };

            if (commonDomains.ContainsKey(domain))
            {
                result.SuggestedEmail = $"{localPart}@{commonDomains[domain]}";
                result.Details["suggestion"] = $"Belki şunu mu demek istediniz: {result.SuggestedEmail}";
            }

            // Final validation
            result.IsValid = !result.IsDisposable && result.HasMxRecord;
            result.Message = result.IsValid 
                ? "Email adresi geçerli" 
                : result.IsDisposable 
                    ? "Geçici email adresleri kabul edilmemektedir"
                    : "Email adresi doğrulanamadı";

            await Task.CompletedTask;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating email: {Email}", email);
            result.IsValid = false;
            result.Message = "Email doğrulama sırasında bir hata oluştu";
            return result;
        }
    }

    public async Task<PhoneValidationResult> ValidatePhoneAsync(string phoneNumber, string countryCode = "TR")
    {
        var result = new PhoneValidationResult
        {
            CountryCode = countryCode
        };

        try
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
            {
                result.IsValid = false;
                result.Message = "Telefon numarası boş olamaz";
                return result;
            }

            // Remove all non-numeric characters
            var cleaned = Regex.Replace(phoneNumber, @"\D", "");

            // Country-specific validation
            switch (countryCode.ToUpper())
            {
                case "TR":
                    result.CountryName = "Türkiye";
                    
                    // Turkish phone number validation
                    // Format: 5XXXXXXXXX (10 digits starting with 5 for mobile)
                    // Or: 905XXXXXXXXX (12 digits with country code)
                    if (cleaned.StartsWith("90"))
                    {
                        cleaned = cleaned.Substring(2);
                    }
                    
                    if (cleaned.StartsWith("0"))
                    {
                        cleaned = cleaned.Substring(1);
                    }

                    if (cleaned.Length != 10)
                    {
                        result.IsValid = false;
                        result.Message = "Telefon numarası 10 haneli olmalıdır";
                        result.Details["format"] = "5XX XXX XX XX";
                        return result;
                    }

                    if (!cleaned.StartsWith("5"))
                    {
                        result.IsValid = false;
                        result.Message = "Mobil telefon numarası 5 ile başlamalıdır";
                        return result;
                    }

                    // Format the number
                    result.FormattedNumber = $"+90 {cleaned.Substring(0, 3)} {cleaned.Substring(3, 3)} {cleaned.Substring(6, 2)} {cleaned.Substring(8, 2)}";
                    result.NumberType = "Mobile";
                    
                    // Detect carrier (simplified)
                    var prefix = cleaned.Substring(0, 3);
                    result.Carrier = prefix switch
                    {
                        "530" or "531" or "532" or "533" or "534" or "535" or "536" or "537" or "538" or "539" => "Turkcell",
                        "540" or "541" or "542" or "543" or "544" or "545" or "546" or "547" or "548" or "549" => "Vodafone",
                        "501" or "505" or "506" or "507" or "551" or "552" or "553" or "554" or "555" or "556" or "557" or "558" or "559" => "Türk Telekom",
                        _ => "Bilinmeyen"
                    };

                    result.IsValid = true;
                    result.Message = "Telefon numarası geçerli";
                    break;

                case "US":
                    result.CountryName = "United States";
                    
                    // US phone number validation (simplified)
                    if (cleaned.StartsWith("1"))
                    {
                        cleaned = cleaned.Substring(1);
                    }

                    if (cleaned.Length != 10)
                    {
                        result.IsValid = false;
                        result.Message = "Phone number must be 10 digits";
                        return result;
                    }

                    result.FormattedNumber = $"+1 ({cleaned.Substring(0, 3)}) {cleaned.Substring(3, 3)}-{cleaned.Substring(6, 4)}";
                    result.NumberType = "Unknown";
                    result.IsValid = true;
                    result.Message = "Phone number is valid";
                    break;

                default:
                    // Generic validation
                    if (cleaned.Length < 7 || cleaned.Length > 15)
                    {
                        result.IsValid = false;
                        result.Message = "Invalid phone number length";
                        return result;
                    }

                    result.FormattedNumber = phoneNumber;
                    result.IsValid = true;
                    result.Message = "Phone number appears valid";
                    break;
            }

            await Task.CompletedTask;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating phone number: {PhoneNumber}", phoneNumber);
            result.IsValid = false;
            result.Message = "Telefon doğrulama sırasında bir hata oluştu";
            return result;
        }
    }

    public async Task<PasswordStrengthResult> CheckPasswordStrengthAsync(string password)
    {
        var result = new PasswordStrengthResult();

        try
        {
            if (string.IsNullOrEmpty(password))
            {
                result.Score = 0;
                result.Level = "VeryWeak";
                result.Color = "#ff4d4f";
                result.Suggestions.Add("Şifre boş olamaz");
                return result;
            }

            result.Length = password.Length;
            var score = 0;

            // Length check
            if (password.Length >= _passwordPolicy.MinimumLength)
            {
                score++;
                if (password.Length >= 12) score++;
                if (password.Length >= 16) score++;
            }
            else
            {
                result.Suggestions.Add($"En az {_passwordPolicy.MinimumLength} karakter kullanın");
            }

            // Character type checks
            result.HasLowercase = Regex.IsMatch(password, @"[a-z]");
            if (result.HasLowercase)
                score++;
            else if (_passwordPolicy.RequireLowercase)
                result.Suggestions.Add("Küçük harf ekleyin");

            result.HasUppercase = Regex.IsMatch(password, @"[A-Z]");
            if (result.HasUppercase)
                score++;
            else if (_passwordPolicy.RequireUppercase)
                result.Suggestions.Add("Büyük harf ekleyin");

            result.HasNumbers = Regex.IsMatch(password, @"\d");
            if (result.HasNumbers)
                score++;
            else if (_passwordPolicy.RequireDigit)
                result.Suggestions.Add("Rakam ekleyin");

            result.HasSpecialChars = Regex.IsMatch(password, @"[!@#$%^&*(),.?""':{}|<>]");
            if (result.HasSpecialChars)
                score++;
            else if (_passwordPolicy.RequireNonAlphanumeric)
                result.Suggestions.Add("Özel karakter ekleyin (!@#$%^&*)");

            // Check for common passwords
            result.ContainsCommonPassword = _commonPasswords.Contains(password.ToLower());
            if (result.ContainsCommonPassword)
            {
                score = Math.Max(0, score - 3);
                result.Suggestions.Add("Bu şifre çok yaygın kullanılıyor, başka bir şifre seçin");
            }

            // Check for sequential or repeated characters
            if (HasSequentialChars(password) || HasRepeatedChars(password))
            {
                score = Math.Max(0, score - 1);
                result.Suggestions.Add("Ardışık veya tekrarlayan karakterlerden kaçının");
            }

            // Calculate entropy
            result.EntropyBits = CalculateEntropy(password);
            if (result.EntropyBits < 30)
            {
                result.Suggestions.Add("Daha karmaşık bir şifre kullanın");
            }

            // Normalize score to 0-5
            result.Score = Math.Min(5, Math.Max(0, score));

            // Set level and color based on score
            (result.Level, result.Color) = result.Score switch
            {
                0 => ("VeryWeak", "#ff4d4f"),
                1 => ("Weak", "#faad14"),
                2 => ("Fair", "#fadb14"),
                3 => ("Strong", "#52c41a"),
                4 => ("Strong", "#52c41a"),
                5 => ("VeryStrong", "#389e0d"),
                _ => ("VeryWeak", "#ff4d4f")
            };

            await Task.CompletedTask;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking password strength");
            result.Score = 0;
            result.Level = "VeryWeak";
            result.Color = "#ff4d4f";
            result.Suggestions.Add("Şifre gücü kontrol edilemedi");
            return result;
        }
    }

    public async Task<DomainAvailabilityResult> CheckDomainAvailabilityAsync(string domain)
    {
        var result = new DomainAvailabilityResult();

        try
        {
            if (string.IsNullOrWhiteSpace(domain))
            {
                result.IsAvailable = false;
                result.Message = "Domain adı boş olamaz";
                return result;
            }

            domain = domain.Trim().ToLower();

            // Extract subdomain and base domain
            var parts = domain.Split('.');
            if (parts.Length < 2)
            {
                result.IsAvailable = false;
                result.Message = "Geçersiz domain formatı";
                return result;
            }

            var subdomain = parts[0];
            var baseDomain = string.Join(".", parts.Skip(1));

            // Check if domain is already taken (mock implementation)
            if (_existingDomains.ContainsKey(baseDomain))
            {
                result.IsAvailable = !_existingDomains[baseDomain].Contains(subdomain);
            }
            else
            {
                result.IsAvailable = true;
            }

            if (!result.IsAvailable)
            {
                result.Message = "Bu domain zaten kullanılıyor";
                result.CurrentOwner = "Başka bir kullanıcı";
                
                // Generate suggestions
                result.Suggestions.Add($"{subdomain}1.{baseDomain}");
                result.Suggestions.Add($"{subdomain}-company.{baseDomain}");
                result.Suggestions.Add($"{subdomain}{DateTime.Now.Year}.{baseDomain}");
                result.Suggestions.Add($"my{subdomain}.{baseDomain}");
                result.Suggestions.Add($"{subdomain}-tr.{baseDomain}");
            }
            else
            {
                result.Message = "Domain kullanılabilir";
                
                // Check if it's a premium domain
                if (subdomain.Length <= 3 || IsPremiumWord(subdomain))
                {
                    result.IsPremium = true;
                    result.Details["note"] = "Bu premium bir domain olabilir";
                }
            }

            await Task.CompletedTask;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking domain availability: {Domain}", domain);
            result.IsAvailable = false;
            result.Message = "Domain kontrolü sırasında bir hata oluştu";
            return result;
        }
    }

    public async Task<CompanyNameValidationResult> ValidateCompanyNameAsync(string companyName)
    {
        var result = new CompanyNameValidationResult();

        try
        {
            if (string.IsNullOrWhiteSpace(companyName))
            {
                result.IsValid = false;
                result.Message = "Şirket adı boş olamaz";
                return result;
            }

            companyName = companyName.Trim();

            // Check minimum length
            if (companyName.Length < 3)
            {
                result.IsValid = false;
                result.Message = "Şirket adı en az 3 karakter olmalıdır";
                return result;
            }

            // Check for restricted words
            result.ContainsRestrictedWords = _restrictedCompanyWords.Any(word => 
                companyName.Contains(word, StringComparison.OrdinalIgnoreCase));

            if (result.ContainsRestrictedWords)
            {
                result.IsValid = false;
                result.Message = "Şirket adı kısıtlı kelimeler içeriyor";
                result.Details["restriction"] = "Admin, System, Test gibi kelimeler kullanılamaz";
                return result;
            }

            // Check if company name is unique (mock implementation)
            var normalizedName = companyName.ToLower();
            result.IsUnique = !_existingCompanyNames["tr"].Any(name => 
                name.ToLower() == normalizedName);

            if (!result.IsUnique)
            {
                result.IsValid = false;
                result.Message = "Bu şirket adı zaten kayıtlı";
                
                // Find similar names
                result.SimilarNames = _existingCompanyNames["tr"]
                    .Where(name => LevenshteinDistance(name.ToLower(), normalizedName) <= 3)
                    .Take(3)
                    .ToList();
            }
            else
            {
                result.IsValid = true;
                result.Message = "Şirket adı kullanılabilir";
                
                // Check for similar existing names (for warning)
                var similarNames = _existingCompanyNames["tr"]
                    .Where(name => LevenshteinDistance(name.ToLower(), normalizedName) <= 5)
                    .Take(3)
                    .ToList();

                if (similarNames.Any())
                {
                    result.SimilarNames = similarNames;
                    result.Details["warning"] = "Benzer şirket isimleri mevcut";
                }
            }

            await Task.CompletedTask;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating company name: {CompanyName}", companyName);
            result.IsValid = false;
            result.Message = "Şirket adı kontrolü sırasında bir hata oluştu";
            return result;
        }
    }

    #region Helper Methods

    private bool HasSequentialChars(string password)
    {
        const string sequences = "abcdefghijklmnopqrstuvwxyz0123456789";
        var lower = password.ToLower();
        
        for (int i = 0; i < lower.Length - 2; i++)
        {
            var substring = lower.Substring(i, 3);
            if (sequences.Contains(substring))
                return true;
        }
        
        return false;
    }

    private bool HasRepeatedChars(string password)
    {
        for (int i = 0; i < password.Length - 2; i++)
        {
            if (password[i] == password[i + 1] && password[i] == password[i + 2])
                return true;
        }
        
        return false;
    }

    private double CalculateEntropy(string password)
    {
        var charSetSize = 0;
        
        if (Regex.IsMatch(password, @"[a-z]")) charSetSize += 26;
        if (Regex.IsMatch(password, @"[A-Z]")) charSetSize += 26;
        if (Regex.IsMatch(password, @"\d")) charSetSize += 10;
        if (Regex.IsMatch(password, @"[^a-zA-Z0-9]")) charSetSize += 32;
        
        if (charSetSize == 0) return 0;
        
        return password.Length * Math.Log2(charSetSize);
    }

    private bool IsPremiumWord(string word)
    {
        var premiumWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "app", "web", "api", "cloud", "tech", "soft", "dev", "code",
            "data", "ai", "ml", "iot", "vr", "ar", "crypto", "blockchain"
        };
        
        return premiumWords.Contains(word);
    }

    private int LevenshteinDistance(string s1, string s2)
    {
        if (string.IsNullOrEmpty(s1)) return s2?.Length ?? 0;
        if (string.IsNullOrEmpty(s2)) return s1.Length;

        var d = new int[s1.Length + 1, s2.Length + 1];

        for (int i = 0; i <= s1.Length; i++)
            d[i, 0] = i;

        for (int j = 0; j <= s2.Length; j++)
            d[0, j] = j;

        for (int i = 1; i <= s1.Length; i++)
        {
            for (int j = 1; j <= s2.Length; j++)
            {
                var cost = s1[i - 1] == s2[j - 1] ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost);
            }
        }

        return d[s1.Length, s2.Length];
    }

    #endregion
}