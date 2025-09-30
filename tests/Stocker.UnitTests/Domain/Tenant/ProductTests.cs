using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Common.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class ProductTests
{
    private readonly Guid _tenantId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldCreateProduct()
    {
        // Arrange
        var name = "Test Product";
        var description = "Product description";
        var code = "PROD001";
        var price = Money.Create(100.50m, "TRY");

        // Act
        var product = Product.Create(_tenantId, name, description, code, price);

        // Assert
        product.Should().NotBeNull();
        product.TenantId.Should().Be(_tenantId);
        product.Name.Should().Be(name);
        product.Description.Should().Be(description);
        product.Code.Should().Be(code);
        product.Price.Should().Be(price);
        product.StockQuantity.Should().Be(0);
        product.MinimumStockLevel.Should().Be(0);
        product.ReorderLevel.Should().Be(0);
        product.VatRate.Should().Be(18); // Default VAT rate
        product.IsActive.Should().BeTrue();
        product.CostPrice.Should().BeNull();
        product.Barcode.Should().BeNull();
        product.Unit.Should().BeNull();
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var price = Money.Create(100m, "TRY");

        // Act & Assert
        var action = () => Product.Create(_tenantId, "", "Description", "CODE001", price);
        action.Should().Throw<ArgumentException>()
            .WithMessage("Product name cannot be empty*");
    }

    [Fact]
    public void Create_WithEmptyCode_ShouldThrowArgumentException()
    {
        // Arrange
        var price = Money.Create(100m, "TRY");

        // Act & Assert
        var action = () => Product.Create(_tenantId, "Product", "Description", "", price);
        action.Should().Throw<ArgumentException>()
            .WithMessage("Product code cannot be empty*");
    }

    [Fact]
    public void Create_WithNullPrice_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => Product.Create(_tenantId, "Product", "Description", "CODE001", null!);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("price");
    }

    [Fact]
    public void UpdatePricing_WithValidPrices_ShouldUpdatePrices()
    {
        // Arrange
        var product = CreateValidProduct();
        var newPrice = Money.Create(150m, "TRY");
        var costPrice = Money.Create(80m, "TRY");

        // Act
        product.UpdatePricing(newPrice, costPrice);

        // Assert
        product.Price.Should().Be(newPrice);
        product.CostPrice.Should().Be(costPrice);
    }

    [Fact]
    public void UpdatePricing_WithDifferentCurrencies_ShouldThrowArgumentException()
    {
        // Arrange
        var product = CreateValidProduct();
        var newPrice = Money.Create(150m, "TRY");
        var costPrice = Money.Create(80m, "USD");

        // Act & Assert
        var action = () => product.UpdatePricing(newPrice, costPrice);
        action.Should().Throw<ArgumentException>()
            .WithMessage("Cost price currency must match selling price currency");
    }

    [Fact]
    public void SetBarcode_ShouldSetBarcodeValue()
    {
        // Arrange
        var product = CreateValidProduct();
        var barcode = "8690123456789";

        // Act
        product.SetBarcode(barcode);

        // Assert
        product.Barcode.Should().Be(barcode);
    }

    [Fact]
    public void SetUnit_ShouldSetUnitValue()
    {
        // Arrange
        var product = CreateValidProduct();
        var unit = "Adet";

        // Act
        product.SetUnit(unit);

        // Assert
        product.Unit.Should().Be(unit);
    }

    [Fact]
    public void SetVatRate_WithValidRate_ShouldSetRate()
    {
        // Arrange
        var product = CreateValidProduct();
        var vatRate = 8m;

        // Act
        product.SetVatRate(vatRate);

        // Assert
        product.VatRate.Should().Be(vatRate);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    [InlineData(150)]
    public void SetVatRate_WithInvalidRate_ShouldThrowArgumentException(decimal vatRate)
    {
        // Arrange
        var product = CreateValidProduct();

        // Act & Assert
        var action = () => product.SetVatRate(vatRate);
        action.Should().Throw<ArgumentException>()
            .WithMessage("VAT rate must be between 0 and 100*");
    }

    [Fact]
    public void SetStockLevels_WithValidLevels_ShouldSetLevels()
    {
        // Arrange
        var product = CreateValidProduct();
        var minimumStock = 10m;
        var reorderLevel = 20m;

        // Act
        product.SetStockLevels(minimumStock, reorderLevel);

        // Assert
        product.MinimumStockLevel.Should().Be(minimumStock);
        product.ReorderLevel.Should().Be(reorderLevel);
    }

    [Fact]
    public void SetStockLevels_WithNegativeMinimum_ShouldThrowArgumentException()
    {
        // Arrange
        var product = CreateValidProduct();

        // Act & Assert
        var action = () => product.SetStockLevels(-5m, 10m);
        action.Should().Throw<ArgumentException>()
            .WithMessage("Minimum stock level cannot be negative*");
    }

    [Fact]
    public void SetStockLevels_WithNegativeReorder_ShouldThrowArgumentException()
    {
        // Arrange
        var product = CreateValidProduct();

        // Act & Assert
        var action = () => product.SetStockLevels(10m, -5m);
        action.Should().Throw<ArgumentException>()
            .WithMessage("Reorder level cannot be negative*");
    }

    [Fact]
    public void UpdateStock_ShouldAddToCurrentStock()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetStock(50m);

        // Act
        product.UpdateStock(25m);

        // Assert
        product.StockQuantity.Should().Be(75m);
    }

    [Fact]
    public void UpdateStock_WithNegativeAmount_ShouldSubtractFromStock()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetStock(50m);

        // Act
        product.UpdateStock(-20m);

        // Assert
        product.StockQuantity.Should().Be(30m);
    }

    [Fact]
    public void UpdateStock_BelowZero_ShouldSetToZero()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetStock(10m);

        // Act
        product.UpdateStock(-20m);

        // Assert
        product.StockQuantity.Should().Be(0);
    }

    [Fact]
    public void SetStock_WithPositiveQuantity_ShouldSetStock()
    {
        // Arrange
        var product = CreateValidProduct();

        // Act
        product.SetStock(100m);

        // Assert
        product.StockQuantity.Should().Be(100m);
    }

    [Fact]
    public void SetStock_WithNegativeQuantity_ShouldThrowArgumentException()
    {
        // Arrange
        var product = CreateValidProduct();

        // Act & Assert
        var action = () => product.SetStock(-10m);
        action.Should().Throw<ArgumentException>()
            .WithMessage("Stock quantity cannot be negative*");
    }

    [Fact]
    public void Activate_ShouldSetIsActiveToTrue()
    {
        // Arrange
        var product = CreateValidProduct();
        product.Deactivate();

        // Act
        product.Activate();

        // Assert
        product.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Deactivate_ShouldSetIsActiveToFalse()
    {
        // Arrange
        var product = CreateValidProduct();

        // Act
        product.Deactivate();

        // Assert
        product.IsActive.Should().BeFalse();
    }

    [Fact]
    public void IsInStock_WhenStockPositive_ShouldReturnTrue()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetStock(10m);

        // Act
        var result = product.IsInStock();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsInStock_WhenStockZero_ShouldReturnFalse()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetStock(0m);

        // Act
        var result = product.IsInStock();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void NeedsReorder_WhenBelowReorderLevel_ShouldReturnTrue()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetStockLevels(10m, 20m); // Min: 10, Reorder: 20
        product.SetStock(15m); // Between min and reorder

        // Act
        var result = product.NeedsReorder();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void NeedsReorder_WhenAboveReorderLevel_ShouldReturnFalse()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetStockLevels(10m, 20m);
        product.SetStock(25m);

        // Act
        var result = product.NeedsReorder();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsBelowMinimumStock_WhenBelowMinimum_ShouldReturnTrue()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetStockLevels(10m, 20m);
        product.SetStock(5m);

        // Act
        var result = product.IsBelowMinimumStock();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsBelowMinimumStock_WhenAboveMinimum_ShouldReturnFalse()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetStockLevels(10m, 20m);
        product.SetStock(15m);

        // Act
        var result = product.IsBelowMinimumStock();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void GetProfitMargin_WithCostPrice_ShouldCalculateCorrectly()
    {
        // Arrange
        var product = CreateValidProduct();
        var sellingPrice = Money.Create(150m, "TRY");
        var costPrice = Money.Create(100m, "TRY");
        product.UpdatePricing(sellingPrice, costPrice);

        // Act
        var margin = product.GetProfitMargin();

        // Assert
        margin.Should().Be(50m); // (150-100)/100 * 100 = 50%
    }

    [Fact]
    public void GetProfitMargin_WithoutCostPrice_ShouldReturnZero()
    {
        // Arrange
        var product = CreateValidProduct();

        // Act
        var margin = product.GetProfitMargin();

        // Assert
        margin.Should().Be(0);
    }

    [Fact]
    public void GetProfitMargin_WithZeroCostPrice_ShouldReturnZero()
    {
        // Arrange
        var product = CreateValidProduct();
        var sellingPrice = Money.Create(150m, "TRY");
        var costPrice = Money.Create(0m, "TRY");
        product.UpdatePricing(sellingPrice, costPrice);

        // Act
        var margin = product.GetProfitMargin();

        // Assert
        margin.Should().Be(0);
    }

    [Fact]
    public void SetCategory_ShouldSetCategoryId()
    {
        // Arrange
        var product = CreateValidProduct();
        var categoryId = Guid.NewGuid();

        // Act
        product.SetCategory(categoryId);

        // Assert
        product.CategoryId.Should().Be(categoryId);
    }

    [Fact]
    public void SetCategory_WithNull_ShouldClearCategoryId()
    {
        // Arrange
        var product = CreateValidProduct();
        product.SetCategory(Guid.NewGuid());

        // Act
        product.SetCategory(null);

        // Assert
        product.CategoryId.Should().BeNull();
    }

    [Fact]
    public void SetSupplier_ShouldSetSupplierId()
    {
        // Arrange
        var product = CreateValidProduct();
        var supplierId = Guid.NewGuid();

        // Act
        product.SetSupplier(supplierId);

        // Assert
        product.SupplierId.Should().Be(supplierId);
    }

    [Fact]
    public void SetTenantId_ShouldUpdateTenantId()
    {
        // Arrange
        var product = CreateValidProduct();
        var newTenantId = Guid.NewGuid();

        // Act
        product.SetTenantId(newTenantId);

        // Assert
        product.TenantId.Should().Be(newTenantId);
    }

    private Product CreateValidProduct()
    {
        var price = Money.Create(100m, "TRY");
        return Product.Create(_tenantId, "Test Product", "Description", "PROD001", price);
    }
}