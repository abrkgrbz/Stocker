using Stocker.SharedKernel.Primitives;
using System.Text.RegularExpressions;

namespace Stocker.Domain.Master.ValueObjects;

public sealed class TenantIdentifier : ValueObject
{
    private static readonly Regex IdentifierRegex = new(@"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$", RegexOptions.Compiled);

    public string Value { get; }

    private TenantIdentifier(string value)
    {
        Value = value;
    }

    public static TenantIdentifier Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Tenant identifier cannot be empty.", nameof(value));
        }

        var normalizedValue = value.ToLowerInvariant().Trim();

        if (normalizedValue.Length < 3 || normalizedValue.Length > 63)
        {
            throw new ArgumentException("Tenant identifier must be between 3 and 63 characters.", nameof(value));
        }

        if (!IdentifierRegex.IsMatch(normalizedValue))
        {
            throw new ArgumentException("Tenant identifier can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.", nameof(value));
        }

        return new TenantIdentifier(normalizedValue);
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}