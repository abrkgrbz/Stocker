using FluentAssertions;
using Stocker.Domain.Master.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.Master.ValueObjects;

public class PackageLimitTests
{
    [Fact]
    public void Create_WithValidValues_ShouldCreatePackageLimit()
    {
        // Arrange
        var maxUsers = 10;
        var maxStorage = 100;
        var maxProjects = 5;
        var maxApiCalls = 10000;

        // Act
        var packageLimit = PackageLimit.Create(maxUsers, maxStorage, maxProjects, maxApiCalls);

        // Assert
        packageLimit.Should().NotBeNull();
        packageLimit.MaxUsers.Should().Be(maxUsers);
        packageLimit.MaxStorage.Should().Be(maxStorage);
        packageLimit.MaxProjects.Should().Be(maxProjects);
        packageLimit.MaxApiCalls.Should().Be(maxApiCalls);
        packageLimit.ModuleLimits.Should().NotBeNull();
        packageLimit.ModuleLimits.Should().BeEmpty();
    }

    [Fact]
    public void Create_WithModuleLimits_ShouldIncludeModuleLimits()
    {
        // Arrange
        var maxUsers = 10;
        var maxStorage = 100;
        var maxProjects = 5;
        var maxApiCalls = 10000;
        var moduleLimits = new Dictionary<string, int>
        {
            { "CRM", 1000 },
            { "Accounting", 5000 },
            { "Inventory", 3000 }
        };

        // Act
        var packageLimit = PackageLimit.Create(maxUsers, maxStorage, maxProjects, maxApiCalls, moduleLimits);

        // Assert
        packageLimit.ModuleLimits.Should().NotBeNull();
        packageLimit.ModuleLimits.Should().HaveCount(3);
        packageLimit.ModuleLimits["CRM"].Should().Be(1000);
        packageLimit.ModuleLimits["Accounting"].Should().Be(5000);
        packageLimit.ModuleLimits["Inventory"].Should().Be(3000);
    }

    [Fact]
    public void Create_WithZeroMaxUsers_ShouldThrowException()
    {
        // Act
        var action = () => PackageLimit.Create(0, 100, 5, 10000);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Max users must be greater than zero.*");
    }

    [Fact]
    public void Create_WithNegativeMaxUsers_ShouldThrowException()
    {
        // Act
        var action = () => PackageLimit.Create(-1, 100, 5, 10000);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Max users must be greater than zero.*");
    }

    [Fact]
    public void Create_WithZeroMaxStorage_ShouldThrowException()
    {
        // Act
        var action = () => PackageLimit.Create(10, 0, 5, 10000);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Max storage must be greater than zero.*");
    }

    [Fact]
    public void Create_WithNegativeMaxStorage_ShouldThrowException()
    {
        // Act
        var action = () => PackageLimit.Create(10, -1, 5, 10000);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Max storage must be greater than zero.*");
    }

    [Fact]
    public void Create_WithNegativeMaxProjects_ShouldThrowException()
    {
        // Act
        var action = () => PackageLimit.Create(10, 100, -1, 10000);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Max projects cannot be negative.*");
    }

    [Fact]
    public void Create_WithZeroMaxProjects_ShouldBeValid()
    {
        // Act
        var packageLimit = PackageLimit.Create(10, 100, 0, 10000);

        // Assert
        packageLimit.MaxProjects.Should().Be(0);
    }

    [Fact]
    public void Create_WithNegativeMaxApiCalls_ShouldThrowException()
    {
        // Act
        var action = () => PackageLimit.Create(10, 100, 5, -1);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Max API calls cannot be negative.*");
    }

    [Fact]
    public void Create_WithZeroMaxApiCalls_ShouldBeValid()
    {
        // Act
        var packageLimit = PackageLimit.Create(10, 100, 5, 0);

        // Assert
        packageLimit.MaxApiCalls.Should().Be(0);
    }

    [Fact]
    public void Create_WithNullModuleLimits_ShouldCreateEmptyDictionary()
    {
        // Act
        var packageLimit = PackageLimit.Create(10, 100, 5, 10000, null);

        // Assert
        packageLimit.ModuleLimits.Should().NotBeNull();
        packageLimit.ModuleLimits.Should().BeEmpty();
    }

    [Fact]
    public void Unlimited_ShouldCreateUnlimitedPackage()
    {
        // Act
        var packageLimit = PackageLimit.Unlimited();

        // Assert
        packageLimit.Should().NotBeNull();
        packageLimit.MaxUsers.Should().Be(int.MaxValue);
        packageLimit.MaxStorage.Should().Be(int.MaxValue);
        packageLimit.MaxProjects.Should().Be(int.MaxValue);
        packageLimit.MaxApiCalls.Should().Be(int.MaxValue);
        packageLimit.ModuleLimits.Should().NotBeNull();
        packageLimit.ModuleLimits.Should().BeEmpty();
    }

    [Fact]
    public void GetEqualityComponents_ShouldReturnAllComponents()
    {
        // Arrange
        var moduleLimits = new Dictionary<string, int>
        {
            { "CRM", 1000 },
            { "Accounting", 5000 }
        };
        var packageLimit = PackageLimit.Create(10, 100, 5, 10000, moduleLimits);

        // Act
        var components = packageLimit.GetEqualityComponents().ToList();

        // Assert
        components.Should().HaveCount(8); // 4 basic limits + 2 modules * 2 (key-value pairs)
        components[0].Should().Be(10);
        components[1].Should().Be(100);
        components[2].Should().Be(5);
        components[3].Should().Be(10000);
        components[4].Should().Be("Accounting"); // Sorted alphabetically
        components[5].Should().Be(5000);
        components[6].Should().Be("CRM");
        components[7].Should().Be(1000);
    }

    [Fact]
    public void Equals_WithSameLimits_ShouldReturnTrue()
    {
        // Arrange
        var moduleLimits1 = new Dictionary<string, int> { { "CRM", 1000 } };
        var moduleLimits2 = new Dictionary<string, int> { { "CRM", 1000 } };
        var limit1 = PackageLimit.Create(10, 100, 5, 10000, moduleLimits1);
        var limit2 = PackageLimit.Create(10, 100, 5, 10000, moduleLimits2);

        // Act
        var areEqual = limit1.Equals(limit2);

        // Assert
        areEqual.Should().BeTrue();
    }

    [Fact]
    public void Equals_WithDifferentMaxUsers_ShouldReturnFalse()
    {
        // Arrange
        var limit1 = PackageLimit.Create(10, 100, 5, 10000);
        var limit2 = PackageLimit.Create(20, 100, 5, 10000);

        // Act
        var areEqual = limit1.Equals(limit2);

        // Assert
        areEqual.Should().BeFalse();
    }

    [Fact]
    public void Equals_WithDifferentModuleLimits_ShouldReturnFalse()
    {
        // Arrange
        var moduleLimits1 = new Dictionary<string, int> { { "CRM", 1000 } };
        var moduleLimits2 = new Dictionary<string, int> { { "CRM", 2000 } };
        var limit1 = PackageLimit.Create(10, 100, 5, 10000, moduleLimits1);
        var limit2 = PackageLimit.Create(10, 100, 5, 10000, moduleLimits2);

        // Act
        var areEqual = limit1.Equals(limit2);

        // Assert
        areEqual.Should().BeFalse();
    }

    [Fact]
    public void GetHashCode_WithSameLimits_ShouldReturnSameHash()
    {
        // Arrange
        var moduleLimits1 = new Dictionary<string, int> { { "CRM", 1000 } };
        var moduleLimits2 = new Dictionary<string, int> { { "CRM", 1000 } };
        var limit1 = PackageLimit.Create(10, 100, 5, 10000, moduleLimits1);
        var limit2 = PackageLimit.Create(10, 100, 5, 10000, moduleLimits2);

        // Act
        var hash1 = limit1.GetHashCode();
        var hash2 = limit2.GetHashCode();

        // Assert
        hash1.Should().Be(hash2);
    }

    [Fact]
    public void GetHashCode_WithDifferentLimits_ShouldReturnDifferentHash()
    {
        // Arrange
        var limit1 = PackageLimit.Create(10, 100, 5, 10000);
        var limit2 = PackageLimit.Create(20, 100, 5, 10000);

        // Act
        var hash1 = limit1.GetHashCode();
        var hash2 = limit2.GetHashCode();

        // Assert
        hash1.Should().NotBe(hash2);
    }

    [Fact]
    public void OperatorEquals_WithSameLimits_ShouldReturnTrue()
    {
        // Arrange
        var limit1 = PackageLimit.Create(10, 100, 5, 10000);
        var limit2 = PackageLimit.Create(10, 100, 5, 10000);

        // Act & Assert
        (limit1 == limit2).Should().BeTrue();
    }

    [Fact]
    public void OperatorNotEquals_WithDifferentLimits_ShouldReturnTrue()
    {
        // Arrange
        var limit1 = PackageLimit.Create(10, 100, 5, 10000);
        var limit2 = PackageLimit.Create(20, 100, 5, 10000);

        // Act & Assert
        (limit1 != limit2).Should().BeTrue();
    }

    [Fact]
    public void Create_WithLargeLimits_ShouldCreateSuccessfully()
    {
        // Arrange
        var maxUsers = 1000000;
        var maxStorage = 1000000;
        var maxProjects = 100000;
        var maxApiCalls = 100000000;

        // Act
        var packageLimit = PackageLimit.Create(maxUsers, maxStorage, maxProjects, maxApiCalls);

        // Assert
        packageLimit.MaxUsers.Should().Be(maxUsers);
        packageLimit.MaxStorage.Should().Be(maxStorage);
        packageLimit.MaxProjects.Should().Be(maxProjects);
        packageLimit.MaxApiCalls.Should().Be(maxApiCalls);
    }

    [Fact]
    public void GetEqualityComponents_WithUnorderedModuleLimits_ShouldReturnOrderedComponents()
    {
        // Arrange
        var moduleLimits = new Dictionary<string, int>
        {
            { "Zebra", 300 },
            { "Alpha", 100 },
            { "Beta", 200 }
        };
        var packageLimit = PackageLimit.Create(10, 100, 5, 10000, moduleLimits);

        // Act
        var components = packageLimit.GetEqualityComponents().ToList();

        // Assert
        components.Should().HaveCount(10); // 4 basic + 3 modules * 2
        // Module limits should be ordered alphabetically
        components[4].Should().Be("Alpha");
        components[5].Should().Be(100);
        components[6].Should().Be("Beta");
        components[7].Should().Be(200);
        components[8].Should().Be("Zebra");
        components[9].Should().Be(300);
    }
}