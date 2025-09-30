using FluentAssertions;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Common.ValueObjects;
using TenantEntity = Stocker.Domain.Master.Entities.Tenant;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class TenantTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateTenant()
    {
        // Arrange
        var name = "Test Company";
        var code = "TEST001";
        var databaseName = "TestDB";
        var connectionStringResult = ConnectionString.Create("Server=localhost;Database=TestDB;Trusted_Connection=true;");
        var emailResult = Email.Create("test@example.com");
        var phoneResult = PhoneNumber.Create("+905551234567");

        // Act
        var tenant = TenantEntity.Create(
            name,
            code,
            databaseName,
            connectionStringResult.Value,
            emailResult.Value,
            phoneResult.Value,
            "Test description",
            "https://example.com/logo.png"
        );

        // Assert
        tenant.Should().NotBeNull();
        tenant.Name.Should().Be(name);
        tenant.Code.Should().Be(code);
        tenant.DatabaseName.Should().Be(databaseName);
        tenant.ConnectionString.Should().Be(connectionStringResult.Value);
        tenant.ContactEmail.Should().Be(emailResult.Value);
        tenant.ContactPhone.Should().Be(phoneResult.Value);
        tenant.IsActive.Should().BeTrue();
        tenant.Description.Should().Be("Test description");
        tenant.LogoUrl.Should().Be("https://example.com/logo.png");
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var connectionStringResult = ConnectionString.Create("Server=localhost;Database=TestDB;Trusted_Connection=true;");
        var emailResult = Email.Create("test@example.com");

        // Act & Assert
        var action = () => TenantEntity.Create(
            "",
            "TEST001",
            "TestDB",
            connectionStringResult.Value,
            emailResult.Value
        );

        action.Should().Throw<ArgumentException>()
            .WithMessage("Tenant name cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyCode_ShouldThrowArgumentException()
    {
        // Arrange
        var connectionStringResult = ConnectionString.Create("Server=localhost;Database=TestDB;Trusted_Connection=true;");
        var emailResult = Email.Create("test@example.com");

        // Act & Assert
        var action = () => TenantEntity.Create(
            "Test Company",
            "",
            "TestDB",
            connectionStringResult.Value,
            emailResult.Value
        );

        action.Should().Throw<ArgumentException>()
            .WithMessage("Tenant code cannot be empty.*");
    }

    [Fact]
    public void Activate_WhenInactive_ShouldActivateTenant()
    {
        // Arrange
        var tenant = CreateValidTenant();
        tenant.Deactivate(); // First deactivate

        // Act
        tenant.Activate();

        // Assert
        tenant.IsActive.Should().BeTrue();
        tenant.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Activate_WhenAlreadyActive_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var tenant = CreateValidTenant(); // Default is active

        // Act & Assert
        var action = () => tenant.Activate();
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Tenant is already active.");
    }

    [Fact]
    public void Deactivate_WhenActive_ShouldDeactivateTenant()
    {
        // Arrange
        var tenant = CreateValidTenant();

        // Act
        tenant.Deactivate();

        // Assert
        tenant.IsActive.Should().BeFalse();
        tenant.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void AddDomain_WithValidDomain_ShouldAddToCollection()
    {
        // Arrange
        var tenant = CreateValidTenant();
        var domainName = "test.example.com";

        // Act
        tenant.AddDomain(domainName, true);

        // Assert
        tenant.Domains.Should().HaveCount(1);
        tenant.Domains.First().DomainName.Should().Be(domainName);
        tenant.Domains.First().IsPrimary.Should().BeTrue();
    }

    [Fact]
    public void AddDomain_WithDuplicateDomain_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var tenant = CreateValidTenant();
        var domainName = "test.example.com";
        tenant.AddDomain(domainName);

        // Act & Assert
        var action = () => tenant.AddDomain(domainName);
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Domain '{domainName}' already exists for this tenant.");
    }

    [Fact]
    public void RemoveDomain_WithExistingDomain_ShouldRemoveFromCollection()
    {
        // Arrange
        var tenant = CreateValidTenant();
        var domainName = "test.example.com";
        tenant.AddDomain(domainName);

        // Act
        tenant.RemoveDomain(domainName);

        // Assert
        tenant.Domains.Should().BeEmpty();
    }

    [Fact]
    public void UpdateInfo_WithValidData_ShouldUpdateProperties()
    {
        // Arrange
        var tenant = CreateValidTenant();
        var newName = "Updated Company";
        var newDescription = "Updated description";
        var newLogoUrl = "https://example.com/new-logo.png";
        var newEmailResult = Email.Create("updated@example.com");
        var newPhoneResult = PhoneNumber.Create("+905559876543");

        // Act
        tenant.UpdateInfo(
            newName,
            newDescription,
            newLogoUrl,
            newEmailResult.Value,
            newPhoneResult.Value
        );

        // Assert
        tenant.Name.Should().Be(newName);
        tenant.Description.Should().Be(newDescription);
        tenant.LogoUrl.Should().Be(newLogoUrl);
        tenant.ContactEmail.Should().Be(newEmailResult.Value);
        tenant.ContactPhone.Should().Be(newPhoneResult.Value);
        tenant.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void HasActiveContract_WhenNoContract_ShouldReturnFalse()
    {
        // Arrange
        var tenant = CreateValidTenant();

        // Act
        var result = tenant.HasActiveContract();

        // Assert
        result.Should().BeFalse();
    }

    private static TenantEntity CreateValidTenant()
    {
        var connectionStringResult = ConnectionString.Create("Server=localhost;Database=TestDB;Trusted_Connection=true;");
        var emailResult = Email.Create("test@example.com");

        return TenantEntity.Create(
            "Test Company",
            "TEST001",
            "TestDB",
            connectionStringResult.Value,
            emailResult.Value
        );
    }
}