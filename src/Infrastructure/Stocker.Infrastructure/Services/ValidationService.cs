using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Settings;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;
using MediatR;
using Stocker.Application.Features.Tenants.Queries.CheckSubdomainAvailability;

namespace Stocker.Infrastructure.Services;

public class ValidationService : IValidationService
{
    private readonly ILogger<ValidationService> _logger;
    private readonly PasswordPolicy _passwordPolicy;
    private readonly IMediator _mediator;
    private readonly HashSet<string> _commonPasswords;
    private readonly HashSet<string> _disposableEmailDomains;
    private readonly HashSet<string> _restrictedCompanyWords;
    private readonly Dictionary<string, List<string>> _existingDomains;
    private readonly Dictionary<string, List<string>> _existingCompanyNames;

    public ValidationService(
        ILogger<ValidationService> logger,
        IOptions<PasswordPolicy> passwordPolicy,
        IMediator mediator)
    {
        _logger = logger;
        _passwordPolicy = passwordPolicy.Value;
        _mediator = mediator;
        
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
        var result = new EmailValidationResult
        {
            Details = new Dictionary<string, string>()
        };

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
            CountryCode = countryCode,
            Details = new Dictionary<string, string>()
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
            
            // If just subdomain is provided (no dots), check it directly
            if (!domain.Contains('.'))
            {
                // Use MediatR to check subdomain availability from database
                var query = new CheckSubdomainAvailabilityQuery(domain);
                var checkResult = await _mediator.Send(query);
                
                if (checkResult.IsSuccess && checkResult.Value != null)
                {
                    result.IsAvailable = checkResult.Value.Available;
                    result.Message = checkResult.Value.Available 
                        ? "Subdomain kullanılabilir" 
                        : checkResult.Value.Reason ?? "Bu subdomain zaten kullanılıyor";
                    
                    if (!checkResult.Value.Available)
                    {
                        // Generate suggestions
                        result.Suggestions.Add($"{domain}1");
                        result.Suggestions.Add($"{domain}-{DateTime.Now.Year}");
                        result.Suggestions.Add($"{domain}-tr");
                        result.Suggestions.Add($"my{domain}");
                        result.Suggestions.Add($"{domain}app");
                    }
                    
                    // Add the full URL to details
                    if (checkResult.Value.Available)
                    {
                        result.Details["suggestedUrl"] = checkResult.Value.SuggestedUrl;
                    }
                }
                else
                {
                    // Fallback to mock implementation if query fails
                    result.IsAvailable = !_existingDomains.GetValueOrDefault("stocker.app", new List<string>()).Contains(domain);
                    result.Message = result.IsAvailable ? "Subdomain kullanılabilir" : "Bu subdomain zaten kullanılıyor";
                }
            }
            else
            {
                // Handle full domain format (subdomain.domain.tld)
                var parts = domain.Split('.');
                var subdomain = parts[0];
                var baseDomain = string.Join(".", parts.Skip(1));

                // Check if domain is already taken (mock implementation for non-stocker domains)
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
            }

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

    public async Task<IdentityValidationResult> ValidateIdentityNumberAsync(string identityNumber)
    {
        var result = new IdentityValidationResult
        {
            Details = new Dictionary<string, string>()
        };

        try
        {
            if (string.IsNullOrWhiteSpace(identityNumber))
            {
                result.IsValid = false;
                result.Message = "Kimlik/Vergi numarası boş olamaz";
                return result;
            }

            // Remove spaces and non-numeric characters
            identityNumber = Regex.Replace(identityNumber.Trim(), @"\D", "");

            // Check if it's TC Kimlik No (11 digits) or Vergi No (10 digits)
            if (identityNumber.Length == 11)
            {
                result.NumberType = "TCKimlik";
                result.IsValid = ValidateTCKimlikNo(identityNumber);
                result.FormattedNumber = identityNumber;
                
                // Check for test numbers
                result.IsTestNumber = identityNumber == "11111111110" || 
                                    identityNumber == "12345678901" ||
                                    identityNumber == "10000000146";
                
                if (result.IsValid)
                {
                    result.Message = result.IsTestNumber 
                        ? "Test TC Kimlik numarası geçerli" 
                        : "TC Kimlik numarası geçerli";
                    
                    if (result.IsTestNumber)
                    {
                        result.Details["warning"] = "Bu bir test TC Kimlik numarasıdır";
                    }
                }
                else
                {
                    result.Message = "Geçersiz TC Kimlik numarası";
                    result.Details["format"] = "TC Kimlik numarası 11 haneli olmalı ve algoritma kurallarına uymalıdır";
                }
            }
            else if (identityNumber.Length == 10)
            {
                result.NumberType = "VergiNo";
                result.IsValid = ValidateVergiNo(identityNumber);
                result.FormattedNumber = identityNumber;
                
                // Check for test numbers
                result.IsTestNumber = identityNumber == "1234567890" || 
                                    identityNumber == "1111111111" ||
                                    identityNumber == "0000000000";
                
                if (result.IsValid)
                {
                    result.Message = result.IsTestNumber 
                        ? "Test Vergi numarası geçerli" 
                        : "Vergi numarası geçerli";
                    
                    if (result.IsTestNumber)
                    {
                        result.Details["warning"] = "Bu bir test Vergi numarasıdır";
                    }
                }
                else
                {
                    result.Message = "Geçersiz Vergi numarası";
                    result.Details["format"] = "Vergi numarası 10 haneli olmalı ve algoritma kurallarına uymalıdır";
                }
            }
            else
            {
                result.IsValid = false;
                result.Message = "Kimlik/Vergi numarası 10 veya 11 haneli olmalıdır";
                result.Details["info"] = "TC Kimlik No: 11 hane, Vergi No: 10 hane";
            }

            await Task.CompletedTask;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating identity number");
            result.IsValid = false;
            result.Message = "Kimlik/Vergi numarası kontrolü sırasında bir hata oluştu";
            return result;
        }
    }

    public async Task<CompanyNameValidationResult> ValidateCompanyNameAsync(string companyName)
    {
        var result = new CompanyNameValidationResult
        {
            Details = new Dictionary<string, string>(),
            SimilarNames = new List<string>()
        };

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

    private bool ValidateTCKimlikNo(string tcKimlikNo)
    {
        // TC Kimlik No validation algorithm
        // 1. Must be 11 digits
        // 2. First digit cannot be 0
        // 3. 10th digit = ((1st + 3rd + 5th + 7th + 9th) * 7 - (2nd + 4th + 6th + 8th)) % 10
        // 4. 11th digit = sum of first 10 digits % 10

        if (tcKimlikNo.Length != 11)
            return false;

        if (!tcKimlikNo.All(char.IsDigit))
            return false;

        if (tcKimlikNo[0] == '0')
            return false;

        var digits = tcKimlikNo.Select(c => int.Parse(c.ToString())).ToArray();

        // Calculate 10th digit
        var oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        var evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        var tenthDigit = ((oddSum * 7) - evenSum) % 10;

        if (tenthDigit < 0)
            tenthDigit += 10;

        if (digits[9] != tenthDigit)
            return false;

        // Calculate 11th digit
        var firstTenSum = digits.Take(10).Sum();
        var eleventhDigit = firstTenSum % 10;

        if (digits[10] != eleventhDigit)
            return false;

        return true;
    }

    private bool ValidateVergiNo(string vergiNo)
    {
        // Vergi No validation algorithm
        // 1. Must be 10 digits
        // 2. Uses modulo 11 algorithm
        
        if (vergiNo.Length != 10)
            return false;

        if (!vergiNo.All(char.IsDigit))
            return false;

        var digits = vergiNo.Select(c => int.Parse(c.ToString())).ToArray();
        
        // Vergi No algorithm
        var v1 = (digits[0] + 9) % 10;
        var v2 = (v1 * 2) % 9;
        if (v1 != 0 && v2 == 0) v2 = 9;
        var v3 = (digits[1] + 8) % 10;
        var v4 = (v3 * 4) % 9;
        if (v3 != 0 && v4 == 0) v4 = 9;
        var v5 = (digits[2] + 7) % 10;
        var v6 = (v5 * 8) % 9;
        if (v5 != 0 && v6 == 0) v6 = 9;
        var v7 = (digits[3] + 6) % 10;
        var v8 = (v7 * 16) % 9;
        if (v7 != 0 && v8 == 0) v8 = 9;
        var v9 = (digits[4] + 5) % 10;
        var v10 = (v9 * 32) % 9;
        if (v9 != 0 && v10 == 0) v10 = 9;
        var v11 = (digits[5] + 4) % 10;
        var v12 = (v11 * 64) % 9;
        if (v11 != 0 && v12 == 0) v12 = 9;
        var v13 = (digits[6] + 3) % 10;
        var v14 = (v13 * 128) % 9;
        if (v13 != 0 && v14 == 0) v14 = 9;
        var v15 = (digits[7] + 2) % 10;
        var v16 = (v15 * 256) % 9;
        if (v15 != 0 && v16 == 0) v16 = 9;
        var v17 = (digits[8] + 1) % 10;
        var v18 = (v17 * 512) % 9;
        if (v17 != 0 && v18 == 0) v18 = 9;

        var sum = v2 + v4 + v6 + v8 + v10 + v12 + v14 + v16 + v18;
        var lastDigit = (10 - (sum % 10)) % 10;

        return digits[9] == lastDigit;
    }

    #endregion

    public async Task<TenantCodeValidationResult> ValidateTenantCodeAsync(string code)
    {
        var result = new TenantCodeValidationResult
        {
            Details = new Dictionary<string, string>(),
            SuggestedCodes = new List<string>()
        };

        try
        {
            _logger.LogInformation("Validating tenant code: {Code}", code);

            if (string.IsNullOrWhiteSpace(code))
            {
                result.IsAvailable = false;
                result.Message = "Kod boş olamaz";
                return result;
            }

            code = code.Trim().ToLower();

            // Check code format (only lowercase letters, numbers and hyphens)
            if (!Regex.IsMatch(code, @"^[a-z0-9-]+$"))
            {
                result.IsAvailable = false;
                result.Message = "Kod sadece küçük harf, rakam ve tire içerebilir";
                result.Details["format"] = "Geçerli format: abc-123";
                return result;
            }

            // Check minimum and maximum length
            if (code.Length < 3)
            {
                result.IsAvailable = false;
                result.Message = "Kod en az 3 karakter olmalıdır";
                return result;
            }

            if (code.Length > 50)
            {
                result.IsAvailable = false;
                result.Message = "Kod en fazla 50 karakter olabilir";
                return result;
            }

            // Check for reserved codes
            var reservedCodes = new[] { 
                "api", "admin", "master", "www", "app", "mail", "ftp", 
                "blog", "shop", "store", "test", "demo", "staging", 
                "dev", "development", "prod", "production", "system",
                "root", "public", "private", "static", "assets"
            };

            if (reservedCodes.Contains(code))
            {
                result.IsAvailable = false;
                result.IsReserved = true;
                result.Message = "Bu kod sistem tarafından rezerve edilmiştir";
                
                // Suggest alternatives
                result.SuggestedCodes.Add($"{code}-company");
                result.SuggestedCodes.Add($"{code}-tenant");
                result.SuggestedCodes.Add($"my-{code}");
                
                return result;
            }

            // Check if code exists in database using MediatR
            try
            {
                var checkResult = await _mediator.Send(new CheckSubdomainAvailabilityQuery(code));
                
                if (checkResult.IsSuccess && checkResult.Value.Available)
                {
                    result.IsAvailable = true;
                    result.Message = "Bu kod kullanılabilir";
                }
                else
                {
                    result.IsAvailable = false;
                    result.Message = checkResult.Value?.Reason ?? "Bu kod zaten kullanımda";
                    
                    // Generate suggestions
                    result.SuggestedCodes.Add($"{code}-1");
                    result.SuggestedCodes.Add($"{code}-{DateTime.Now.Year}");
                    result.SuggestedCodes.Add($"{code}-new");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking subdomain availability");
                // If database check fails, assume available for now
                result.IsAvailable = true;
                result.Message = "Kod kullanılabilir görünüyor";
                result.Details["warning"] = "Veritabanı kontrolü yapılamadı";
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating tenant code");
            result.IsAvailable = false;
            result.Message = "Kod kontrolü sırasında bir hata oluştu";
            return result;
        }
    }
}