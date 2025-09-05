using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;
using System.Text.RegularExpressions;

namespace Stocker.Domain.Common.ValueObjects;

public sealed class Email : ValueObject
{
    private static readonly Regex EmailRegex = new(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string Value { get; private set; }

    // EF Core constructor
    private Email()
    {
        Value = string.Empty;
    }

    private Email(string value)
    {
        Value = value;
    }

    public static Result<Email> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Result<Email>.Failure(new Error("Email.Empty", "E-posta adresi boş olamaz.", ErrorType.Validation));
        }

        if (!EmailRegex.IsMatch(value))
        {
            return Result<Email>.Failure(new Error("Email.Invalid", "Geçersiz e-posta formatı.", ErrorType.Validation));
        }

        return Result<Email>.Success(new Email(value.ToLowerInvariant()));
    }

    public string GetDomain() => Value.Split('@')[1];

    public string GetLocalPart() => Value.Split('@')[0];

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}