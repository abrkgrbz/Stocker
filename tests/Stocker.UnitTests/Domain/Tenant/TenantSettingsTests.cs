using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantSettingsTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly string _settingKey = "CompanyName";
    private readonly string _settingValue = "Test Company Ltd";
    private readonly string _category = "General";
    private readonly string _dataType = "String";
    private readonly string _description = "The name of the company";

    [Fact]
    public void Create_WithValidData_ShouldCreateTenantSettings()
    {
        // Act
        var settings = TenantSettings.Create(
            _tenantId,
            _settingKey,
            _settingValue,
            _category,
            _dataType,
            _description);

        // Assert
        settings.Should().NotBeNull();
        settings.TenantId.Should().Be(_tenantId);
        settings.SettingKey.Should().Be(_settingKey);
        settings.SettingValue.Should().Be(_settingValue);
        settings.Category.Should().Be(_category);
        settings.DataType.Should().Be(_dataType);
        settings.Description.Should().Be(_description);
        settings.IsSystemSetting.Should().BeFalse();
        settings.IsEncrypted.Should().BeFalse();
        settings.IsPublic.Should().BeFalse();
        settings.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        settings.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Create_WithMinimalData_ShouldUseDefaults()
    {
        // Act
        var settings = TenantSettings.Create(
            _tenantId,
            _settingKey,
            _settingValue);

        // Assert
        settings.Category.Should().Be("General");
        settings.DataType.Should().Be("String");
        settings.Description.Should().BeNull();
        settings.IsSystemSetting.Should().BeFalse();
        settings.IsEncrypted.Should().BeFalse();
        settings.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Create_AsSystemSetting_ShouldSetSystemFlag()
    {
        // Act
        var settings = TenantSettings.Create(
            _tenantId,
            _settingKey,
            _settingValue,
            isSystemSetting: true);

        // Assert
        settings.IsSystemSetting.Should().BeTrue();
    }

    [Fact]
    public void Create_AsEncrypted_ShouldSetEncryptedFlag()
    {
        // Act
        var settings = TenantSettings.Create(
            _tenantId,
            _settingKey,
            _settingValue,
            isEncrypted: true);

        // Assert
        settings.IsEncrypted.Should().BeTrue();
    }

    [Fact]
    public void Create_AsPublic_ShouldSetPublicFlag()
    {
        // Act
        var settings = TenantSettings.Create(
            _tenantId,
            _settingKey,
            _settingValue,
            isPublic: true);

        // Assert
        settings.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void Create_WithEmptyKey_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantSettings.Create(
            _tenantId,
            "",
            _settingValue);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Setting key cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyValue_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantSettings.Create(
            _tenantId,
            _settingKey,
            "");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Setting value cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyCategory_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantSettings.Create(
            _tenantId,
            _settingKey,
            _settingValue,
            category: "");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Category cannot be empty.*");
    }

    [Fact]
    public void UpdateValue_RegularSetting_ShouldUpdate()
    {
        // Arrange
        var settings = CreateSettings();
        var newValue = "Updated Company Name";

        // Act
        settings.UpdateValue(newValue);

        // Assert
        settings.SettingValue.Should().Be(newValue);
        settings.UpdatedAt.Should().NotBeNull();
        settings.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void UpdateValue_SystemSetting_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var settings = TenantSettings.Create(
            _tenantId,
            _settingKey,
            _settingValue,
            isSystemSetting: true);

        // Act
        var action = () => settings.UpdateValue("New Value");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("System settings cannot be modified.");
    }

    [Fact]
    public void UpdateValue_WithEmptyValue_ShouldThrowArgumentException()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        var action = () => settings.UpdateValue("");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Setting value cannot be empty.*");
    }

    [Fact]
    public void Update_BackwardCompatibility_ShouldWork()
    {
        // Arrange
        var settings = CreateSettings();
        var newValue = "Updated Value";

        // Act
        settings.Update(newValue);

        // Assert
        settings.SettingValue.Should().Be(newValue);
        settings.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateDescription_ShouldUpdateDescription()
    {
        // Arrange
        var settings = CreateSettings();
        var newDescription = "Updated description";

        // Act
        settings.UpdateDescription(newDescription);

        // Assert
        settings.Description.Should().Be(newDescription);
        settings.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateDescription_WithNull_ShouldClearDescription()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.UpdateDescription(null);

        // Assert
        settings.Description.Should().BeNull();
        settings.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetAsEncrypted_ShouldSetEncryptedFlag()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.SetAsEncrypted();

        // Assert
        settings.IsEncrypted.Should().BeTrue();
        settings.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetAsPublic_ShouldSetPublicFlag()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.SetAsPublic();

        // Assert
        settings.IsPublic.Should().BeTrue();
        settings.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetAsPrivate_ShouldClearPublicFlag()
    {
        // Arrange
        var settings = TenantSettings.Create(
            _tenantId,
            _settingKey,
            _settingValue,
            isPublic: true);

        // Act
        settings.SetAsPrivate();

        // Assert
        settings.IsPublic.Should().BeFalse();
        settings.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void CreatedDate_BackwardCompatibility_ShouldReturnCreatedAt()
    {
        // Arrange & Act
        var settings = CreateSettings();

        // Assert
        settings.CreatedDate.Should().Be(settings.CreatedAt);
    }

    [Fact]
    public void CompleteWorkflow_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var settings = TenantSettings.Create(
            _tenantId,
            "MaxUsers",
            "10",
            "Limits",
            "Integer",
            "Maximum number of users allowed");

        // Initial state
        settings.IsPublic.Should().BeFalse();
        settings.IsEncrypted.Should().BeFalse();

        // Update value
        settings.UpdateValue("20");
        settings.SettingValue.Should().Be("20");

        // Update description
        settings.UpdateDescription("Updated: Max users for tenant");
        settings.Description.Should().Be("Updated: Max users for tenant");

        // Make public
        settings.SetAsPublic();
        settings.IsPublic.Should().BeTrue();

        // Make private again
        settings.SetAsPrivate();
        settings.IsPublic.Should().BeFalse();

        // Mark as encrypted
        settings.SetAsEncrypted();
        settings.IsEncrypted.Should().BeTrue();

        // UpdatedAt should be set
        settings.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SystemSettings_Workflow_ShouldRestrictModifications()
    {
        // Arrange
        var settings = TenantSettings.Create(
            _tenantId,
            "SystemVersion",
            "1.0.0",
            "System",
            "String",
            "System version number",
            isSystemSetting: true);

        // Act & Assert
        settings.IsSystemSetting.Should().BeTrue();

        // Cannot update value
        var action = () => settings.UpdateValue("2.0.0");
        action.Should().Throw<InvalidOperationException>();

        // Can still update other properties
        settings.UpdateDescription("Updated system version description");
        settings.Description.Should().Be("Updated system version description");

        settings.SetAsEncrypted();
        settings.IsEncrypted.Should().BeTrue();

        settings.SetAsPublic();
        settings.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void DifferentDataTypes_ShouldStoreCorrectly()
    {
        // Boolean
        var boolSetting = TenantSettings.Create(
            _tenantId,
            "EnableNotifications",
            "true",
            "Notifications",
            "Boolean");
        boolSetting.DataType.Should().Be("Boolean");
        boolSetting.SettingValue.Should().Be("true");

        // Integer
        var intSetting = TenantSettings.Create(
            _tenantId,
            "MaxAttempts",
            "5",
            "Security",
            "Integer");
        intSetting.DataType.Should().Be("Integer");
        intSetting.SettingValue.Should().Be("5");

        // JSON
        var jsonSetting = TenantSettings.Create(
            _tenantId,
            "EmailConfig",
            "{\"smtp\":\"mail.example.com\",\"port\":587}",
            "Email",
            "JSON");
        jsonSetting.DataType.Should().Be("JSON");
        jsonSetting.SettingValue.Should().Be("{\"smtp\":\"mail.example.com\",\"port\":587}");
    }

    private TenantSettings CreateSettings()
    {
        return TenantSettings.Create(
            _tenantId,
            _settingKey,
            _settingValue,
            _category,
            _dataType,
            _description);
    }
}