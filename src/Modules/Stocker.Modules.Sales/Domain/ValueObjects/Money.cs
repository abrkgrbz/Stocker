using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.ValueObjects;

/// <summary>
/// Value Object representing monetary amount with currency
/// Immutable and self-validating
/// </summary>
public sealed class Money : ValueObject
{
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "TRY";

    private Money() { }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public static Money Create(decimal amount, string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency code is required", nameof(currency));

        if (currency.Length != 3)
            throw new ArgumentException("Currency code must be 3 characters (ISO 4217)", nameof(currency));

        return new Money(amount, currency.ToUpperInvariant());
    }

    public static Money Zero(string currency = "TRY") => Create(0, currency);

    public Money Add(Money other)
    {
        EnsureSameCurrency(other);
        return Create(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        EnsureSameCurrency(other);
        return Create(Amount - other.Amount, Currency);
    }

    public Money Multiply(decimal factor)
    {
        return Create(Amount * factor, Currency);
    }

    public Money Negate()
    {
        return Create(-Amount, Currency);
    }

    public bool IsPositive => Amount > 0;
    public bool IsNegative => Amount < 0;
    public bool IsZero => Amount == 0;

    private void EnsureSameCurrency(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot perform operation on different currencies: {Currency} vs {other.Currency}");
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    public override string ToString() => $"{Amount:N2} {Currency}";

    public static Money operator +(Money left, Money right) => left.Add(right);
    public static Money operator -(Money left, Money right) => left.Subtract(right);
    public static Money operator *(Money money, decimal factor) => money.Multiply(factor);
    public static Money operator -(Money money) => money.Negate();
}
