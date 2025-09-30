using FluentAssertions;
using FluentValidation.TestHelper;
using Stocker.Application.Features.Identity.Commands.Register;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity.Validators;

public class RegisterCommandValidatorTests
{
    private readonly RegisterCommandValidator _validator;

    public RegisterCommandValidatorTests()
    {
        _validator = new RegisterCommandValidator();
    }

    [Fact]
    public void Should_Have_Error_When_CompanyName_Is_Empty()
    {
        // Arrange
        var command = new RegisterCommand { CompanyName = "" };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CompanyName)
            .WithErrorMessage("Şirket adı zorunludur");
    }

    [Theory]
    [InlineData("AB")]
    [InlineData("A")]
    public void Should_Have_Error_When_CompanyName_Is_Too_Short(string companyName)
    {
        // Arrange
        var command = new RegisterCommand { CompanyName = companyName };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CompanyName)
            .WithErrorMessage("Şirket adı en az 3 karakter olmalıdır");
    }

    [Fact]
    public void Should_Not_Have_Error_When_CompanyName_Is_Valid()
    {
        // Arrange
        var command = new RegisterCommand { CompanyName = "Test Company" };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.CompanyName);
    }

    [Fact]
    public void Should_Have_Error_When_CompanyCode_Is_Empty()
    {
        // Arrange
        var command = new RegisterCommand { CompanyCode = "" };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CompanyCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid")]
    [InlineData("123")]
    public void Should_Have_Error_When_IdentityType_Is_Invalid(string identityType)
    {
        // Arrange
        var command = new RegisterCommand { IdentityType = identityType };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.IdentityType);
    }

    [Theory]
    [InlineData("tc")]
    [InlineData("vergi")]
    public void Should_Not_Have_Error_When_IdentityType_Is_Valid(string identityType)
    {
        // Arrange
        var command = new RegisterCommand { IdentityType = identityType };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.IdentityType);
    }

    [Theory]
    [InlineData("tc", "12345678901")] // Valid TC: 11 digits
    [InlineData("vergi", "1234567890")] // Valid Vergi: 10 digits
    public void Should_Not_Have_Error_When_IdentityNumber_Is_Valid(string identityType, string identityNumber)
    {
        // Arrange
        var command = new RegisterCommand 
        { 
            IdentityType = identityType,
            IdentityNumber = identityNumber 
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.IdentityNumber);
    }

    [Theory]
    [InlineData("tc", "1234567890")] // TC should be 11 digits
    [InlineData("tc", "123456789012")] // TC too long
    [InlineData("tc", "12345678ABC")] // TC with letters
    [InlineData("vergi", "123456789")] // Vergi should be 10 digits
    [InlineData("vergi", "12345678901")] // Vergi too long
    [InlineData("vergi", "123456789A")] // Vergi with letters
    public void Should_Have_Error_When_IdentityNumber_Is_Invalid(string identityType, string identityNumber)
    {
        // Arrange
        var command = new RegisterCommand 
        { 
            IdentityType = identityType,
            IdentityNumber = identityNumber 
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.IdentityNumber)
            .WithErrorMessage("Geçersiz kimlik numarası formatı");
    }

    [Fact]
    public void Should_Have_Error_When_ContactEmail_Is_Invalid()
    {
        // Arrange
        var command = new RegisterCommand { ContactEmail = "invalid-email" };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ContactEmail)
            .WithErrorMessage("Geçerli bir e-posta adresi girin");
    }

    [Theory]
    [InlineData("user@test.com")]
    [InlineData("admin@company.org")]
    public void Should_Not_Have_Error_When_ContactEmail_Is_Valid(string email)
    {
        // Arrange
        var command = new RegisterCommand { ContactEmail = email };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.ContactEmail);
    }

    [Theory]
    [InlineData("123456789")] // Too short
    [InlineData("12345678901234")] // Too long
    [InlineData("12345ABC90")] // Contains letters
    public void Should_Have_Error_When_ContactPhone_Is_Invalid(string phone)
    {
        // Arrange
        var command = new RegisterCommand { ContactPhone = phone };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ContactPhone)
            .WithErrorMessage("Geçerli bir telefon numarası girin");
    }

    [Theory]
    [InlineData("5551234567")]
    [InlineData("05551234567")]
    public void Should_Not_Have_Error_When_ContactPhone_Is_Valid(string phone)
    {
        // Arrange
        var command = new RegisterCommand { ContactPhone = phone };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.ContactPhone);
    }

    [Theory]
    [InlineData("")] // Empty
    [InlineData("ab")] // Too short
    public void Should_Have_Error_When_Username_Is_Invalid(string username)
    {
        // Arrange
        var command = new RegisterCommand { Username = username };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Theory]
    [InlineData("")] // Empty
    [InlineData("1234567")] // Too short
    [InlineData("password")] // No uppercase
    [InlineData("PASSWORD")] // No lowercase
    [InlineData("Password")] // No digit
    public void Should_Have_Error_When_Password_Is_Invalid(string password)
    {
        // Arrange
        var command = new RegisterCommand { Password = password };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Theory]
    [InlineData("Password123")]
    [InlineData("Test@1234")]
    [InlineData("ComplexPass1")]
    public void Should_Not_Have_Error_When_Password_Is_Valid(string password)
    {
        // Arrange
        var command = new RegisterCommand { Password = password };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Password);
    }

    [Theory]
    [InlineData("")] // Empty
    [InlineData("ab")] // Too short
    [InlineData("Test-Domain")] // Contains hyphen
    [InlineData("Test Domain")] // Contains space
    [InlineData("TestDomain")] // Contains uppercase
    public void Should_Have_Error_When_Domain_Is_Invalid(string domain)
    {
        // Arrange
        var command = new RegisterCommand { Domain = domain };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Domain);
    }

    [Theory]
    [InlineData("testdomain")]
    [InlineData("test123")]
    [InlineData("company2024")]
    public void Should_Not_Have_Error_When_Domain_Is_Valid(string domain)
    {
        // Arrange
        var command = new RegisterCommand { Domain = domain };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Domain);
    }

    [Fact]
    public void Should_Pass_For_Valid_Command()
    {
        // Arrange
        var command = new RegisterCommand
        {
            CompanyName = "Test Company",
            CompanyCode = "TST001",
            IdentityType = "tc",
            IdentityNumber = "12345678901",
            Sector = "Technology",
            EmployeeCount = "10-50",
            ContactName = "John Doe",
            ContactEmail = "john@test.com",
            ContactPhone = "5551234567",
            ContactTitle = "Manager",
            Username = "johndoe",
            Password = "Password123",
            Domain = "testcompany"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Should_Have_Multiple_Errors_For_Invalid_Command()
    {
        // Arrange
        var command = new RegisterCommand
        {
            CompanyName = "",
            CompanyCode = "",
            IdentityType = "invalid",
            IdentityNumber = "123",
            Sector = "",
            EmployeeCount = "",
            ContactName = "",
            ContactEmail = "invalid",
            ContactPhone = "123",
            ContactTitle = "",
            Username = "",
            Password = "123",
            Domain = "Test Domain"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().HaveCountGreaterThan(10);
    }
}