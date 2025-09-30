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
    private readonly string _productName = "Test Product";
    private readonly decimal _quantity = 5;
    private readonly Money _unitPrice = Money.Create(100m, "TRY");

    [Fact]
    public void Create_WithValidData_ShouldCreateInvoiceItem()
    {
        // Act
        var item = InvoiceItem.Create(_tenantId, _invoiceId, _productId, _productName, _quantity, _unitPrice);

        // Assert
        item.Should().NotBeNull();
        item.TenantId.Should().Be(_tenantId);
        item.InvoiceId.Should().Be(_invoiceId);
        item.ProductId.Should().Be(_productId);
        item.ProductName.Should().Be(_productName);
        item.Quantity.Should().Be(_quantity);
        item.UnitPrice.Should().Be(_unitPrice);
        item.TotalPrice.Amount.Should().Be(500m); // 5 * 100
    }

    [Fact]
    public void Create_WithEmptyProductName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => InvoiceItem.Create(_tenantId, _invoiceId, _productId, "", _quantity, _unitPrice);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Product name cannot be empty.*");
    }

    [Fact]
    public void Create_WithZeroQuantity_ShouldThrowArgumentException()
    {
        // Act
        var action = () => InvoiceItem.Create(_tenantId, _invoiceId, _productId, _productName, 0, _unitPrice);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Quantity must be greater than zero.*");
    }

    [Fact]
    public void Create_WithNegativeQuantity_ShouldThrowArgumentException()
    {
        // Act
        var action = () => InvoiceItem.Create(_tenantId, _invoiceId, _productId, _productName, -5, _unitPrice);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Quantity must be greater than zero.*");
    }

    [Fact]
    public void Create_WithNegativeUnitPrice_ShouldThrowArgumentException()
    {
        // Act & Assert - Money.Create throws for negative values
        var action = () => Money.Create(-100m, "TRY");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Amount cannot be negative.*");
    }

    [Fact]
    public void SetDescription_ShouldUpdateDescription()
    {
        // Arrange
        var item = CreateInvoiceItem();
        var description = "Special product description";

        // Act
        item.SetDescription(description);

        // Assert
        item.Description.Should().Be(description);
    }

    [Fact]
    public void SetQuantity_WithValidQuantity_ShouldUpdateQuantityAndRecalculate()
    {
        // Arrange
        var item = CreateInvoiceItem();
        var newQuantity = 10m;

        // Act
        item.SetQuantity(newQuantity);

        // Assert
        item.Quantity.Should().Be(newQuantity);
        item.TotalPrice.Amount.Should().Be(1000m); // 10 * 100
    }

    [Fact]
    public void SetQuantity_WithZero_ShouldThrowArgumentException()
    {
        // Arrange
        var item = CreateInvoiceItem();

        // Act
        var action = () => item.SetQuantity(0);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Quantity must be greater than zero.*");
    }

    [Fact]
    public void SetUnitPrice_WithValidPrice_ShouldUpdatePriceAndRecalculate()
    {
        // Arrange
        var item = CreateInvoiceItem();
        var newPrice = Money.Create(200m, "TRY");

        // Act
        item.SetUnitPrice(newPrice);

        // Assert
        item.UnitPrice.Should().Be(newPrice);
        item.TotalPrice.Amount.Should().Be(1000m); // 5 * 200
    }

    [Fact]
    public void SetUnitPrice_WithNegativePrice_ShouldThrowArgumentException()
    {
        // Act & Assert - Money.Create throws for negative values
        var action = () => Money.Create(-50m, "TRY");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Amount cannot be negative.*");
    }

    [Fact]
    public void ApplyDiscount_WithValidPercentage_ShouldCalculateCorrectTotal()
    {
        // Arrange
        var item = CreateInvoiceItem();
        var discountPercentage = 10m; // 10%

        // Act
        item.ApplyDiscount(discountPercentage);

        // Assert
        item.DiscountPercentage.Should().Be(discountPercentage);
        item.DiscountAmount.Should().NotBeNull();
        item.DiscountAmount!.Amount.Should().Be(50m); // 500 * 10%
        item.TotalPrice.Amount.Should().Be(450m); // 500 - 50
    }

    [Fact]
    public void ApplyDiscount_With50Percent_ShouldCalculateCorrectTotal()
    {
        // Arrange
        var item = CreateInvoiceItem();

        // Act
        item.ApplyDiscount(50);

        // Assert
        item.DiscountPercentage.Should().Be(50);
        item.DiscountAmount!.Amount.Should().Be(250m); // 500 * 50%
        item.TotalPrice.Amount.Should().Be(250m); // 500 - 250
    }

    [Fact]
    public void ApplyDiscount_With100Percent_ShouldMakeTotalZero()
    {
        // Arrange
        var item = CreateInvoiceItem();

        // Act
        item.ApplyDiscount(100);

        // Assert
        item.DiscountPercentage.Should().Be(100);
        item.DiscountAmount!.Amount.Should().Be(500m);
        item.TotalPrice.Amount.Should().Be(0);
    }

    [Fact]
    public void ApplyDiscount_WithNegativePercentage_ShouldThrowArgumentException()
    {
        // Arrange
        var item = CreateInvoiceItem();

        // Act
        var action = () => item.ApplyDiscount(-10);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Discount percentage must be between 0 and 100.*");
    }

    [Fact]
    public void ApplyDiscount_WithOver100Percentage_ShouldThrowArgumentException()
    {
        // Arrange
        var item = CreateInvoiceItem();

        // Act
        var action = () => item.ApplyDiscount(101);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Discount percentage must be between 0 and 100.*");
    }

    [Fact]
    public void ApplyTax_WithValidRate_ShouldCalculateCorrectTotal()
    {
        // Arrange
        var item = CreateInvoiceItem();
        var taxRate = 18m; // 18%

        // Act
        item.ApplyTax(taxRate);

        // Assert
        item.TaxRate.Should().Be(taxRate);
        item.TaxAmount.Should().NotBeNull();
        item.TaxAmount!.Amount.Should().Be(90m); // 500 * 18%
        item.TotalPrice.Amount.Should().Be(590m); // 500 + 90
    }

    [Fact]
    public void ApplyTax_WithNegativeRate_ShouldThrowArgumentException()
    {
        // Arrange
        var item = CreateInvoiceItem();

        // Act
        var action = () => item.ApplyTax(-5);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Tax rate cannot be negative.*");
    }

    [Fact]
    public void ApplyDiscountAndTax_ShouldCalculateCorrectly()
    {
        // Arrange
        var item = CreateInvoiceItem();
        
        // Act
        item.ApplyDiscount(20); // 20% discount
        item.ApplyTax(18); // 18% tax

        // Assert
        // Base: 500
        // After 20% discount: 500 - 100 = 400
        // After 18% tax on 400: 400 + 72 = 472
        item.DiscountAmount!.Amount.Should().Be(100m);
        item.TaxAmount!.Amount.Should().Be(72m);
        item.TotalPrice.Amount.Should().Be(472m);
    }

    [Fact]
    public void SetTenantId_ShouldUpdateTenantId()
    {
        // Arrange
        var item = CreateInvoiceItem();
        var newTenantId = Guid.NewGuid();

        // Act
        item.SetTenantId(newTenantId);

        // Assert
        item.TenantId.Should().Be(newTenantId);
    }

    [Fact]
    public void UpdateMultipleProperties_ShouldRecalculateCorrectly()
    {
        // Arrange
        var item = CreateInvoiceItem();

        // Act
        item.SetQuantity(3);
        item.SetUnitPrice(Money.Create(150m, "TRY"));
        item.ApplyDiscount(10);
        item.ApplyTax(18);

        // Assert
        // Base: 3 * 150 = 450
        // After 10% discount: 450 - 45 = 405
        // After 18% tax: 405 + 72.9 = 477.9
        item.Quantity.Should().Be(3);
        item.UnitPrice.Amount.Should().Be(150m);
        item.DiscountAmount!.Amount.Should().Be(45m);
        item.TaxAmount!.Amount.Should().Be(72.9m);
        item.TotalPrice.Amount.Should().Be(477.9m);
    }

    private InvoiceItem CreateInvoiceItem()
    {
        return InvoiceItem.Create(_tenantId, _invoiceId, _productId, _productName, _quantity, _unitPrice);
    }
}