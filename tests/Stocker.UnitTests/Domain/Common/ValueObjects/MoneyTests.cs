using Xunit;
using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using System;

namespace Stocker.UnitTests.Domain.Common.ValueObjects
{
    public class MoneyTests
    {
        [Fact]
        public void Create_Should_Create_Money_With_Valid_Values()
        {
            // Arrange
            var amount = 100.50m;
            var currency = "USD";

            // Act
            var money = Money.Create(amount, currency);

            // Assert
            money.Should().NotBeNull();
            money.Amount.Should().Be(amount);
            money.Currency.Should().Be("USD"); // Should be uppercase
        }

        [Fact]
        public void Create_Should_Convert_Currency_To_Uppercase()
        {
            // Arrange
            var amount = 50m;
            var currency = "eur";

            // Act
            var money = Money.Create(amount, currency);

            // Assert
            money.Currency.Should().Be("EUR");
        }

        [Fact]
        public void Create_Should_Throw_When_Amount_Is_Negative()
        {
            // Arrange
            var amount = -10m;
            var currency = "TRY";

            // Act & Assert
            var action = () => Money.Create(amount, currency);
            action.Should().Throw<ArgumentException>()
                .WithMessage("Amount cannot be negative.*")
                .WithParameterName("amount");
        }

        [Fact]
        public void Create_Should_Throw_When_Currency_Is_Null()
        {
            // Arrange
            var amount = 100m;
            string currency = null;

            // Act & Assert
            var action = () => Money.Create(amount, currency);
            action.Should().Throw<ArgumentException>()
                .WithMessage("Currency cannot be empty.*")
                .WithParameterName("currency");
        }

        [Fact]
        public void Create_Should_Throw_When_Currency_Is_Empty()
        {
            // Arrange
            var amount = 100m;
            var currency = "";

            // Act & Assert
            var action = () => Money.Create(amount, currency);
            action.Should().Throw<ArgumentException>()
                .WithMessage("Currency cannot be empty.*")
                .WithParameterName("currency");
        }

        [Fact]
        public void Create_Should_Throw_When_Currency_Is_Not_Three_Letters()
        {
            // Arrange
            var amount = 100m;

            // Act & Assert - Too short
            var action1 = () => Money.Create(amount, "US");
            action1.Should().Throw<ArgumentException>()
                .WithMessage("Currency must be a 3-letter ISO code.*")
                .WithParameterName("currency");

            // Act & Assert - Too long
            var action2 = () => Money.Create(amount, "EURO");
            action2.Should().Throw<ArgumentException>()
                .WithMessage("Currency must be a 3-letter ISO code.*")
                .WithParameterName("currency");
        }

        [Fact]
        public void Zero_Should_Create_Money_With_Zero_Amount()
        {
            // Arrange
            var currency = "GBP";

            // Act
            var money = Money.Zero(currency);

            // Assert
            money.Amount.Should().Be(0);
            money.Currency.Should().Be("GBP");
            money.IsZero().Should().BeTrue();
        }

        [Fact]
        public void Add_Should_Add_Two_Money_Objects_With_Same_Currency()
        {
            // Arrange
            var money1 = Money.Create(100m, "EUR");
            var money2 = Money.Create(50.50m, "EUR");

            // Act
            var result = money1.Add(money2);

            // Assert
            result.Amount.Should().Be(150.50m);
            result.Currency.Should().Be("EUR");
        }

        [Fact]
        public void Add_Should_Throw_When_Currencies_Are_Different()
        {
            // Arrange
            var money1 = Money.Create(100m, "USD");
            var money2 = Money.Create(50m, "EUR");

            // Act & Assert
            var action = () => money1.Add(money2);
            action.Should().Throw<InvalidOperationException>()
                .WithMessage("Cannot add money with different currencies: USD and EUR");
        }

        [Fact]
        public void Subtract_Should_Subtract_Two_Money_Objects_With_Same_Currency()
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
        public void Subtract_Should_Throw_When_Currencies_Are_Different()
        {
            // Arrange
            var money1 = Money.Create(100m, "GBP");
            var money2 = Money.Create(50m, "USD");

            // Act & Assert
            var action = () => money1.Subtract(money2);
            action.Should().Throw<InvalidOperationException>()
                .WithMessage("Cannot subtract money with different currencies: GBP and USD");
        }

        [Fact]
        public void Multiply_Should_Multiply_Money_By_Factor()
        {
            // Arrange
            var money = Money.Create(100m, "EUR");
            var factor = 1.5m;

            // Act
            var result = money.Multiply(factor);

            // Assert
            result.Amount.Should().Be(150m);
            result.Currency.Should().Be("EUR");
        }

        [Fact]
        public void Multiply_Should_Handle_Zero_Factor()
        {
            // Arrange
            var money = Money.Create(100m, "USD");

            // Act
            var result = money.Multiply(0);

            // Assert
            result.Amount.Should().Be(0);
            result.IsZero().Should().BeTrue();
        }

        [Fact]
        public void IsZero_Should_Return_True_For_Zero_Amount()
        {
            // Arrange
            var money = Money.Create(0m, "USD");

            // Act & Assert
            money.IsZero().Should().BeTrue();
        }

        [Fact]
        public void IsZero_Should_Return_False_For_NonZero_Amount()
        {
            // Arrange
            var money = Money.Create(0.01m, "USD");

            // Act & Assert
            money.IsZero().Should().BeFalse();
        }

        [Fact]
        public void ToString_Should_Format_Money_Correctly()
        {
            // Arrange
            var money = Money.Create(1234.56m, "USD");

            // Act
            var result = money.ToString();

            // Assert
            result.Should().Be("1234.56 USD");
        }

        [Fact]
        public void ToString_Should_Format_With_Two_Decimal_Places()
        {
            // Arrange
            var money = Money.Create(100m, "EUR");

            // Act
            var result = money.ToString();

            // Assert
            result.Should().Be("100.00 EUR");
        }

        [Fact]
        public void Equals_Should_Return_True_For_Same_Amount_And_Currency()
        {
            // Arrange
            var money1 = Money.Create(100.50m, "USD");
            var money2 = Money.Create(100.50m, "USD");

            // Act & Assert
            money1.Should().Be(money2);
            money1.Equals(money2).Should().BeTrue();
            (money1 == money2).Should().BeTrue();
        }

        [Fact]
        public void Equals_Should_Return_False_For_Different_Amount()
        {
            // Arrange
            var money1 = Money.Create(100m, "USD");
            var money2 = Money.Create(200m, "USD");

            // Act & Assert
            money1.Should().NotBe(money2);
            money1.Equals(money2).Should().BeFalse();
            (money1 == money2).Should().BeFalse();
        }

        [Fact]
        public void Equals_Should_Return_False_For_Different_Currency()
        {
            // Arrange
            var money1 = Money.Create(100m, "USD");
            var money2 = Money.Create(100m, "EUR");

            // Act & Assert
            money1.Should().NotBe(money2);
            money1.Equals(money2).Should().BeFalse();
            (money1 == money2).Should().BeFalse();
        }

        [Fact]
        public void GetHashCode_Should_Be_Same_For_Equal_Money_Objects()
        {
            // Arrange
            var money1 = Money.Create(100m, "TRY");
            var money2 = Money.Create(100m, "TRY");

            // Act & Assert
            money1.GetHashCode().Should().Be(money2.GetHashCode());
        }
    }
}