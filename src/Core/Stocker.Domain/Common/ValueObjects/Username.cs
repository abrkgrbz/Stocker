using System.Text.RegularExpressions;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Domain.Common.ValueObjects;

/// <summary>
/// Value object representing a username.
/// Must be alphanumeric with optional underscores and dots, 3-50 characters.
/// Cannot start with a number or special character.
/// </summary>
public sealed class Username : ValueObject
{
    /// <summary>
    /// Pattern: starts with letter, followed by letters, numbers, underscores, or dots
    /// Examples: john_doe, user.name, Admin123
    /// </summary>
    private static readonly Regex UsernameRegex = new(
        @"^[a-zA-Z][a-zA-Z0-9._]*$",
        RegexOptions.Compiled);

    /// <summary>
    /// Reserved usernames that cannot be used
    /// </summary>
    private static readonly HashSet<string> ReservedUsernames = new(StringComparer.OrdinalIgnoreCase)
    {
        "admin", "administrator", "root", "system", "superuser",
        "support", "help", "info", "contact", "sales",
        "null", "undefined", "anonymous", "guest", "user",
        "moderator", "mod", "owner", "operator"
    };

    public const int MinLength = 3;
    public const int MaxLength = 50;

    public string Value { get; private set; }

    // EF Core constructor
    private Username()
    {
        Value = string.Empty;
    }

    private Username(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new Username with validation
    /// </summary>
    public static Result<Username> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Result<Username>.Failure(
                new Error("Username.Empty", "Kullanıcı adı boş olamaz.", ErrorType.Validation));
        }

        var trimmedValue = value.Trim();

        if (trimmedValue.Length < MinLength)
        {
            return Result<Username>.Failure(
                new Error("Username.TooShort", $"Kullanıcı adı en az {MinLength} karakter olmalıdır.", ErrorType.Validation));
        }

        if (trimmedValue.Length > MaxLength)
        {
            return Result<Username>.Failure(
                new Error("Username.TooLong", $"Kullanıcı adı en fazla {MaxLength} karakter olabilir.", ErrorType.Validation));
        }

        if (!UsernameRegex.IsMatch(trimmedValue))
        {
            return Result<Username>.Failure(
                new Error("Username.InvalidFormat",
                    "Kullanıcı adı harf ile başlamalı ve sadece harf, rakam, alt çizgi veya nokta içerebilir.",
                    ErrorType.Validation));
        }

        // Check for consecutive special characters
        if (trimmedValue.Contains("..") || trimmedValue.Contains("__") || trimmedValue.Contains("_.") || trimmedValue.Contains("._"))
        {
            return Result<Username>.Failure(
                new Error("Username.ConsecutiveSpecialChars",
                    "Kullanıcı adı ardışık özel karakter içeremez.",
                    ErrorType.Validation));
        }

        // Check if ends with special character
        if (trimmedValue.EndsWith('.') || trimmedValue.EndsWith('_'))
        {
            return Result<Username>.Failure(
                new Error("Username.EndsWithSpecialChar",
                    "Kullanıcı adı özel karakter ile bitemez.",
                    ErrorType.Validation));
        }

        if (ReservedUsernames.Contains(trimmedValue))
        {
            return Result<Username>.Failure(
                new Error("Username.Reserved",
                    $"'{trimmedValue}' rezerve edilmiş bir kullanıcı adı olduğundan kullanılamaz.",
                    ErrorType.Validation));
        }

        return Result<Username>.Success(new Username(trimmedValue));
    }

    /// <summary>
    /// Creates a Username without validation (for existing data migration)
    /// Use with caution - only for trusted sources
    /// </summary>
    public static Username CreateUnsafe(string value)
    {
        return new Username(value);
    }

    /// <summary>
    /// Checks if a username is reserved
    /// </summary>
    public static bool IsReserved(string username)
    {
        return ReservedUsernames.Contains(username?.Trim() ?? string.Empty);
    }

    /// <summary>
    /// Gets a display-friendly version (first letter capitalized)
    /// </summary>
    public string ToDisplayName()
    {
        if (string.IsNullOrEmpty(Value))
            return Value;

        return char.ToUpperInvariant(Value[0]) + Value[1..];
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value.ToLowerInvariant(); // Case-insensitive comparison
    }

    public override string ToString() => Value;

    // Implicit conversion to string for convenience
    public static implicit operator string(Username username) => username.Value;
}
