using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;
using System.Text.RegularExpressions;

namespace Stocker.Domain.Common.ValueObjects;

public sealed class PhoneNumber : ValueObject
{
    private static readonly Regex PhoneRegex = new(@"^\+?[1-9]\d{1,14}$", RegexOptions.Compiled);

    public string Value { get; }

    private PhoneNumber(string value)
    {
        Value = value;
    }

    public static Result<PhoneNumber> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Result<PhoneNumber>.Failure(new Error("PhoneNumber.Empty", "Phone number cannot be empty.", ErrorType.Validation));
        }

        var cleanedValue = value.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");

        if (!PhoneRegex.IsMatch(cleanedValue))
        {
            return Result<PhoneNumber>.Failure(new Error("PhoneNumber.Invalid", "Invalid phone number format.", ErrorType.Validation));
        }

        return Result<PhoneNumber>.Success(new PhoneNumber(cleanedValue));
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}