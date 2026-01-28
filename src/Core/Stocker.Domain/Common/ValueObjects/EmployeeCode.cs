using System.Text.RegularExpressions;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Domain.Common.ValueObjects;

/// <summary>
/// Value object representing an employee code.
/// Typically follows company-specific patterns like EMP001, HR-2024-001, etc.
/// </summary>
public sealed class EmployeeCode : ValueObject
{
    /// <summary>
    /// Pattern: alphanumeric with optional hyphens
    /// Examples: EMP001, HR-2024-001, A123, 12345
    /// </summary>
    private static readonly Regex EmployeeCodeRegex = new(
        @"^[A-Z0-9]+(-[A-Z0-9]+)*$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public const int MinLength = 2;
    public const int MaxLength = 30;

    public string Value { get; private set; }

    // EF Core constructor
    private EmployeeCode()
    {
        Value = string.Empty;
    }

    private EmployeeCode(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new EmployeeCode with validation
    /// </summary>
    public static Result<EmployeeCode> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Result<EmployeeCode>.Failure(
                new Error("EmployeeCode.Empty", "Personel kodu boş olamaz.", ErrorType.Validation));
        }

        var normalizedValue = value.Trim().ToUpperInvariant();

        if (normalizedValue.Length < MinLength)
        {
            return Result<EmployeeCode>.Failure(
                new Error("EmployeeCode.TooShort", $"Personel kodu en az {MinLength} karakter olmalıdır.", ErrorType.Validation));
        }

        if (normalizedValue.Length > MaxLength)
        {
            return Result<EmployeeCode>.Failure(
                new Error("EmployeeCode.TooLong", $"Personel kodu en fazla {MaxLength} karakter olabilir.", ErrorType.Validation));
        }

        if (!EmployeeCodeRegex.IsMatch(normalizedValue))
        {
            return Result<EmployeeCode>.Failure(
                new Error("EmployeeCode.InvalidFormat",
                    "Personel kodu sadece harf, rakam ve tire içerebilir.",
                    ErrorType.Validation));
        }

        // Check for leading/trailing hyphens
        if (normalizedValue.StartsWith('-') || normalizedValue.EndsWith('-'))
        {
            return Result<EmployeeCode>.Failure(
                new Error("EmployeeCode.InvalidHyphen",
                    "Personel kodu tire ile başlayamaz veya bitemez.",
                    ErrorType.Validation));
        }

        return Result<EmployeeCode>.Success(new EmployeeCode(normalizedValue));
    }

    /// <summary>
    /// Creates an EmployeeCode without validation (for existing data migration)
    /// </summary>
    public static EmployeeCode CreateUnsafe(string value)
    {
        return new EmployeeCode(value?.ToUpperInvariant() ?? string.Empty);
    }

    /// <summary>
    /// Generates a sequential employee code with prefix
    /// </summary>
    /// <param name="prefix">Prefix like "EMP", "HR"</param>
    /// <param name="sequence">Sequential number</param>
    /// <param name="padding">Zero padding length (default 4 = 0001)</param>
    public static Result<EmployeeCode> Generate(string prefix, int sequence, int padding = 4)
    {
        if (string.IsNullOrWhiteSpace(prefix))
        {
            return Result<EmployeeCode>.Failure(
                new Error("EmployeeCode.EmptyPrefix", "Önek boş olamaz.", ErrorType.Validation));
        }

        if (sequence < 0)
        {
            return Result<EmployeeCode>.Failure(
                new Error("EmployeeCode.InvalidSequence", "Sıra numarası negatif olamaz.", ErrorType.Validation));
        }

        var code = $"{prefix.ToUpperInvariant()}{sequence.ToString().PadLeft(padding, '0')}";
        return Create(code);
    }

    /// <summary>
    /// Extracts the numeric part if present
    /// </summary>
    public int? GetNumericPart()
    {
        var numericPart = new string(Value.Where(char.IsDigit).ToArray());
        if (int.TryParse(numericPart, out var number))
        {
            return number;
        }
        return null;
    }

    /// <summary>
    /// Extracts the prefix part (letters before numbers)
    /// </summary>
    public string GetPrefix()
    {
        var match = Regex.Match(Value, @"^([A-Z-]+)");
        return match.Success ? match.Groups[1].Value.TrimEnd('-') : string.Empty;
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    // Implicit conversion to string for convenience
    public static implicit operator string(EmployeeCode code) => code.Value;
}
