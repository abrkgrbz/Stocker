using System.Text.RegularExpressions;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Domain.Common.ValueObjects;

/// <summary>
/// Value object representing a tenant code (subdomain identifier).
/// Must be lowercase alphanumeric with optional hyphens, 3-50 characters.
/// Used as subdomain prefix: {code}.stoocker.app
/// </summary>
public sealed class TenantCode : ValueObject
{
    /// <summary>
    /// Pattern: lowercase letters, numbers, and hyphens (not at start/end)
    /// Examples: acme, my-company, tenant123
    /// </summary>
    private static readonly Regex TenantCodeRegex = new(
        @"^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
        RegexOptions.Compiled);

    /// <summary>
    /// Reserved codes that cannot be used as tenant codes
    /// </summary>
    private static readonly HashSet<string> ReservedCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        "www", "app", "api", "admin", "master", "system", "root",
        "support", "help", "billing", "auth", "login", "register",
        "static", "assets", "cdn", "mail", "smtp", "ftp",
        "dev", "staging", "test", "demo", "sandbox",
        "null", "undefined", "true", "false"
    };

    public const int MinLength = 3;
    public const int MaxLength = 50;

    public string Value { get; private set; }

    // EF Core constructor
    private TenantCode()
    {
        Value = string.Empty;
    }

    private TenantCode(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new TenantCode with validation
    /// </summary>
    public static Result<TenantCode> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Result<TenantCode>.Failure(
                new Error("TenantCode.Empty", "Tenant kodu boş olamaz.", ErrorType.Validation));
        }

        var normalizedValue = value.Trim().ToLowerInvariant();

        if (normalizedValue.Length < MinLength)
        {
            return Result<TenantCode>.Failure(
                new Error("TenantCode.TooShort", $"Tenant kodu en az {MinLength} karakter olmalıdır.", ErrorType.Validation));
        }

        if (normalizedValue.Length > MaxLength)
        {
            return Result<TenantCode>.Failure(
                new Error("TenantCode.TooLong", $"Tenant kodu en fazla {MaxLength} karakter olabilir.", ErrorType.Validation));
        }

        if (!TenantCodeRegex.IsMatch(normalizedValue))
        {
            return Result<TenantCode>.Failure(
                new Error("TenantCode.InvalidFormat",
                    "Tenant kodu sadece küçük harf, rakam ve tire içerebilir. Tire ile başlayamaz veya bitemez.",
                    ErrorType.Validation));
        }

        if (ReservedCodes.Contains(normalizedValue))
        {
            return Result<TenantCode>.Failure(
                new Error("TenantCode.Reserved",
                    $"'{normalizedValue}' rezerve edilmiş bir kod olduğundan kullanılamaz.",
                    ErrorType.Validation));
        }

        return Result<TenantCode>.Success(new TenantCode(normalizedValue));
    }

    /// <summary>
    /// Checks if a code is reserved
    /// </summary>
    public static bool IsReserved(string code)
    {
        return ReservedCodes.Contains(code?.ToLowerInvariant() ?? string.Empty);
    }

    /// <summary>
    /// Gets the full subdomain URL
    /// </summary>
    public string ToSubdomain(string baseDomain = "stoocker.app")
    {
        return $"{Value}.{baseDomain}";
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    // Implicit conversion to string for convenience
    public static implicit operator string(TenantCode code) => code.Value;
}
