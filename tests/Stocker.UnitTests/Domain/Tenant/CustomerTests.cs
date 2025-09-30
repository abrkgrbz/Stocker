using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Common.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class CustomerTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    
    [Fact]
    public void Create_WithValidData_ShouldCreateCustomer()
    {
        // Arrange
        var name = "Test Customer";
        var email = Email.Create("customer@example.com").Value;
        var phone = PhoneNumber.Create("+905551234567").Value;
        var address = Address.Create("123 Main St", "Istanbul", "Turkey", "34000");

        // Act
        var customer = Customer.Create(_tenantId, name, email, phone, address);

        // Assert
        customer.Should().NotBeNull();
        customer.TenantId.Should().Be(_tenantId);
        customer.Name.Should().Be(name);
        customer.Email.Should().Be(email);
        customer.Phone.Should().Be(phone);
        customer.Address.Should().Be(address);
        customer.IsActive.Should().BeTrue();
        customer.CurrentBalance.Should().Be(0);
        customer.CreditLimit.Should().Be(0);
        customer.TaxNumber.Should().BeNull();
        customer.TaxOffice.Should().BeNull();
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var email = Email.Create("customer@example.com").Value;
        var phone = PhoneNumber.Create("+905551234567").Value;
        var address = Address.Create("123 Main St", "Istanbul", "Turkey");

        // Act & Assert
        var action = () => Customer.Create(_tenantId, "", email, phone, address);
        action.Should().Throw<ArgumentException>()
            .WithMessage("Customer name cannot be empty*");
    }

    [Fact]
    public void Create_WithNullEmail_ShouldThrowArgumentNullException()
    {
        // Arrange
        var phone = PhoneNumber.Create("+905551234567").Value;
        var address = Address.Create("123 Main St", "Istanbul", "Turkey");

        // Act & Assert
        var action = () => Customer.Create(_tenantId, "Test Customer", null!, phone, address);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("email");
    }

    [Fact]
    public void UpdateContactInfo_WithValidData_ShouldUpdateEmailAndPhone()
    {
        // Arrange
        var customer = CreateValidCustomer();
        var newEmail = Email.Create("newemail@example.com").Value;
        var newPhone = PhoneNumber.Create("+905559876543").Value;

        // Act
        customer.UpdateContactInfo(newEmail, newPhone);

        // Assert
        customer.Email.Should().Be(newEmail);
        customer.Phone.Should().Be(newPhone);
    }

    [Fact]
    public void UpdateAddress_WithValidAddress_ShouldUpdateAddress()
    {
        // Arrange
        var customer = CreateValidCustomer();
        var newAddress = Address.Create("456 New St", "Ankara", "Turkey", "06000");

        // Act
        customer.UpdateAddress(newAddress);

        // Assert
        customer.Address.Should().Be(newAddress);
    }

    [Fact]
    public void SetTaxInfo_ShouldSetTaxNumberAndOffice()
    {
        // Arrange
        var customer = CreateValidCustomer();
        var taxNumber = "1234567890";
        var taxOffice = "Kadıköy Tax Office";

        // Act
        customer.SetTaxInfo(taxNumber, taxOffice);

        // Assert
        customer.TaxNumber.Should().Be(taxNumber);
        customer.TaxOffice.Should().Be(taxOffice);
    }

    [Fact]
    public void SetCreditLimit_WithPositiveAmount_ShouldSetLimit()
    {
        // Arrange
        var customer = CreateValidCustomer();
        var creditLimit = 10000m;

        // Act
        customer.SetCreditLimit(creditLimit);

        // Assert
        customer.CreditLimit.Should().Be(creditLimit);
    }

    [Fact]
    public void SetCreditLimit_WithNegativeAmount_ShouldThrowArgumentException()
    {
        // Arrange
        var customer = CreateValidCustomer();

        // Act & Assert
        var action = () => customer.SetCreditLimit(-1000m);
        action.Should().Throw<ArgumentException>()
            .WithMessage("Credit limit cannot be negative*");
    }

    [Fact]
    public void UpdateBalance_ShouldAddToCurrentBalance()
    {
        // Arrange
        var customer = CreateValidCustomer();
        customer.SetCreditLimit(10000m);

        // Act
        customer.UpdateBalance(1500m);
        customer.UpdateBalance(2500m);

        // Assert
        customer.CurrentBalance.Should().Be(4000m);
    }

    [Fact]
    public void UpdateBalance_WithNegativeAmount_ShouldSubtractFromBalance()
    {
        // Arrange
        var customer = CreateValidCustomer();
        customer.UpdateBalance(5000m); // Start with positive balance

        // Act
        customer.UpdateBalance(-2000m);

        // Assert
        customer.CurrentBalance.Should().Be(3000m);
    }

    [Fact]
    public void Activate_ShouldSetIsActiveToTrue()
    {
        // Arrange
        var customer = CreateValidCustomer();
        customer.Deactivate(); // First deactivate

        // Act
        customer.Activate();

        // Assert
        customer.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Deactivate_ShouldSetIsActiveToFalse()
    {
        // Arrange
        var customer = CreateValidCustomer();

        // Act
        customer.Deactivate();

        // Assert
        customer.IsActive.Should().BeFalse();
    }

    [Fact]
    public void CanMakePurchase_WhenActiveAndWithinCreditLimit_ShouldReturnTrue()
    {
        // Arrange
        var customer = CreateValidCustomer();
        customer.SetCreditLimit(10000m);
        customer.UpdateBalance(3000m); // Current balance: 3000

        // Act
        var canPurchase = customer.CanMakePurchase(5000m); // Total would be 8000

        // Assert
        canPurchase.Should().BeTrue();
    }

    [Fact]
    public void CanMakePurchase_WhenExceedsCreditLimit_ShouldReturnFalse()
    {
        // Arrange
        var customer = CreateValidCustomer();
        customer.SetCreditLimit(10000m);
        customer.UpdateBalance(7000m); // Current balance: 7000

        // Act
        var canPurchase = customer.CanMakePurchase(5000m); // Total would be 12000

        // Assert
        canPurchase.Should().BeFalse();
    }

    [Fact]
    public void CanMakePurchase_WhenInactive_ShouldReturnFalse()
    {
        // Arrange
        var customer = CreateValidCustomer();
        customer.SetCreditLimit(10000m);
        customer.Deactivate();

        // Act
        var canPurchase = customer.CanMakePurchase(100m);

        // Assert
        canPurchase.Should().BeFalse();
    }

    [Fact]
    public void UpdateName_WithValidName_ShouldUpdateName()
    {
        // Arrange
        var customer = CreateValidCustomer();
        var newName = "Updated Customer Name";

        // Act
        customer.UpdateName(newName);

        // Assert
        customer.Name.Should().Be(newName);
    }

    [Fact]
    public void UpdateName_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var customer = CreateValidCustomer();

        // Act & Assert
        var action = () => customer.UpdateName("");
        action.Should().Throw<ArgumentException>()
            .WithMessage("Customer name cannot be empty*");
    }

    [Fact]
    public void UpdateEmail_WithValidEmail_ShouldUpdateEmail()
    {
        // Arrange
        var customer = CreateValidCustomer();
        var newEmail = Email.Create("updated@example.com").Value;

        // Act
        customer.UpdateEmail(newEmail);

        // Assert
        customer.Email.Should().Be(newEmail);
    }

    [Fact]
    public void UpdatePhone_WithValidPhone_ShouldUpdatePhone()
    {
        // Arrange
        var customer = CreateValidCustomer();
        var newPhone = PhoneNumber.Create("+905557654321").Value;

        // Act
        customer.UpdatePhone(newPhone);

        // Assert
        customer.Phone.Should().Be(newPhone);
    }

    [Fact]
    public void SetTenantId_ShouldUpdateTenantId()
    {
        // Arrange
        var customer = CreateValidCustomer();
        var newTenantId = Guid.NewGuid();

        // Act
        customer.SetTenantId(newTenantId);

        // Assert
        customer.TenantId.Should().Be(newTenantId);
    }

    private Customer CreateValidCustomer()
    {
        var email = Email.Create("customer@example.com").Value;
        var phone = PhoneNumber.Create("+905551234567").Value;
        var address = Address.Create("123 Main St", "Istanbul", "Turkey", "34000");
        
        return Customer.Create(_tenantId, "Test Customer", email, phone, address);
    }
}