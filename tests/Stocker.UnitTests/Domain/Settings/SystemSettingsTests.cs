using FluentAssertions;
using Stocker.Domain.Entities.Settings;
using System.Text.Json;
using Xunit;

namespace Stocker.UnitTests.Domain.Settings;

public class SystemSettingsTests
{
    [Fact]
    public void Constructor_WithValidData_ShouldCreateSystemSettings()
    {
        // Arrange
        var category = SettingCategories.General;
        var key = SettingKeys.SiteName;
        var value = "My Application";
        var description = "The name of the application";
        var isSystem = true;
        var isEncrypted = false;

        // Act
        var settings = new SystemSettings(category, key, value, description, isSystem, isEncrypted);

        // Assert
        settings.Should().NotBeNull();
        settings.Category.Should().Be(category);
        settings.Key.Should().Be(key);
        settings.Value.Should().Be(value);
        settings.Description.Should().Be(description);
        settings.IsSystem.Should().Be(isSystem);
        settings.IsEncrypted.Should().Be(isEncrypted);
        settings.DataType.Should().Be("string");
    }

    [Fact]
    public void Constructor_WithMinimalData_ShouldCreateSystemSettings()
    {
        // Arrange
        var category = SettingCategories.Email;
        var key = SettingKeys.EmailEnable;
        var value = "true";

        // Act
        var settings = new SystemSettings(category, key, value);

        // Assert
        settings.Should().NotBeNull();
        settings.Category.Should().Be(category);
        settings.Key.Should().Be(key);
        settings.Value.Should().Be(value);
        settings.Description.Should().BeNull();
        settings.IsSystem.Should().BeFalse();
        settings.IsEncrypted.Should().BeFalse();
    }

    [Fact]
    public void UpdateValue_ShouldUpdateValue()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.General, SettingKeys.SiteName, "Old Name");
        var newValue = "New Name";

        // Act
        settings.UpdateValue(newValue);

        // Assert
        settings.Value.Should().Be(newValue);
    }

    [Fact]
    public void SetValue_WithString_ShouldSetStringValue()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.General, SettingKeys.AdminEmail, "old@test.com");

        // Act
        settings.SetValue("new@test.com");

        // Assert
        settings.Value.Should().Be("new@test.com");
        settings.DataType.Should().Be("string");
    }

    [Fact]
    public void SetValue_WithInteger_ShouldSetIntegerValue()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.Security, SettingKeys.MinPasswordLength, "8");

        // Act
        settings.SetValue(12);

        // Assert
        settings.Value.Should().Be("12");
        settings.DataType.Should().Be("int32");
    }

    [Fact]
    public void SetValue_WithBoolean_ShouldSetBooleanValue()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.Security, SettingKeys.RequireUppercase, "false");

        // Act
        settings.SetValue(true);

        // Assert
        settings.Value.Should().Be("True");
        settings.DataType.Should().Be("boolean");
    }

    [Fact]
    public void SetValue_WithObject_ShouldSerializeToJson()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.Email, "EmailConfig", "{}");
        var config = new EmailConfig
        {
            Host = "smtp.gmail.com",
            Port = 587,
            EnableSsl = true
        };

        // Act
        settings.SetValue(config);

        // Assert
        settings.DataType.Should().Be("json");
        settings.Value.Should().Contain("smtp.gmail.com");
        settings.Value.Should().Contain("587");
        settings.Value.Should().Contain("true");
    }

    [Fact]
    public void SetValue_WithNull_ShouldNotChangeValue()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.General, SettingKeys.SiteName, "Original");
        var originalValue = settings.Value;
        var originalDataType = settings.DataType;

        // Act
        settings.SetValue<string>(null);

        // Assert
        settings.Value.Should().Be(originalValue);
        settings.DataType.Should().Be(originalDataType);
    }

    [Fact]
    public void GetValue_WithString_ShouldReturnStringValue()
    {
        // Arrange
        var expectedValue = "test@example.com";
        var settings = new SystemSettings(SettingCategories.General, SettingKeys.AdminEmail, expectedValue);

        // Act
        var value = settings.GetValue<string>();

        // Assert
        value.Should().Be(expectedValue);
    }

    [Fact]
    public void GetValue_WithInteger_ShouldReturnIntegerValue()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.Security, SettingKeys.MinPasswordLength, "10");

        // Act
        var value = settings.GetValue<int>();

        // Assert
        value.Should().Be(10);
    }

    [Fact]
    public void GetValue_WithBoolean_ShouldReturnBooleanValue()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.Email, SettingKeys.EmailEnable, "true");

        // Act
        var value = settings.GetValue<bool>();

        // Assert
        value.Should().BeTrue();
    }

    [Fact]
    public void GetValue_WithJson_ShouldDeserializeObject()
    {
        // Arrange
        var config = new EmailConfig
        {
            Host = "smtp.example.com",
            Port = 25,
            EnableSsl = false
        };
        var jsonValue = JsonSerializer.Serialize(config);
        var settings = new SystemSettings(SettingCategories.Email, "EmailConfig", jsonValue);
        settings.SetValue(config); // This will set DataType to "json"

        // Act
        var value = settings.GetValue<EmailConfig>();

        // Assert
        value.Should().NotBeNull();
        value.Host.Should().Be(config.Host);
        value.Port.Should().Be(config.Port);
        value.EnableSsl.Should().Be(config.EnableSsl);
    }

    [Fact]
    public void GetValue_WithInvalidJson_ShouldReturnDefault()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.Email, "EmailConfig", "invalid json");
        // Manually set DataType to json
        typeof(SystemSettings)
            .GetProperty("DataType")
            .SetValue(settings, "json");

        // Act
        var value = settings.GetValue<EmailConfig>();

        // Assert
        value.Should().BeNull();
    }

    [Theory]
    [InlineData(SettingCategories.General)]
    [InlineData(SettingCategories.Email)]
    [InlineData(SettingCategories.Security)]
    [InlineData(SettingCategories.Backup)]
    [InlineData(SettingCategories.Maintenance)]
    [InlineData(SettingCategories.Notifications)]
    public void SettingCategories_ShouldHaveExpectedValues(string category)
    {
        // Assert
        category.Should().NotBeNullOrWhiteSpace();
    }

    [Theory]
    [InlineData(SettingKeys.SiteName)]
    [InlineData(SettingKeys.EmailEnable)]
    [InlineData(SettingKeys.MinPasswordLength)]
    [InlineData(SettingKeys.BackupEnabled)]
    [InlineData(SettingKeys.SessionTimeout)]
    public void SettingKeys_ShouldHaveExpectedValues(string key)
    {
        // Assert
        key.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void SystemSettings_WithEncryption_ShouldMarkAsEncrypted()
    {
        // Arrange & Act
        var settings = new SystemSettings(
            SettingCategories.Security, 
            SettingKeys.SmtpPassword, 
            "encrypted_password", 
            "SMTP password",
            true,
            true);

        // Assert
        settings.IsEncrypted.Should().BeTrue();
        settings.IsSystem.Should().BeTrue();
    }

    [Fact]
    public void SystemSettings_WithComplexObject_ShouldHandleSerialization()
    {
        // Arrange
        var settings = new SystemSettings(SettingCategories.Backup, "BackupConfig", "{}");
        var backupConfig = new BackupConfiguration
        {
            Enabled = true,
            Frequency = "Daily",
            RetentionDays = 30,
            Locations = new[] { "/backup/primary", "/backup/secondary" },
            NotificationEmails = new List<string> { "admin@test.com", "backup@test.com" }
        };

        // Act
        settings.SetValue(backupConfig);
        var retrieved = settings.GetValue<BackupConfiguration>();

        // Assert
        settings.DataType.Should().Be("json");
        retrieved.Should().NotBeNull();
        retrieved.Enabled.Should().Be(backupConfig.Enabled);
        retrieved.Frequency.Should().Be(backupConfig.Frequency);
        retrieved.RetentionDays.Should().Be(backupConfig.RetentionDays);
        retrieved.Locations.Should().BeEquivalentTo(backupConfig.Locations);
        retrieved.NotificationEmails.Should().BeEquivalentTo(backupConfig.NotificationEmails);
    }

    // Test classes
    private class EmailConfig
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public bool EnableSsl { get; set; }
    }

    private class BackupConfiguration
    {
        public bool Enabled { get; set; }
        public string Frequency { get; set; }
        public int RetentionDays { get; set; }
        public string[] Locations { get; set; }
        public List<string> NotificationEmails { get; set; }
    }
}