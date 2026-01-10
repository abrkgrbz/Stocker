namespace Stocker.Modules.Finance.Domain.ValueObjects;

/// <summary>
/// Para birimi ve tutarı temsil eden Value Object.
/// Immutable ve self-validating.
/// </summary>
public sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public static Money Create(decimal amount, string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Para birimi boş olamaz.", nameof(currency));

        if (currency.Length != 3)
            throw new ArgumentException("Para birimi 3 karakter olmalıdır (ISO 4217).", nameof(currency));

        return new Money(Math.Round(amount, 2), currency.ToUpperInvariant());
    }

    public static Money Zero(string currency = "TRY") => Create(0, currency);

    public static Money TRY(decimal amount) => Create(amount, "TRY");
    public static Money USD(decimal amount) => Create(amount, "USD");
    public static Money EUR(decimal amount) => Create(amount, "EUR");

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

    public Money Divide(decimal divisor)
    {
        if (divisor == 0)
            throw new DivideByZeroException("Sıfıra bölünemez.");

        return Create(Amount / divisor, Currency);
    }

    public Money Negate() => Create(-Amount, Currency);

    public Money Abs() => Create(Math.Abs(Amount), Currency);

    public bool IsZero => Amount == 0;
    public bool IsPositive => Amount > 0;
    public bool IsNegative => Amount < 0;

    public Money ConvertTo(string targetCurrency, decimal exchangeRate)
    {
        if (exchangeRate <= 0)
            throw new ArgumentException("Döviz kuru sıfırdan büyük olmalıdır.", nameof(exchangeRate));

        return Create(Amount * exchangeRate, targetCurrency);
    }

    private void EnsureSameCurrency(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException(
                $"Farklı para birimleri ile işlem yapılamaz: {Currency} vs {other.Currency}");
    }

    public static Money operator +(Money left, Money right) => left.Add(right);
    public static Money operator -(Money left, Money right) => left.Subtract(right);
    public static Money operator *(Money money, decimal factor) => money.Multiply(factor);
    public static Money operator /(Money money, decimal divisor) => money.Divide(divisor);
    public static Money operator -(Money money) => money.Negate();

    public static bool operator >(Money left, Money right)
    {
        left.EnsureSameCurrency(right);
        return left.Amount > right.Amount;
    }

    public static bool operator <(Money left, Money right)
    {
        left.EnsureSameCurrency(right);
        return left.Amount < right.Amount;
    }

    public static bool operator >=(Money left, Money right)
    {
        left.EnsureSameCurrency(right);
        return left.Amount >= right.Amount;
    }

    public static bool operator <=(Money left, Money right)
    {
        left.EnsureSameCurrency(right);
        return left.Amount <= right.Amount;
    }

    public override string ToString() => $"{Amount:N2} {Currency}";

    public string ToFormattedString()
    {
        return Currency switch
        {
            "TRY" => $"₺{Amount:N2}",
            "USD" => $"${Amount:N2}",
            "EUR" => $"€{Amount:N2}",
            "GBP" => $"£{Amount:N2}",
            _ => $"{Amount:N2} {Currency}"
        };
    }
}
