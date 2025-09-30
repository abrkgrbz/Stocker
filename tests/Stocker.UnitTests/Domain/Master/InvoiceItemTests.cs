using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class InvoiceItemTests
{
    private readonly Guid _invoiceId = Guid.NewGuid();

    [Fact]
    public void Constructor_WithValidData_ShouldCreateInvoiceItem()
    {
        // Arrange
        var description = "Product A";
        var quantity = 5;
        var unitPrice = Money.Create(25.50m, "USD");
        var lineTotal = Money.Create(127.50m, "USD");

        // Act
        var item = new InvoiceItem(_invoiceId, description, quantity, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.Id.Should().NotBeEmpty();
        item.InvoiceId.Should().Be(_invoiceId);
        item.Description.Should().Be(description);
        item.Quantity.Should().Be(quantity);
        item.UnitPrice.Should().Be(unitPrice);
        item.LineTotal.Should().Be(lineTotal);
    }

    [Fact]
    public void Constructor_WithNullDescription_ShouldThrowArgumentNullException()
    {
        // Arrange
        var unitPrice = Money.Create(25.50m, "USD");
        var lineTotal = Money.Create(127.50m, "USD");

        // Act
        var action = () => new InvoiceItem(_invoiceId, null!, 5, unitPrice, lineTotal);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("description");
    }

    [Fact]
    public void Constructor_WithEmptyDescription_ShouldCreateInvoiceItem()
    {
        // Arrange
        var unitPrice = Money.Create(25.50m, "USD");
        var lineTotal = Money.Create(0m, "USD");

        // Act
        var item = new InvoiceItem(_invoiceId, "", 1, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.Description.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithNullUnitPrice_ShouldThrowArgumentNullException()
    {
        // Arrange
        var lineTotal = Money.Create(127.50m, "USD");

        // Act
        var action = () => new InvoiceItem(_invoiceId, "Product", 5, null!, lineTotal);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("unitPrice");
    }

    [Fact]
    public void Constructor_WithNullLineTotal_ShouldThrowArgumentNullException()
    {
        // Arrange
        var unitPrice = Money.Create(25.50m, "USD");

        // Act
        var action = () => new InvoiceItem(_invoiceId, "Product", 5, unitPrice, null!);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("lineTotal");
    }

    [Fact]
    public void Constructor_WithZeroQuantity_ShouldThrowArgumentException()
    {
        // Arrange
        var unitPrice = Money.Create(25.50m, "USD");
        var lineTotal = Money.Create(0m, "USD");

        // Act
        var action = () => new InvoiceItem(_invoiceId, "Product", 0, unitPrice, lineTotal);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Quantity must be greater than zero.*")
            .WithParameterName("quantity");
    }

    [Fact]
    public void Constructor_WithNegativeQuantity_ShouldThrowArgumentException()
    {
        // Arrange
        var unitPrice = Money.Create(25.50m, "USD");
        var lineTotal = Money.Create(0m, "USD"); // Use zero instead of negative

        // Act
        var action = () => new InvoiceItem(_invoiceId, "Product", -5, unitPrice, lineTotal);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Quantity must be greater than zero.*")
            .WithParameterName("quantity");
    }

    [Fact]
    public void Constructor_WithLargeQuantity_ShouldCreateInvoiceItem()
    {
        // Arrange
        var quantity = 10000;
        var unitPrice = Money.Create(0.01m, "USD");
        var lineTotal = Money.Create(100m, "USD");

        // Act
        var item = new InvoiceItem(_invoiceId, "Bulk Item", quantity, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.Quantity.Should().Be(quantity);
    }

    [Fact]
    public void Constructor_WithDifferentCurrencies_ShouldCreateInvoiceItem()
    {
        // Arrange
        var unitPrice = Money.Create(25.50m, "EUR");
        var lineTotal = Money.Create(127.50m, "EUR");

        // Act
        var item = new InvoiceItem(_invoiceId, "European Product", 5, unitPrice, lineTotal);

        // Assert
        item.UnitPrice.Currency.Should().Be("EUR");
        item.LineTotal.Currency.Should().Be("EUR");
    }

    [Fact]
    public void Constructor_WithMismatchedTotalCalculation_ShouldStillCreate()
    {
        // The entity doesn't validate if lineTotal matches quantity * unitPrice
        // This is the responsibility of the Invoice aggregate
        
        // Arrange
        var quantity = 5;
        var unitPrice = Money.Create(10m, "USD");
        var lineTotal = Money.Create(100m, "USD"); // Should be 50, but we pass 100

        // Act
        var item = new InvoiceItem(_invoiceId, "Product", quantity, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.LineTotal.Amount.Should().Be(100m); // Uses the provided value
    }

    [Fact]
    public void Constructor_WithDecimalQuantity_ShouldCreateInvoiceItem()
    {
        // Quantity is an int, but testing with fractional unit prices
        var quantity = 3;
        var unitPrice = Money.Create(33.33m, "USD");
        var lineTotal = Money.Create(99.99m, "USD");

        // Act
        var item = new InvoiceItem(_invoiceId, "Product with decimal price", quantity, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.UnitPrice.Amount.Should().Be(33.33m);
        item.LineTotal.Amount.Should().Be(99.99m);
    }

    [Fact]
    public void Constructor_WithLongDescription_ShouldCreateInvoiceItem()
    {
        // Arrange
        var longDescription = new string('A', 1000);
        var unitPrice = Money.Create(10m, "USD");
        var lineTotal = Money.Create(10m, "USD");

        // Act
        var item = new InvoiceItem(_invoiceId, longDescription, 1, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.Description.Should().HaveLength(1000);
    }

    [Fact]
    public void Constructor_WithEmptyGuidInvoiceId_ShouldCreateInvoiceItem()
    {
        // The entity doesn't validate the invoice ID
        // Arrange
        var unitPrice = Money.Create(10m, "USD");
        var lineTotal = Money.Create(10m, "USD");

        // Act
        var item = new InvoiceItem(Guid.Empty, "Product", 1, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.InvoiceId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void MultipleItems_WithSameData_ShouldHaveDifferentIds()
    {
        // Arrange
        var unitPrice = Money.Create(10m, "USD");
        var lineTotal = Money.Create(10m, "USD");

        // Act
        var item1 = new InvoiceItem(_invoiceId, "Product", 1, unitPrice, lineTotal);
        var item2 = new InvoiceItem(_invoiceId, "Product", 1, unitPrice, lineTotal);

        // Assert
        item1.Id.Should().NotBe(item2.Id);
        item1.InvoiceId.Should().Be(item2.InvoiceId);
        item1.Description.Should().Be(item2.Description);
    }

    [Fact]
    public void Constructor_WithSpecialCharactersInDescription_ShouldCreateInvoiceItem()
    {
        // Arrange
        var description = "Product™ with © symbols & special chars: @#$%^&*()[]{}";
        var unitPrice = Money.Create(10m, "USD");
        var lineTotal = Money.Create(10m, "USD");

        // Act
        var item = new InvoiceItem(_invoiceId, description, 1, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.Description.Should().Be(description);
    }

    [Fact]
    public void Constructor_WithUnicodeDescription_ShouldCreateInvoiceItem()
    {
        // Arrange
        var description = "商品 🎁 مُنتج Ürün";
        var unitPrice = Money.Create(10m, "USD");
        var lineTotal = Money.Create(10m, "USD");

        // Act
        var item = new InvoiceItem(_invoiceId, description, 1, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.Description.Should().Be(description);
    }

    [Fact]
    public void Constructor_WithZeroUnitPrice_ShouldCreateInvoiceItem()
    {
        // Free items are valid
        var unitPrice = Money.Create(0m, "USD");
        var lineTotal = Money.Create(0m, "USD");

        // Act
        var item = new InvoiceItem(_invoiceId, "Free Sample", 10, unitPrice, lineTotal);

        // Assert
        item.Should().NotBeNull();
        item.UnitPrice.Amount.Should().Be(0);
        item.LineTotal.Amount.Should().Be(0);
    }
}