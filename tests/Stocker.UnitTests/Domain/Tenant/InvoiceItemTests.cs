using System;
using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class InvoiceItemTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _invoiceId = Guid.NewGuid();
    private readonly Guid _productId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldCreateInvoiceItem()
    {
        // Arrange
        var unitPrice = Money.Create(100, "TRY");

        // Act
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            unitPrice
        );

        // Assert
        item.Should().NotBeNull();
        item.TenantId.Should().Be(_tenantId);
        item.InvoiceId.Should().Be(_invoiceId);
        item.ProductId.Should().Be(_productId);
        item.ProductName.Should().Be("Product 1");
        item.Quantity.Should().Be(2);
        item.UnitPrice.Amount.Should().Be(100);
        item.TotalPrice.Amount.Should().Be(200); // 100 * 2
        item.DiscountPercentage.Should().BeNull();
        item.DiscountAmount.Should().BeNull();
        item.TaxRate.Should().BeNull();
        item.TaxAmount.Should().BeNull();
    }

    [Fact]
    public void Create_WithNullProductName_ShouldThrowArgumentException()
    {
        // Arrange
        var unitPrice = Money.Create(100, "TRY");

        // Act & Assert
        var act = () => InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            null!,
            2,
            unitPrice
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Product name cannot be empty*");
    }

    [Fact]
    public void Create_WithEmptyProductName_ShouldThrowArgumentException()
    {
        // Arrange
        var unitPrice = Money.Create(100, "TRY");

        // Act & Assert
        var act = () => InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "",
            2,
            unitPrice
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Product name cannot be empty*");
    }

    [Fact]
    public void Create_WithZeroQuantity_ShouldThrowArgumentException()
    {
        // Arrange
        var unitPrice = Money.Create(100, "TRY");

        // Act & Assert
        var act = () => InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            0,
            unitPrice
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Quantity must be greater than zero*");
    }

    [Fact]
    public void Create_WithNegativeQuantity_ShouldThrowArgumentException()
    {
        // Arrange
        var unitPrice = Money.Create(100, "TRY");

        // Act & Assert
        var act = () => InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            -1,
            unitPrice
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Quantity must be greater than zero*");
    }

    [Fact]
    public void Create_WithNegativeUnitPrice_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(-100, "TRY")
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Amount cannot be negative*");
    }

    [Fact]
    public void SetDescription_ShouldUpdateDescription()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act
        item.SetDescription("This is a product description");

        // Assert
        item.Description.Should().Be("This is a product description");
    }

    [Fact]
    public void SetQuantity_WithValidQuantity_ShouldUpdateQuantityAndRecalculateTotal()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act
        item.SetQuantity(5);

        // Assert
        item.Quantity.Should().Be(5);
        item.TotalPrice.Amount.Should().Be(500); // 100 * 5
    }

    [Fact]
    public void SetQuantity_WithZero_ShouldThrowArgumentException()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act & Assert
        var act = () => item.SetQuantity(0);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Quantity must be greater than zero*");
    }

    [Fact]
    public void SetQuantity_WithNegative_ShouldThrowArgumentException()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act & Assert
        var act = () => item.SetQuantity(-5);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Quantity must be greater than zero*");
    }

    [Fact]
    public void SetUnitPrice_WithValidPrice_ShouldUpdatePriceAndRecalculateTotal()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        var newPrice = Money.Create(150, "TRY");

        // Act
        item.SetUnitPrice(newPrice);

        // Assert
        item.UnitPrice.Amount.Should().Be(150);
        item.TotalPrice.Amount.Should().Be(300); // 150 * 2
    }

    [Fact]
    public void SetUnitPrice_WithNegativePrice_ShouldThrowArgumentException()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act & Assert
        var act = () => item.SetUnitPrice(Money.Create(-50, "TRY"));

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Amount cannot be negative*");
    }

    [Fact]
    public void ApplyDiscount_WithValidPercentage_ShouldCalculateDiscountAndUpdateTotal()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act
        item.ApplyDiscount(10); // 10% discount

        // Assert
        item.DiscountPercentage.Should().Be(10);
        item.DiscountAmount.Should().NotBeNull();
        item.DiscountAmount!.Amount.Should().Be(20); // 200 * 0.10
        item.TotalPrice.Amount.Should().Be(180); // 200 - 20
    }

    [Fact]
    public void ApplyDiscount_WithZeroPercentage_ShouldNotApplyDiscount()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act
        item.ApplyDiscount(0);

        // Assert
        item.DiscountPercentage.Should().Be(0);
        item.TotalPrice.Amount.Should().Be(200);
    }

    [Fact]
    public void ApplyDiscount_With100Percentage_ShouldMakeTotalZero()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act
        item.ApplyDiscount(100);

        // Assert
        item.DiscountPercentage.Should().Be(100);
        item.DiscountAmount!.Amount.Should().Be(200);
        item.TotalPrice.Amount.Should().Be(0);
    }

    [Fact]
    public void ApplyDiscount_WithNegativePercentage_ShouldThrowArgumentException()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act & Assert
        var act = () => item.ApplyDiscount(-10);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Discount percentage must be between 0 and 100*");
    }

    [Fact]
    public void ApplyDiscount_WithOver100Percentage_ShouldThrowArgumentException()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act & Assert
        var act = () => item.ApplyDiscount(101);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Discount percentage must be between 0 and 100*");
    }

    [Fact]
    public void ApplyTax_WithValidRate_ShouldCalculateTaxAndUpdateTotal()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act
        item.ApplyTax(18); // 18% tax

        // Assert
        item.TaxRate.Should().Be(18);
        item.TaxAmount.Should().NotBeNull();
        item.TaxAmount!.Amount.Should().Be(36); // 200 * 0.18
        item.TotalPrice.Amount.Should().Be(236); // 200 + 36
    }

    [Fact]
    public void ApplyTax_WithZeroRate_ShouldNotApplyTax()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act
        item.ApplyTax(0);

        // Assert
        item.TaxRate.Should().Be(0);
        item.TotalPrice.Amount.Should().Be(200);
    }

    [Fact]
    public void ApplyTax_WithNegativeRate_ShouldThrowArgumentException()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act & Assert
        var act = () => item.ApplyTax(-5);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Tax rate cannot be negative*");
    }

    [Fact]
    public void ApplyDiscountAndTax_ShouldCalculateCorrectTotal()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        // Act
        item.ApplyDiscount(10); // 10% discount
        item.ApplyTax(18); // 18% tax

        // Assert
        // Base: 200
        // After 10% discount: 180
        // After 18% tax on 180: 180 + 32.4 = 212.4
        item.DiscountAmount!.Amount.Should().Be(20);
        item.TaxAmount!.Amount.Should().Be(32.4M);
        item.TotalPrice.Amount.Should().Be(212.4M);
    }

    [Fact]
    public void SetTenantId_ShouldUpdateTenantId()
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        var newTenantId = Guid.NewGuid();

        // Act
        item.SetTenantId(newTenantId);

        // Assert
        item.TenantId.Should().Be(newTenantId);
    }

    [Theory]
    [InlineData(1, 100, 0, 0, 100)]       // No discount, no tax
    [InlineData(2, 100, 10, 0, 180)]      // 10% discount, no tax
    [InlineData(1, 100, 0, 18, 118)]      // No discount, 18% tax
    [InlineData(3, 50, 20, 8, 129.6)]     // 20% discount, 8% tax: 150 - 30 = 120, 120 + 9.6 = 129.6
    [InlineData(5, 75, 15, 20, 382.5)]    // 15% discount, 20% tax: 375 - 56.25 = 318.75, 318.75 + 63.75 = 382.5
    public void CalculateTotal_WithVariousScenarios_ShouldCalculateCorrectly(
        decimal quantity,
        decimal unitPrice,
        decimal discountPercentage,
        decimal taxRate,
        decimal expectedTotal)
    {
        // Arrange
        var item = InvoiceItem.Create(
            _tenantId,
            _invoiceId,
            _productId,
            "Product 1",
            quantity,
            Money.Create(unitPrice, "TRY")
        );

        // Act
        if (discountPercentage > 0)
            item.ApplyDiscount(discountPercentage);

        if (taxRate > 0)
            item.ApplyTax(taxRate);

        // Assert
        item.TotalPrice.Amount.Should().Be(expectedTotal);
    }
}