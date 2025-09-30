using FluentAssertions;
using FluentValidation.TestHelper;
using Stocker.Application.Features.Tenant.Settings.Commands;
using Stocker.Application.Features.Tenant.Settings.Validators;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Tenant.Settings.Validators;

public class UpdateSettingCommandValidatorTests
{
    private readonly UpdateSettingCommandValidator _validator;

    public UpdateSettingCommandValidatorTests()
    {
        _validator = new UpdateSettingCommandValidator();
    }

    [Fact]
    public void Should_Have_Error_When_TenantId_Is_Empty()
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.Empty,
            SettingKey = "test.setting",
            SettingValue = "value"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.TenantId)
            .WithErrorMessage("Geçerli bir Tenant ID giriniz");
    }

    [Fact]
    public void Should_Not_Have_Error_When_TenantId_Is_Valid()
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = "value"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.TenantId);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void Should_Have_Error_When_SettingKey_Is_Empty(string key)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = "value"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingKey)
            .WithErrorMessage("Ayar anahtarı zorunludur");
    }

    [Fact]
    public void Should_Have_Error_When_SettingKey_Is_Too_Long()
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = new string('a', 101),
            SettingValue = "value"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingKey)
            .WithErrorMessage("Ayar anahtarı en fazla 100 karakter olabilir");
    }

    [Theory]
    [InlineData("Test.Setting")] // Starts with uppercase
    [InlineData("1test.setting")] // Starts with number
    [InlineData("test-setting")] // Contains hyphen
    [InlineData("test setting")] // Contains space
    [InlineData("_test.setting")] // Starts with underscore
    public void Should_Have_Error_When_SettingKey_Has_Invalid_Format(string key)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = "value"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingKey)
            .WithErrorMessage("Ayar anahtarı küçük harf ile başlamalı ve sadece küçük harf, rakam, nokta ve alt çizgi içerebilir");
    }

    [Theory]
    [InlineData("test.setting")]
    [InlineData("test_setting")]
    [InlineData("test123")]
    [InlineData("test.setting_123")]
    public void Should_Not_Have_Error_When_SettingKey_Has_Valid_Format(string key)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = "value"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingKey);
    }

    [Fact]
    public void Should_Have_Error_When_SettingValue_Is_Null()
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = null
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Ayar değeri null olamaz");
    }

    [Fact]
    public void Should_Have_Error_When_SettingValue_Is_Too_Long()
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = new string('a', 4001)
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Ayar değeri en fazla 4000 karakter olabilir");
    }

    [Theory]
    [InlineData("contact.email", "invalid-email")]
    [InlineData("support_email", "not-an-email")]
    [InlineData("email_address", "@invalid.com")]
    public void Should_Have_Error_When_Email_Setting_Has_Invalid_Email(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Geçerli bir email adresi giriniz");
    }

    [Theory]
    [InlineData("contact.email", "test@example.com")]
    [InlineData("support_email", "admin@company.org")]
    [InlineData("email_address", "user@test.co.uk")]
    public void Should_Not_Have_Error_When_Email_Setting_Has_Valid_Email(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Theory]
    [InlineData("company.url", "not-a-url")]
    [InlineData("website", "htt://invalid")]
    [InlineData("api_url", "ftp://example.com")] // Only http/https allowed
    public void Should_Have_Error_When_Url_Setting_Has_Invalid_Url(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Geçerli bir URL giriniz");
    }

    [Theory]
    [InlineData("company.url", "http://example.com")]
    [InlineData("website", "https://www.example.com")]
    [InlineData("api_url", "https://api.example.com/v1")]
    public void Should_Not_Have_Error_When_Url_Setting_Has_Valid_Url(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Theory]
    [InlineData("contact.phone", "123")]
    [InlineData("tel_number", "abcd")]
    [InlineData("phone", "123456789012345678")] // Too long
    public void Should_Have_Error_When_Phone_Setting_Has_Invalid_Phone(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Geçerli bir telefon numarası giriniz");
    }

    [Theory]
    [InlineData("contact.phone", "5551234567")]
    [InlineData("tel_number", "+90 555 123 4567")]
    [InlineData("phone", "(555) 123-4567")]
    public void Should_Not_Have_Error_When_Phone_Setting_Has_Valid_Phone(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Theory]
    [InlineData("tax_number", "12345")]
    [InlineData("tax_id", "abc1234567")]
    [InlineData("company.tax", "123456789012")] // Too long
    public void Should_Have_Error_When_Tax_Setting_Has_Invalid_TaxNumber(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Vergi numarası 10 veya 11 haneli olmalıdır");
    }

    [Theory]
    [InlineData("tax_number", "1234567890")]
    [InlineData("tax_id", "12345678901")]
    public void Should_Not_Have_Error_When_Tax_Setting_Has_Valid_TaxNumber(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Theory]
    [InlineData("user.limit", "abc")]
    [InlineData("max_count", "12.34.56")]
    [InlineData("page_size", "not-a-number")]
    public void Should_Have_Error_When_Number_Setting_Has_Invalid_Number(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Bu alan sadece sayı içerebilir");
    }

    [Theory]
    [InlineData("user.limit", "100")]
    [InlineData("max_count", "12.34")]
    [InlineData("page_size", "50")]
    public void Should_Not_Have_Error_When_Number_Setting_Has_Valid_Number(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Theory]
    [InlineData("feature.enabled", "yes")]
    [InlineData("is_active", "1")]
    [InlineData("allow_access", "on")]
    public void Should_Have_Error_When_Boolean_Setting_Has_Invalid_Boolean(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Bu alan sadece 'true' veya 'false' değeri alabilir");
    }

    [Theory]
    [InlineData("feature.enabled", "true")]
    [InlineData("is_active", "false")]
    [InlineData("allow_access", "TRUE")]
    [InlineData("enabled", "FALSE")]
    public void Should_Not_Have_Error_When_Boolean_Setting_Has_Valid_Boolean(string key, string value)
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = value
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Fact]
    public void Should_Allow_Empty_Value_For_Optional_Settings()
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "optional.setting",
            SettingValue = ""
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Fact]
    public void Should_Pass_For_Valid_Command()
    {
        // Arrange
        var command = new UpdateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "company.name",
            SettingValue = "Test Company Ltd."
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }
}