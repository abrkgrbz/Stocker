using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class PackageTests
{
    private readonly string _name = "Professional Package";
    private readonly PackageType _type = PackageType.Profesyonel;
    private readonly Money _basePrice = Money.Create(1000m, "TRY");
    private readonly PackageLimit _limits = PackageLimit.Create(10, 100, 5, 10000);
    private readonly string _description = "Professional package for small businesses";

    [Fact]
    public void Create_WithValidData_ShouldCreatePackage()
    {
        // Act
        var package = Package.Create(
            _name,
            _type,
            _basePrice,
            _limits,
            _description,
            trialDays: 30,
            displayOrder: 1);

        // Assert
        package.Should().NotBeNull();
        package.Name.Should().Be(_name);
        package.Type.Should().Be(_type);
        package.BasePrice.Should().Be(_basePrice);
        package.Limits.Should().Be(_limits);
        package.Description.Should().Be(_description);
        package.TrialDays.Should().Be(30);
        package.DisplayOrder.Should().Be(1);
        package.IsActive.Should().BeTrue();
        package.IsPublic.Should().BeTrue();
        package.Features.Should().BeEmpty();
        package.Modules.Should().BeEmpty();
    }

    [Fact]
    public void Create_WithMinimalData_ShouldCreatePackage()
    {
        // Act
        var package = Package.Create(_name, _type, _basePrice, _limits);

        // Assert
        package.Name.Should().Be(_name);
        package.Description.Should().BeNull();
        package.TrialDays.Should().Be(0);
        package.DisplayOrder.Should().Be(0);
        package.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Package.Create("", _type, _basePrice, _limits);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Package name cannot be empty.*");
    }

    [Fact]
    public void Create_WithNegativeTrialDays_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Package.Create(_name, _type, _basePrice, _limits, trialDays: -1);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Trial days cannot be negative.*");
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdatePackage()
    {
        // Arrange
        var package = CreatePackage();
        var newName = "Updated Package";
        var newDescription = "Updated description";
        var newPrice = Money.Create(1500m, "TRY");
        var newLimits = PackageLimit.Create(20, 200, 10, 20000);

        // Act
        package.Update(
            newName,
            newDescription,
            newPrice,
            newLimits,
            trialDays: 45,
            displayOrder: 2,
            isPublic: false);

        // Assert
        package.Name.Should().Be(newName);
        package.Description.Should().Be(newDescription);
        package.BasePrice.Should().Be(newPrice);
        package.Limits.Should().Be(newLimits);
        package.TrialDays.Should().Be(45);
        package.DisplayOrder.Should().Be(2);
        package.IsPublic.Should().BeFalse();
        package.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Activate_DeactivatedPackage_ShouldActivate()
    {
        // Arrange
        var package = CreatePackage();
        package.Deactivate();

        // Act
        package.Activate();

        // Assert
        package.IsActive.Should().BeTrue();
        package.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deactivate_ActivePackage_ShouldDeactivate()
    {
        // Arrange
        var package = CreatePackage();

        // Act
        package.Deactivate();

        // Assert
        package.IsActive.Should().BeFalse();
        package.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void AddFeature_WithValidData_ShouldAddFeature()
    {
        // Arrange
        var package = CreatePackage();
        var featureCode = "ADVANCED_REPORTS";
        var featureName = "Advanced Reports";
        var description = "Access to advanced reporting features";

        // Act
        package.AddFeature(featureCode, featureName, description, true);

        // Assert
        package.Features.Should().HaveCount(1);
        var feature = package.Features.First();
        feature.FeatureCode.Should().Be(featureCode);
        feature.FeatureName.Should().Be(featureName);
        feature.Description.Should().Be(description);
        feature.IsHighlighted.Should().BeTrue();
    }

    [Fact]
    public void AddFeature_DuplicateCode_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var package = CreatePackage();
        var featureCode = "FEATURE1";
        package.AddFeature(featureCode, "Feature 1");

        // Act
        var action = () => package.AddFeature(featureCode, "Another Feature");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Feature '{featureCode}' already exists in this package.");
    }

    [Fact]
    public void RemoveFeature_ExistingFeature_ShouldRemove()
    {
        // Arrange
        var package = CreatePackage();
        var featureCode = "FEATURE1";
        package.AddFeature(featureCode, "Feature 1");

        // Act
        package.RemoveFeature(featureCode);

        // Assert
        package.Features.Should().BeEmpty();
    }

    [Fact]
    public void RemoveFeature_NonExistingFeature_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var package = CreatePackage();

        // Act
        var action = () => package.RemoveFeature("NON_EXISTING");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Feature 'NON_EXISTING' not found in this package.");
    }

    [Fact]
    public void AddModule_WithValidData_ShouldAddModule()
    {
        // Arrange
        var package = CreatePackage();
        var moduleCode = "CRM";
        var moduleName = "Customer Relationship Management";

        // Act
        package.AddModule(moduleCode, moduleName, true, 1000);

        // Assert
        package.Modules.Should().HaveCount(1);
        var module = package.Modules.First();
        module.ModuleCode.Should().Be(moduleCode);
        module.ModuleName.Should().Be(moduleName);
        module.IsIncluded.Should().BeTrue();
        module.MaxEntities.Should().Be(1000);
    }

    [Fact]
    public void AddModule_DuplicateCode_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var package = CreatePackage();
        var moduleCode = "CRM";
        package.AddModule(moduleCode, "CRM Module");

        // Act
        var action = () => package.AddModule(moduleCode, "Another Module");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Module '{moduleCode}' already exists in this package.");
    }

    [Fact]
    public void RemoveModule_ExistingModule_ShouldRemove()
    {
        // Arrange
        var package = CreatePackage();
        var moduleCode = "CRM";
        package.AddModule(moduleCode, "CRM Module");

        // Act
        package.RemoveModule(moduleCode);

        // Assert
        package.Modules.Should().BeEmpty();
    }

    [Fact]
    public void HasFeature_ExistingFeature_ShouldReturnTrue()
    {
        // Arrange
        var package = CreatePackage();
        var featureCode = "FEATURE1";
        package.AddFeature(featureCode, "Feature 1");

        // Act
        var result = package.HasFeature(featureCode);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void HasFeature_NonExistingFeature_ShouldReturnFalse()
    {
        // Arrange
        var package = CreatePackage();

        // Act
        var result = package.HasFeature("NON_EXISTING");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void HasModule_IncludedModule_ShouldReturnTrue()
    {
        // Arrange
        var package = CreatePackage();
        var moduleCode = "CRM";
        package.AddModule(moduleCode, "CRM Module", true);

        // Act
        var result = package.HasModule(moduleCode);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void HasModule_NotIncludedModule_ShouldReturnFalse()
    {
        // Arrange
        var package = CreatePackage();
        var moduleCode = "CRM";
        package.AddModule(moduleCode, "CRM Module", false);

        // Act
        var result = package.HasModule(moduleCode);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CalculatePriceForCycle_Monthly_ShouldReturnBasePrice()
    {
        // Arrange
        var package = CreatePackage();

        // Act
        var price = package.CalculatePriceForCycle(BillingCycle.Aylik);

        // Assert
        price.Should().Be(_basePrice);
    }

    [Fact]
    public void CalculatePriceForCycle_Quarterly_ShouldApplyDiscount()
    {
        // Arrange
        var package = CreatePackage();

        // Act
        var price = package.CalculatePriceForCycle(BillingCycle.UcAylik);

        // Assert
        price.Amount.Should().Be(2700m); // 1000 * 2.7
    }

    [Fact]
    public void CalculatePriceForCycle_SemiAnnual_ShouldApplyDiscount()
    {
        // Arrange
        var package = CreatePackage();

        // Act
        var price = package.CalculatePriceForCycle(BillingCycle.AltiAylik);

        // Assert
        price.Amount.Should().Be(5100m); // 1000 * 5.1
    }

    [Fact]
    public void CalculatePriceForCycle_Annual_ShouldApplyMaxDiscount()
    {
        // Arrange
        var package = CreatePackage();

        // Act
        var price = package.CalculatePriceForCycle(BillingCycle.Yillik);

        // Assert
        price.Amount.Should().Be(9600m); // 1000 * 9.6 (20% discount)
    }

    private Package CreatePackage()
    {
        return Package.Create(_name, _type, _basePrice, _limits, _description);
    }
}