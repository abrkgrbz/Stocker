using FluentAssertions;
using FluentValidation.TestHelper;
using Stocker.Application.Features.Tenant.Settings.Commands;
using Stocker.Application.Features.Tenant.Settings.Validators;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Tenant.Settings.Validators;

public class CreateSettingCommandValidatorTests
{
    private readonly CreateSettingCommandValidator _validator;

    public CreateSettingCommandValidatorTests()
    {
        _validator = new CreateSettingCommandValidator();
    }

    [Fact]
    public void Should_Have_Error_When_TenantId_Is_Empty()
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.Empty,
            SettingKey = "test.setting",
            SettingValue = "value",
            Category = "Genel",
            DataType = "string"
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
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = "value",
            Category = "Genel",
            DataType = "string"
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
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = "value",
            Category = "Genel",
            DataType = "string"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingKey)
            .WithErrorMessage("Ayar anahtarı zorunludur");
    }

    [Theory]
    [InlineData("system.version")]
    [InlineData("system.build")]
    [InlineData("database.connection")]
    [InlineData("api.key")]
    [InlineData("api.secret")]
    public void Should_Have_Error_When_SettingKey_Is_Reserved(string key)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = "value",
            Category = "Genel",
            DataType = "string"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingKey)
            .WithErrorMessage("Bu ayar anahtarı sistem tarafından rezerve edilmiştir");
    }

    [Theory]
    [InlineData("Test.Setting")] // Starts with uppercase
    [InlineData("1test.setting")] // Starts with number
    [InlineData("_test.setting")] // Starts with underscore
    [InlineData("test-setting")] // Contains hyphen
    [InlineData("test setting")] // Contains space
    public void Should_Have_Error_When_SettingKey_Has_Invalid_Format(string key)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = "value",
            Category = "Genel",
            DataType = "string"
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
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = key,
            SettingValue = "value",
            Category = "Genel",
            DataType = "string"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingKey);
    }

    [Theory]
    [InlineData("Genel")]
    [InlineData("Güvenlik")]
    [InlineData("E-posta")]
    [InlineData("Fatura")]
    [InlineData("Yerelleştirme")]
    [InlineData("Sistem")]
    public void Should_Not_Have_Error_When_Category_Is_Valid(string category)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = "value",
            Category = category,
            DataType = "string"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Category);
    }

    [Theory]
    [InlineData("Invalid")]
    [InlineData("Other")]
    [InlineData("")]
    public void Should_Have_Error_When_Category_Is_Invalid(string category)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = "value",
            Category = category,
            DataType = "string"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Category);
    }

    [Theory]
    [InlineData("string")]
    [InlineData("number")]
    [InlineData("boolean")]
    [InlineData("json")]
    [InlineData("date")]
    [InlineData("datetime")]
    public void Should_Not_Have_Error_When_DataType_Is_Valid(string dataType)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = dataType == "boolean" ? "true" : 
                           dataType == "number" ? "123" :
                           dataType == "date" ? "2024-01-01" :
                           dataType == "datetime" ? "2024-01-01T10:00:00" :
                           dataType == "json" ? "{\"key\":\"value\"}" : "value",
            Category = "Genel",
            DataType = dataType
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.DataType);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("text")]
    [InlineData("")]
    public void Should_Have_Error_When_DataType_Is_Invalid(string dataType)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = "value",
            Category = "Genel",
            DataType = dataType
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.DataType);
    }

    [Theory]
    [InlineData("true")]
    [InlineData("false")]
    [InlineData("TRUE")]
    [InlineData("FALSE")]
    public void Should_Not_Have_Error_When_Boolean_Value_Is_Valid(string value)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = value,
            Category = "Genel",
            DataType = "boolean"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Theory]
    [InlineData("yes")]
    [InlineData("1")]
    [InlineData("on")]
    public void Should_Have_Error_When_Boolean_Value_Is_Invalid(string value)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = value,
            Category = "Genel",
            DataType = "boolean"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Boolean tipindeki ayarlar sadece 'true' veya 'false' değeri alabilir");
    }

    [Theory]
    [InlineData("123")]
    [InlineData("123.45")]
    [InlineData("-123")]
    [InlineData("0")]
    public void Should_Not_Have_Error_When_Number_Value_Is_Valid(string value)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = value,
            Category = "Genel",
            DataType = "number"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("12.34.56")]
    [InlineData("not-a-number")]
    public void Should_Have_Error_When_Number_Value_Is_Invalid(string value)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = value,
            Category = "Genel",
            DataType = "number"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Number tipindeki ayarlar sadece sayısal değer alabilir");
    }

    [Theory]
    [InlineData("2024-01-01")]
    [InlineData("2024-12-31")]
    public void Should_Not_Have_Error_When_Date_Value_Is_Valid(string value)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = value,
            Category = "Genel",
            DataType = "date"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Theory]
    [InlineData("01/01/2024")]
    [InlineData("2024-13-01")] // Invalid month
    [InlineData("not-a-date")]
    public void Should_Have_Error_When_Date_Value_Is_Invalid(string value)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = value,
            Category = "Genel",
            DataType = "date"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Date tipindeki ayarlar geçerli bir tarih formatında olmalıdır (yyyy-MM-dd)");
    }

    [Theory]
    [InlineData("{\"key\":\"value\"}")]
    [InlineData("[]")]
    [InlineData("[1,2,3]")]
    public void Should_Not_Have_Error_When_Json_Value_Is_Valid(string value)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = value,
            Category = "Genel",
            DataType = "json"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SettingValue);
    }

    [Theory]
    [InlineData("{invalid json}")]
    [InlineData("not json")]
    [InlineData("{\"key\":}")]
    public void Should_Have_Error_When_Json_Value_Is_Invalid(string value)
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = value,
            Category = "Genel",
            DataType = "json"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("JSON tipindeki ayarlar geçerli JSON formatında olmalıdır");
    }

    [Fact]
    public void Should_Have_Error_When_Encrypted_Value_Is_Too_Long()
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "test.setting",
            SettingValue = new string('a', 2001),
            Category = "Genel",
            DataType = "string",
            IsEncrypted = true
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SettingValue)
            .WithErrorMessage("Şifrelenmiş değerler en fazla 2000 karakter olabilir");
    }

    [Fact]
    public void Should_Pass_For_Valid_Command()
    {
        // Arrange
        var command = new CreateSettingCommand
        {
            TenantId = Guid.NewGuid(),
            SettingKey = "company.name",
            SettingValue = "Test Company",
            Description = "Company name setting",
            Category = "Genel",
            DataType = "string",
            IsEncrypted = false,
            IsPublic = true
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }
}