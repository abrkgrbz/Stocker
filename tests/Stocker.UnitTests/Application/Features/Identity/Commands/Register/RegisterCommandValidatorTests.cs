using FluentAssertions;
using Stocker.Application.Features.Identity.Commands.Register;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity.Commands.Register;

public class RegisterCommandValidatorTests
{
    private readonly RegisterCommandValidator _validator;

    public RegisterCommandValidatorTests()
    {
        _validator = new RegisterCommandValidator();
    }

    [Fact]
    public void Should_Pass_When_AllFieldsAreValid()
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
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Theory]
    [InlineData("", "Şirket adı zorunludur")]
    [InlineData("AB", "Şirket adı en az 3 karakter olmalıdır")]
    public void CompanyName_Should_BeValidated(string companyName, string expectedError)
    {
        // Arrange
        var command = CreateValidCommand() with { CompanyName = companyName };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public void CompanyCode_Should_BeRequired()
    {
        // Arrange
        var command = CreateValidCommand() with { CompanyCode = "" };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Şirket kodu zorunludur");
    }

    [Theory]
    [InlineData("tc", "12345678901", true)]
    [InlineData("vergi", "1234567890", true)]
    [InlineData("tc", "123456789", false)] // Too short
    [InlineData("tc", "123456789012", false)] // Too long
    [InlineData("vergi", "123456789", false)] // Too short
    [InlineData("vergi", "12345678901", false)] // Too long
    [InlineData("invalid", "12345678901", false)] // Invalid type
    public void IdentityType_And_IdentityNumber_Should_BeValidated(string type, string number, bool shouldBeValid)
    {
        // Arrange
        var command = CreateValidCommand() with { IdentityType = type, IdentityNumber = number };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().Be(shouldBeValid);
    }

    [Theory]
    [InlineData("", false)]
    [InlineData("test@", false)]
    [InlineData("test@example.com", true)]
    [InlineData("user.name@company.co.uk", true)]
    public void ContactEmail_Should_BeValidEmail(string email, bool shouldBeValid)
    {
        // Arrange
        var command = CreateValidCommand() with { ContactEmail = email };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().Be(shouldBeValid);
        if (!shouldBeValid && !string.IsNullOrEmpty(email))
        {
            result.Errors.Should().Contain(e => e.ErrorMessage == "Geçerli bir e-posta adresi girin");
        }
    }

    [Theory]
    [InlineData("555123456", false)] // Too short
    [InlineData("5551234567", true)] // 10 digits
    [InlineData("05551234567", true)] // 11 digits
    [InlineData("555123456789", false)] // Too long
    [InlineData("555-123-4567", false)] // Contains non-digits
    public void ContactPhone_Should_BeValidPhoneNumber(string phone, bool shouldBeValid)
    {
        // Arrange
        var command = CreateValidCommand() with { ContactPhone = phone };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().Be(shouldBeValid);
    }

    [Theory]
    [InlineData("", false, "Kullanıcı adı zorunludur")]
    [InlineData("ab", false, "Kullanıcı adı en az 3 karakter olmalıdır")]
    [InlineData("abc", true, null)]
    [InlineData("username123", true, null)]
    public void Username_Should_BeValidated(string username, bool shouldBeValid, string expectedError)
    {
        // Arrange
        var command = CreateValidCommand() with { Username = username };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().Be(shouldBeValid);
        if (!shouldBeValid && expectedError != null)
        {
            result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
        }
    }

    [Theory]
    [InlineData("", false, "Şifre zorunludur")]
    [InlineData("Pass12", false, "Şifre en az 8 karakter olmalıdır")]
    [InlineData("password", false, "Şifre en az bir büyük harf içermelidir")]
    [InlineData("PASSWORD", false, "Şifre en az bir küçük harf içermelidir")]
    [InlineData("Password", false, "Şifre en az bir rakam içermelidir")]
    [InlineData("Password123", true, null)]
    [InlineData("Complex1Pass!", true, null)]
    public void Password_Should_BeValidated(string password, bool shouldBeValid, string expectedError)
    {
        // Arrange
        var command = CreateValidCommand() with { Password = password };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().Be(shouldBeValid);
        if (!shouldBeValid && expectedError != null)
        {
            result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
        }
    }

    [Theory]
    [InlineData("", false, "Domain zorunludur")]
    [InlineData("ab", false, "Domain en az 3 karakter olmalıdır")]
    [InlineData("Test", false, "Domain sadece küçük harf ve rakam içerebilir")]
    [InlineData("test-domain", false, "Domain sadece küçük harf ve rakam içerebilir")]
    [InlineData("test_domain", false, "Domain sadece küçük harf ve rakam içerebilir")]
    [InlineData("test123", true, null)]
    [InlineData("mycompany", true, null)]
    public void Domain_Should_BeValidated(string domain, bool shouldBeValid, string expectedError)
    {
        // Arrange
        var command = CreateValidCommand() with { Domain = domain };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().Be(shouldBeValid);
        if (!shouldBeValid && expectedError != null)
        {
            result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
        }
    }

    private RegisterCommand CreateValidCommand()
    {
        return new RegisterCommand
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
    }
}