using System;
using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantSettingsTests
{
    private readonly Guid _tenantId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldCreateTenantSettings()
    {
        // Arrange
        var settingKey = "TestKey";
        var settingValue = "TestValue";
        var category = "TestCategory";
        var dataType = "String";
        var description = "Test Description";

        // Act
        var settings = TenantSettings.Create(
            _tenantId,
            settingKey,
            settingValue,
            category,
            dataType,
            description);

        // Assert
        settings.Should().NotBeNull();
        settings.TenantId.Should().Be(_tenantId);
        settings.SettingKey.Should().Be(settingKey);
        settings.SettingValue.Should().Be(settingValue);
        settings.Category.Should().Be(category);
        settings.DataType.Should().Be(dataType);
        settings.Description.Should().Be(description);
        settings.IsSystemSetting.Should().BeFalse();
        settings.IsEncrypted.Should().BeFalse();
        settings.IsPublic.Should().BeFalse();
        settings.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        settings.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Create_WithDefaults_ShouldUseDefaultValues()
    {
        // Arrange & Act
        var settings = TenantSettings.Create(
            _tenantId,
            "Key",
            "Value");

        // Assert
        settings.Category.Should().Be("General");
        settings.DataType.Should().Be("String");
        settings.Description.Should().BeNull();
        settings.IsSystemSetting.Should().BeFalse();
        settings.IsEncrypted.Should().BeFalse();
        settings.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Create_WithSystemSetting_ShouldBeSystemSetting()
    {
        // Arrange & Act
        var settings = TenantSettings.Create(
            _tenantId,
            "SystemKey",
            "SystemValue",
            isSystemSetting: true);

        // Assert
        settings.IsSystemSetting.Should().BeTrue();
    }

    [Fact]
    public void Create_WithEncryption_ShouldBeEncrypted()
    {
        // Arrange & Act
        var settings = TenantSettings.Create(
            _tenantId,
            "SecretKey",
            "SecretValue",
            isEncrypted: true);

        // Assert
        settings.IsEncrypted.Should().BeTrue();
    }

    [Fact]
    public void Create_WithPublic_ShouldBePublic()
    {
        // Arrange & Act
        var settings = TenantSettings.Create(
            _tenantId,
            "PublicKey",
            "PublicValue",
            isPublic: true);

        // Assert
        settings.IsPublic.Should().BeTrue();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("\t")]
    public void Create_WithInvalidSettingKey_ShouldThrowException(string invalidKey)
    {
        // Arrange & Act
        var action = () => TenantSettings.Create(
            _tenantId,
            invalidKey,
            "Value");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Setting key cannot be empty*")
            .WithParameterName("settingKey");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Create_WithInvalidSettingValue_ShouldThrowException(string invalidValue)
    {
        // Arrange & Act
        var action = () => TenantSettings.Create(
            _tenantId,
            "Key",
            invalidValue);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Setting value cannot be empty*")
            .WithParameterName("settingValue");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Create_WithInvalidCategory_ShouldThrowException(string invalidCategory)
    {
        // Arrange & Act
        var action = () => TenantSettings.Create(
            _tenantId,
            "Key",
            "Value",
            category: invalidCategory);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Category cannot be empty*")
            .WithParameterName("category");
    }

    [Fact]
    public void UpdateValue_WithValidValue_ShouldUpdateValue()
    {
        // Arrange
        var settings = TenantSettings.Create(_tenantId, "Key", "OldValue");
        var newValue = "NewValue";

        // Act
        settings.UpdateValue(newValue);

        // Assert
        settings.SettingValue.Should().Be(newValue);
        settings.UpdatedAt.Should().NotBeNull();
        settings.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void UpdateValue_OnSystemSetting_ShouldThrowException()
    {
        // Arrange
        var settings = TenantSettings.Create(
            _tenantId,
            "SystemKey",
            "SystemValue",
            isSystemSetting: true);

        // Act
        var action = () => settings.UpdateValue("NewValue");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("System settings cannot be modified.");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void UpdateValue_WithInvalidValue_ShouldThrowException(string invalidValue)
    {
        // Arrange
        var settings = TenantSettings.Create(_tenantId, "Key", "Value");

        // Act
        var action = () => settings.UpdateValue(invalidValue);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Setting value cannot be empty*")
            .WithParameterName("newValue");
    }

    [Fact]
    public void UpdateDescription_WithValidDescription_ShouldUpdateDescription()
    {
        // Arrange
        var settings = TenantSettings.Create(_tenantId, "Key", "Value");
        var newDescription = "New Description";

        // Act
        settings.UpdateDescription(newDescription);

        // Assert
        settings.Description.Should().Be(newDescription);
        settings.UpdatedAt.Should().NotBeNull();
        settings.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void UpdateDescription_WithNull_ShouldSetToNull()
    {
        // Arrange
        var settings = TenantSettings.Create(
            _tenantId,
            "Key",
            "Value",
            description: "Initial Description");

        // Act
        settings.UpdateDescription(null);

        // Assert
        settings.Description.Should().BeNull();
        settings.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetAsEncrypted_ShouldSetIsEncryptedToTrue()
    {
        // Arrange
        var settings = TenantSettings.Create(_tenantId, "Key", "Value");

        // Act
        settings.SetAsEncrypted();

        // Assert
        settings.IsEncrypted.Should().BeTrue();
        settings.UpdatedAt.Should().NotBeNull();
        settings.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SetAsPublic_ShouldSetIsPublicToTrue()
    {
        // Arrange
        var settings = TenantSettings.Create(_tenantId, "Key", "Value");

        // Act
        settings.SetAsPublic();

        // Assert
        settings.IsPublic.Should().BeTrue();
        settings.UpdatedAt.Should().NotBeNull();
        settings.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SetAsPrivate_ShouldSetIsPublicToFalse()
    {
        // Arrange
        var settings = TenantSettings.Create(
            _tenantId,
            "Key",
            "Value",
            isPublic: true);

        // Act
        settings.SetAsPrivate();

        // Assert
        settings.IsPublic.Should().BeFalse();
        settings.UpdatedAt.Should().NotBeNull();
        settings.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MultipleUpdates_ShouldUpdateTimestampEachTime()
    {
        // Arrange
        var settings = TenantSettings.Create(_tenantId, "Key", "Value");

        // Act & Assert
        settings.UpdateValue("Value1");
        var firstUpdate = settings.UpdatedAt;
        firstUpdate.Should().NotBeNull();

        System.Threading.Thread.Sleep(10); // Small delay to ensure different timestamps

        settings.UpdateDescription("New Description");
        var secondUpdate = settings.UpdatedAt;
        secondUpdate.Should().NotBeNull();
        secondUpdate.Should().BeAfter(firstUpdate.Value);

        System.Threading.Thread.Sleep(10);

        settings.SetAsEncrypted();
        var thirdUpdate = settings.UpdatedAt;
        thirdUpdate.Should().NotBeNull();
        thirdUpdate.Should().BeAfter(secondUpdate.Value);
    }
}