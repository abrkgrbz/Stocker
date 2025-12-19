using System.Text.RegularExpressions;
using Stocker.SharedKernel.Settings;
using Stocker.SharedKernel.Results;

namespace Stocker.Identity.Services;

/// <summary>
/// Validates passwords against configurable security policies.
/// Checks length, complexity, common passwords, and calculates strength scores.
/// </summary>
public interface IPasswordValidator
{
    /// <summary>
    /// Validates a password against the configured password policy.
    /// Checks length, character requirements, common passwords, and sequential/repeated characters.
    /// </summary>
    /// <param name="password">The password to validate.</param>
    /// <param name="username">Optional username to prevent password containing username.</param>
    /// <param name="email">Optional email to prevent password containing email parts.</param>
    /// <returns>Success with true if valid; Failure with validation errors otherwise.</returns>
    Result<bool> ValidatePassword(string password, string? username = null, string? email = null);

    /// <summary>
    /// Calculates the strength of a password based on various factors.
    /// Considers length, character diversity, common patterns, and entropy.
    /// </summary>
    /// <param name="password">The password to analyze.</param>
    /// <returns>A PasswordStrength object with score (0-5), entropy, feedback, and suggestions.</returns>
    PasswordStrength CalculateStrength(string password);
}

public class PasswordValidator : IPasswordValidator, Application.Common.Interfaces.IPasswordValidator
{
    private readonly PasswordPolicy _policy;
    private readonly HashSet<string> _commonPasswords;

    public PasswordValidator(PasswordPolicy policy)
    {
        _policy = policy;
        _commonPasswords = LoadCommonPasswords();
    }

    public Result<bool> ValidatePassword(string password, string? username = null, string? email = null)
    {
        var errors = new List<Error>();

        if (string.IsNullOrWhiteSpace(password))
        {
            return Result<bool>.Failure(Error.Validation("Password.Empty", "Şifre boş olamaz"));
        }

        // Length checks
        if (password.Length < _policy.MinimumLength)
        {
            errors.Add(Error.Validation("Password.TooShort", 
                $"Şifre en az {_policy.MinimumLength} karakter olmalıdır"));
        }

        if (password.Length > _policy.MaximumLength)
        {
            errors.Add(Error.Validation("Password.TooLong", 
                $"Şifre en fazla {_policy.MaximumLength} karakter olabilir"));
        }

        // Character type requirements
        if (_policy.RequireUppercase && !password.Any(char.IsUpper))
        {
            errors.Add(Error.Validation("Password.NoUppercase", 
                "Şifre en az bir büyük harf içermelidir"));
        }

        if (_policy.RequireLowercase && !password.Any(char.IsLower))
        {
            errors.Add(Error.Validation("Password.NoLowercase", 
                "Şifre en az bir küçük harf içermelidir"));
        }

        if (_policy.RequireDigit && !password.Any(char.IsDigit))
        {
            errors.Add(Error.Validation("Password.NoDigit", 
                "Şifre en az bir rakam içermelidir"));
        }

        if (_policy.RequireNonAlphanumeric && !password.Any(c => _policy.SpecialCharacters.Contains(c)))
        {
            errors.Add(Error.Validation("Password.NoSpecialChar", 
                $"Şifre en az bir özel karakter içermelidir ({_policy.SpecialCharacters})"));
        }

        // Unique character requirement
        if (_policy.RequiredUniqueChars > 0)
        {
            var uniqueChars = password.Distinct().Count();
            if (uniqueChars < _policy.RequiredUniqueChars)
            {
                errors.Add(Error.Validation("Password.NotEnoughUniqueChars", 
                    $"Şifre en az {_policy.RequiredUniqueChars} farklı karakter içermelidir"));
            }
        }

        // Common password check
        if (_policy.PreventCommonPasswords && IsCommonPassword(password))
        {
            errors.Add(Error.Validation("Password.TooCommon", 
                "Bu şifre çok yaygın kullanılıyor, lütfen daha güçlü bir şifre seçin"));
        }

        // User info check
        if (_policy.PreventUserInfoInPassword)
        {
            if (!string.IsNullOrEmpty(username) && 
                password.Contains(username, StringComparison.OrdinalIgnoreCase))
            {
                errors.Add(Error.Validation("Password.ContainsUsername", 
                    "Şifre kullanıcı adınızı içeremez"));
            }

            if (!string.IsNullOrEmpty(email))
            {
                var emailParts = email.Split('@')[0].Split('.');
                foreach (var part in emailParts)
                {
                    if (part.Length > 2 && 
                        password.Contains(part, StringComparison.OrdinalIgnoreCase))
                    {
                        errors.Add(Error.Validation("Password.ContainsEmail", 
                            "Şifre email adresinizin parçalarını içeremez"));
                        break;
                    }
                }
            }
        }

        // Sequential characters check
        if (HasSequentialCharacters(password))
        {
            errors.Add(Error.Validation("Password.Sequential", 
                "Şifre ardışık karakterler içeremez (örn: 123, abc)"));
        }

        // Repeated characters check
        if (HasRepeatedCharacters(password))
        {
            errors.Add(Error.Validation("Password.Repeated", 
                "Şifre 3'ten fazla tekrarlanan karakter içeremez"));
        }

        // Password strength check
        var strength = CalculateStrength(password);
        if ((int)strength.Score < _policy.MinimumStrengthScore)
        {
            errors.Add(Error.Validation("Password.Weak", 
                $"Şifre güvenlik seviyesi yetersiz. Minimum seviye: {GetStrengthLabel(_policy.MinimumStrengthScore)}"));
        }

        if (errors.Any())
        {
            // Use single error for now since Result doesn't support multiple errors directly
            return Result<bool>.Failure(errors.First());
        }

        return Result<bool>.Success(true);
    }

    public PasswordStrength CalculateStrength(string password)
    {
        var score = 0;
        var feedback = new List<string>();

        // Base score from length
        if (password.Length >= 12) score++;
        if (password.Length >= 16) score++;

        // Character diversity
        if (password.Any(char.IsUpper)) score++;
        if (password.Any(char.IsLower)) score++;
        if (password.Any(char.IsDigit)) score++;
        if (password.Any(c => _policy.SpecialCharacters.Contains(c))) score++;

        // Deductions
        if (IsCommonPassword(password))
        {
            score = Math.Max(0, score - 3);
            feedback.Add("Bu şifre çok yaygın kullanılıyor");
        }

        if (HasSequentialCharacters(password))
        {
            score = Math.Max(0, score - 1);
            feedback.Add("Ardışık karakterler güvenliği azaltır");
        }

        if (HasRepeatedCharacters(password))
        {
            score = Math.Max(0, score - 1);
            feedback.Add("Tekrarlayan karakterler güvenliği azaltır");
        }

        // Entropy calculation (simplified)
        var entropy = CalculateEntropy(password);
        if (entropy > 60) score++;

        // Normalize score to 0-5
        score = Math.Min(5, Math.Max(0, score * 5 / 8));

        // Generate suggestions
        var suggestions = new List<string>();
        if (password.Length < 12)
            suggestions.Add("Daha uzun bir şifre kullanın (12+ karakter)");
        if (!password.Any(char.IsUpper))
            suggestions.Add("Büyük harf ekleyin");
        if (!password.Any(char.IsLower))
            suggestions.Add("Küçük harf ekleyin");
        if (!password.Any(char.IsDigit))
            suggestions.Add("Rakam ekleyin");
        if (!password.Any(c => _policy.SpecialCharacters.Contains(c)))
            suggestions.Add("Özel karakter ekleyin");

        return new PasswordStrength
        {
            Score = (PasswordScore)score,
            Entropy = entropy,
            Feedback = feedback,
            Suggestions = suggestions
        };
    }

    private bool IsCommonPassword(string password)
    {
        var lowerPassword = password.ToLowerInvariant();
        return _commonPasswords.Contains(lowerPassword) ||
               ContainsCommonPatterns(lowerPassword);
    }

    private bool ContainsCommonPatterns(string password)
    {
        var patterns = new[]
        {
            @"^(password|parola|sifre|12345|qwerty|admin|user|test)",
            @"(123|234|345|456|567|678|789|890)",
            @"(abc|bcd|cde|def|efg|fgh)",
            @"(qwe|wer|ert|rty|tyu|yui|uio|iop)",
            @"^(.)\1+$", // All same character
            @"^(\d{6,8})$", // Only digits
            @"^([a-z]{6,8})$" // Only lowercase letters
        };

        return patterns.Any(pattern => Regex.IsMatch(password, pattern, RegexOptions.IgnoreCase));
    }

    private bool HasSequentialCharacters(string password)
    {
        const int maxSequential = 3;
        var count = 1;

        for (int i = 1; i < password.Length; i++)
        {
            if (Math.Abs(password[i] - password[i - 1]) == 1)
            {
                count++;
                if (count >= maxSequential)
                    return true;
            }
            else
            {
                count = 1;
            }
        }

        return false;
    }

    private bool HasRepeatedCharacters(string password)
    {
        const int maxRepeated = 3;
        var count = 1;

        for (int i = 1; i < password.Length; i++)
        {
            if (password[i] == password[i - 1])
            {
                count++;
                if (count > maxRepeated)
                    return true;
            }
            else
            {
                count = 1;
            }
        }

        return false;
    }

    private double CalculateEntropy(string password)
    {
        var charsetSize = 0;
        
        if (password.Any(char.IsLower)) charsetSize += 26;
        if (password.Any(char.IsUpper)) charsetSize += 26;
        if (password.Any(char.IsDigit)) charsetSize += 10;
        if (password.Any(c => _policy.SpecialCharacters.Contains(c))) charsetSize += _policy.SpecialCharacters.Length;

        if (charsetSize == 0) return 0;

        return password.Length * Math.Log2(charsetSize);
    }

    private string GetStrengthLabel(int score)
    {
        return score switch
        {
            0 => "Çok Zayıf",
            1 => "Zayıf",
            2 => "Orta",
            3 => "Güçlü",
            4 => "Çok Güçlü",
            5 => "Mükemmel",
            _ => "Bilinmiyor"
        };
    }

    private HashSet<string> LoadCommonPasswords()
    {
        // In production, load from file or database
        return new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "123456", "123456789", "12345678", "12345", "1234567",
            "password", "password1", "password123", "parola", "parola123",
            "qwerty", "qwertyuiop", "qwerty123", "abc123", "monkey",
            "1234567890", "123123", "111111", "000000", "admin",
            "letmein", "welcome", "welcome123", "login", "passw0rd",
            "master", "dragon", "sunshine", "princess", "football",
            "iloveyou", "trustno1", "1234", "123", "test",
            "test123", "demo", "demo123", "user", "user123",
            "admin123", "root", "toor", "pass", "guest",
            "changeme", "password!", "p@ssw0rd", "p@ssword", "pa$$word",
            "sifre", "sifre123", "sifre1234", "kullanici", "yonetici",
            "istanbul", "ankara", "turkiye", "galatasaray", "fenerbahce",
            "besiktas", "trabzonspor", "turkey", "turkish", "ottoman"
        };
    }

    /// <summary>
    /// Explicit interface implementation for Application layer PasswordStrength enum.
    /// </summary>
    Application.Common.Interfaces.PasswordStrength Application.Common.Interfaces.IPasswordValidator.CalculateStrength(string plainPassword)
    {
        var strength = CalculateStrength(plainPassword);
        return (Application.Common.Interfaces.PasswordStrength)(int)strength.Score;
    }
}

/// <summary>
/// Represents the calculated strength of a password.
/// Contains the score, entropy measurement, and improvement suggestions.
/// </summary>
public class PasswordStrength
{
    /// <summary>
    /// The overall strength score from VeryWeak (0) to VeryStrong (5).
    /// </summary>
    public PasswordScore Score { get; set; }

    /// <summary>
    /// The calculated entropy in bits, measuring password randomness.
    /// Higher values indicate stronger passwords.
    /// </summary>
    public double Entropy { get; set; }

    /// <summary>
    /// Feedback messages about weaknesses found in the password.
    /// </summary>
    public List<string> Feedback { get; set; } = new();

    /// <summary>
    /// Suggestions for improving the password strength.
    /// </summary>
    public List<string> Suggestions { get; set; } = new();
}

/// <summary>
/// Enumeration representing password strength levels.
/// Used for UI display and minimum strength requirements.
/// </summary>
public enum PasswordScore
{
    /// <summary>Very weak password, easily guessable.</summary>
    VeryWeak = 0,

    /// <summary>Weak password, vulnerable to basic attacks.</summary>
    Weak = 1,

    /// <summary>Fair password, provides minimal protection.</summary>
    Fair = 2,

    /// <summary>Good password, suitable for most applications.</summary>
    Good = 3,

    /// <summary>Strong password, provides robust security.</summary>
    Strong = 4,

    /// <summary>Very strong password, excellent security level.</summary>
    VeryStrong = 5
}