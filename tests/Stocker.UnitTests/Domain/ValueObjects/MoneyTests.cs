using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.ValueObjects;

public class MoneyTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateMoney()
    {
        // Arrange
        var amount = 100.50m;
        var currency = "TRY";

        // Act
        var money = Money.Create(amount, currency);

        // Assert
        money.Should().NotBeNull();
        money.Amount.Should().Be(amount);
        money.Currency.Should().Be("TRY"); // Should be uppercase
    }

    [Fact]
    public void Create_WithNegativeAmount_ShouldThrowArgumentException()
    {
        // Act & Assert
        var action = () => Money.Create(-10m, "TRY");
        action.Should().Throw<ArgumentException>()
            .WithMessage("Amount cannot be negative.*");
    }

    [Fact]
    public void Create_WithEmptyCurrency_ShouldThrowArgumentException()
    {
        // Act & Assert
        var action = () => Money.Create(100m, "");
        action.Should().Throw<ArgumentException>()
            .WithMessage("Currency cannot be empty.*");
    }

    [Fact]
    public void Create_WithInvalidCurrencyLength_ShouldThrowArgumentException()
    {
        // Act & Assert
        var action = () => Money.Create(100m, "US");
        action.Should().Throw<ArgumentException>()
            .WithMessage("Currency must be a 3-letter ISO code.*");
    }

    [Fact]
    public void Create_WithLowerCaseCurrency_ShouldConvertToUpperCase()
    {
        // Act
        var money = Money.Create(100m, "try");

        // Assert
        money.Currency.Should().Be("TRY");
    }

    [Fact]
    public void Zero_ShouldCreateMoneyWithZeroAmount()
    {
        // Act
        var money = Money.Zero("USD");

        // Assert
        money.Amount.Should().Be(0);
        money.Currency.Should().Be("USD");
    }

    [Fact]
    public void Add_WithSameCurrency_ShouldReturnSum()
    {
        // Arrange
        var money1 = Money.Create(100m, "TRY");
        var money2 = Money.Create(50m, "TRY");

        // Act
        var result = money1.Add(money2);

        // Assert
        result.Amount.Should().Be(150m);
        result.Currency.Should().Be("TRY");
    }

    [Fact]
    public void Add_WithDifferentCurrency_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var money1 = Money.Create(100m, "TRY");
        var money2 = Money.Create(50m, "USD");

        // Act & Assert
        var action = () => money1.Add(money2);
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot add money with different currencies: TRY and USD");
    }

    [Fact]
    public void Subtract_WithSameCurrency_ShouldReturnDifference()
    {
        // Arrange
        var money1 = Money.Create(100m, "TRY");
        var money2 = Money.Create(30m, "TRY");

        // Act
        var result = money1.Subtract(money2);

        // Assert
        result.Amount.Should().Be(70m);
        result.Currency.Should().Be("TRY");
    }

    [Fact]
    public void Subtract_WithDifferentCurrency_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var money1 = Money.Create(100m, "TRY");
        var money2 = Money.Create(30m, "EUR");

        // Act & Assert
        var action = () => money1.Subtract(money2);
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot subtract money with different currencies: TRY and EUR");
    }

    [Fact]
    public void Multiply_ShouldReturnMultipliedAmount()
    {
        // Arrange
        var money = Money.Create(100m, "TRY");

        // Act
        var result = money.Multiply(1.5m);

        // Assert
        result.Amount.Should().Be(150m);
        result.Currency.Should().Be("TRY");
    }

    [Fact]
    public void Multiply_WithZero_ShouldReturnZero()
    {
        // Arrange
        var money = Money.Create(100m, "TRY");

        // Act
        var result = money.Multiply(0);

        // Assert
        result.Amount.Should().Be(0);
        result.Currency.Should().Be("TRY");
    }

    [Fact]
    public void IsZero_WhenAmountIsZero_ShouldReturnTrue()
    {
        // Arrange
        var money = Money.Zero("TRY");

        // Act
        var result = money.IsZero();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsZero_WhenAmountIsNotZero_ShouldReturnFalse()
    {
        // Arrange
        var money = Money.Create(0.01m, "TRY");

        // Act
        var result = money.IsZero();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void ToString_ShouldFormatCorrectly()
    {
        // Arrange
        var money = Money.Create(1234.5m, "TRY");

        // Act
        var result = money.ToString();

        // Assert
        result.Should().Be("1234.50 TRY");
    }

    [Fact]
    public void Money_WithSameAmountAndCurrency_ShouldBeEqual()
    {
        // Arrange
        var money1 = Money.Create(100m, "TRY");
        var money2 = Money.Create(100m, "TRY");

        // Assert
        money1.Should().Be(money2);
    }

    [Fact]
    public void Money_WithDifferentAmount_ShouldNotBeEqual()
    {
        // Arrange
        var money1 = Money.Create(100m, "TRY");
        var money2 = Money.Create(200m, "TRY");

        // Assert
        money1.Should().NotBe(money2);
    }

    [Fact]
    public void Money_WithDifferentCurrency_ShouldNotBeEqual()
    {
        // Arrange
        var money1 = Money.Create(100m, "TRY");
        var money2 = Money.Create(100m, "USD");

        // Assert
        money1.Should().NotBe(money2);
    }

    [Theory]
    [InlineData(0.01, "TRY", "0.01 TRY")]
    [InlineData(10, "USD", "10.00 USD")]
    [InlineData(999.9, "EUR", "999.90 EUR")]
    [InlineData(1234567.89, "GBP", "1234567.89 GBP")]
    public void ToString_WithVariousValues_ShouldFormatCorrectly(decimal amount, string currency, string expected)
    {
        // Arrange
        var money = Money.Create(amount, currency);

        // Act
        var result = money.ToString();

        // Assert
        result.Should().Be(expected);
    }
}