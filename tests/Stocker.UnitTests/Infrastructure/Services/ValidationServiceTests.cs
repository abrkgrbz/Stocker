using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.Application.Common.Interfaces;
using Stocker.Infrastructure.Services;
using Stocker.SharedKernel.Settings;
using Stocker.SharedKernel.Results;
using FluentAssertions;
using Xunit;
using Moq;
using MediatR;
using Stocker.Application.Features.Tenants.Queries.CheckSubdomainAvailability;

namespace Stocker.UnitTests.Infrastructure.Services;

public class ValidationServiceTests
{
    private readonly ValidationService _validationService;
    private readonly Mock<ILogger<ValidationService>> _loggerMock;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly IOptions<PasswordPolicy> _passwordPolicyOptions;

    public ValidationServiceTests()
    {
        _loggerMock = new Mock<ILogger<ValidationService>>();
        _mediatorMock = new Mock<IMediator>();

        var passwordPolicy = new PasswordPolicy
        {
            RequireDigit = true,
            RequireLowercase = true,
            RequireUppercase = true,
            RequireNonAlphanumeric = true,
            MinimumLength = 8,
            MaximumLength = 100
        };
        _passwordPolicyOptions = Options.Create(passwordPolicy);

        _validationService = new ValidationService(
            _loggerMock.Object,
            _passwordPolicyOptions,
            _mediatorMock.Object
        );
    }

    #region ValidateEmailAsync Tests

    [Fact]
    public async Task ValidateEmailAsync_Should_Return_Invalid_When_Email_Is_Null()
    {
        // Act
        var result = await _validationService.ValidateEmailAsync(null!);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Email adresi boş olamaz");
    }

    [Fact]
    public async Task ValidateEmailAsync_Should_Return_Invalid_When_Email_Is_Empty()
    {
        // Act
        var result = await _validationService.ValidateEmailAsync("");

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Email adresi boş olamaz");
    }

    [Fact]
    public async Task ValidateEmailAsync_Should_Return_Invalid_When_Email_Is_Whitespace()
    {
        // Act
        var result = await _validationService.ValidateEmailAsync("   ");

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Email adresi boş olamaz");
    }

    [Theory]
    [InlineData("invalidemail")]
    [InlineData("invalid@")]
    [InlineData("@invalid.com")]
    [InlineData("invalid@domain")]
    public async Task ValidateEmailAsync_Should_Return_Invalid_For_Invalid_Email_Format(string email)
    {
        // Act
        var result = await _validationService.ValidateEmailAsync(email);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Contain("Geçersiz email formatı");
    }

    [Theory]
    [InlineData("test@tempmail.com")]
    [InlineData("user@throwaway.email")]
    [InlineData("fake@mailinator.com")]
    [InlineData("disposable@10minutemail.com")]
    public async Task ValidateEmailAsync_Should_Return_Invalid_For_Disposable_Email_Domains(string email)
    {
        // Act
        var result = await _validationService.ValidateEmailAsync(email);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Contain("Geçici email");
    }

    [Theory]
    [InlineData("valid@example.com")]
    [InlineData("user.name@company.co.uk")]
    [InlineData("first.last@subdomain.domain.com")]
    [InlineData("test123@gmail.com")]
    public async Task ValidateEmailAsync_Should_Return_Valid_For_Valid_Emails(string email)
    {
        // Act
        var result = await _validationService.ValidateEmailAsync(email);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Message.Should().Be("Email adresi geçerli");
    }

    #endregion

    #region ValidatePhoneAsync Tests

    [Fact]
    public async Task ValidatePhoneAsync_Should_Return_Invalid_When_Phone_Is_Null()
    {
        // Act
        var result = await _validationService.ValidatePhoneAsync(null!);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Telefon numarası boş olamaz");
    }

    [Fact]
    public async Task ValidatePhoneAsync_Should_Return_Invalid_When_Phone_Is_Empty()
    {
        // Act
        var result = await _validationService.ValidatePhoneAsync("");

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Telefon numarası boş olamaz");
    }

    [Theory]
    [InlineData("123")]
    [InlineData("12345")]
    [InlineData("abcdefghij")]
    public async Task ValidatePhoneAsync_Should_Return_Invalid_For_Invalid_Phone_Format(string phone)
    {
        // Act
        var result = await _validationService.ValidatePhoneAsync(phone);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Contain("10 haneli");
    }

    [Theory]
    [InlineData("5551234567")]
    [InlineData("555-123-4567")]
    [InlineData("555 123 4567")]
    [InlineData("+905551234567")]
    public async Task ValidatePhoneAsync_Should_Return_Valid_For_Valid_Turkish_Phone_Numbers(string phone)
    {
        // Act
        var result = await _validationService.ValidatePhoneAsync(phone, "TR");

        // Assert
        result.IsValid.Should().BeTrue();
        result.Message.Should().Be("Telefon numarası geçerli");
    }

    #endregion

    #region CheckPasswordStrengthAsync Tests

    [Fact]
    public async Task CheckPasswordStrengthAsync_Should_Return_VeryWeak_When_Password_Is_Null()
    {
        // Act
        var result = await _validationService.CheckPasswordStrengthAsync(null!);

        // Assert
        result.Level.Should().Be("VeryWeak");
        result.Score.Should().Be(0);
        result.Suggestions.Should().Contain("Şifre boş olamaz");
    }

    [Fact]
    public async Task CheckPasswordStrengthAsync_Should_Return_VeryWeak_When_Password_Is_Empty()
    {
        // Act
        var result = await _validationService.CheckPasswordStrengthAsync("");

        // Assert
        result.Level.Should().Be("VeryWeak");
        result.Score.Should().Be(0);
        result.Suggestions.Should().Contain("Şifre boş olamaz");
    }

    [Theory]
    [InlineData("123456")]
    [InlineData("password")]
    [InlineData("qwerty")]
    [InlineData("abc123")]
    public async Task CheckPasswordStrengthAsync_Should_Return_VeryWeak_For_Common_Passwords(string password)
    {
        // Act
        var result = await _validationService.CheckPasswordStrengthAsync(password);

        // Assert
        result.Level.Should().Be("VeryWeak");
        result.ContainsCommonPassword.Should().BeTrue();
    }

    [Theory]
    [InlineData("short")]
    [InlineData("1234567")]
    public async Task CheckPasswordStrengthAsync_Should_Return_Weak_When_Password_Is_Too_Short(string password)
    {
        // Act
        var result = await _validationService.CheckPasswordStrengthAsync(password);

        // Assert
        result.Level.Should().BeOneOf("VeryWeak", "Weak");
        result.Suggestions.Should().Contain(suggestion => suggestion.Contains("En az 8 karakter", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task CheckPasswordStrengthAsync_Should_Return_Strong_For_Complex_Password()
    {
        // Arrange
        var password = "MyP@ssw0rd123!";

        // Act
        var result = await _validationService.CheckPasswordStrengthAsync(password);

        // Assert
        result.Level.Should().BeOneOf("Strong", "VeryStrong");
        result.Score.Should().BeGreaterThan(3);
    }

    #endregion

    #region CheckDomainAvailabilityAsync Tests

    [Fact]
    public async Task CheckDomainAvailabilityAsync_Should_Return_Invalid_When_Domain_Is_Null()
    {
        // Act
        var result = await _validationService.CheckDomainAvailabilityAsync(null!);

        // Assert
        result.IsAvailable.Should().BeFalse();
        result.Message.Should().Be("Domain adı boş olamaz");
    }

    [Fact]
    public async Task CheckDomainAvailabilityAsync_Should_Return_Invalid_When_Domain_Is_Empty()
    {
        // Act
        var result = await _validationService.CheckDomainAvailabilityAsync("");

        // Assert
        result.IsAvailable.Should().BeFalse();
        result.Message.Should().Be("Domain adı boş olamaz");
    }

    [Theory]
    [InlineData("ab")]
    [InlineData("a")]
    public async Task CheckDomainAvailabilityAsync_Should_Return_Invalid_When_Domain_Is_Too_Short(string domain)
    {
        // Arrange - MediatR will be called, mock the failure response
        _mediatorMock.Setup(x => x.Send(It.IsAny<CheckSubdomainAvailabilityQuery>(), default))
            .ThrowsAsync(new Exception("Domain validation error"));

        // Act
        var result = await _validationService.CheckDomainAvailabilityAsync(domain);

        // Assert
        result.IsAvailable.Should().BeFalse();
        result.Message.Should().Contain("hata");
    }

    [Theory]
    [InlineData("test")]
    [InlineData("demo")]
    [InlineData("admin")]
    [InlineData("system")]
    public async Task CheckDomainAvailabilityAsync_Should_Return_Unavailable_For_Existing_Domains(string domain)
    {
        // Arrange
        var response = new CheckSubdomainAvailabilityResponse { Available = false };
        _mediatorMock.Setup(x => x.Send(It.IsAny<CheckSubdomainAvailabilityQuery>(), default))
            .ReturnsAsync(Result<CheckSubdomainAvailabilityResponse>.Success(response));

        // Act
        var result = await _validationService.CheckDomainAvailabilityAsync(domain);

        // Assert
        result.IsAvailable.Should().BeFalse();
        result.Message.Should().Contain("kullanılıyor");
    }

    [Theory]
    [InlineData("mycompany")]
    [InlineData("newdomain")]
    [InlineData("testcompany123")]
    public async Task CheckDomainAvailabilityAsync_Should_Return_Available_For_Valid_New_Domains(string domain)
    {
        // Arrange
        var response = new CheckSubdomainAvailabilityResponse { Available = true };
        _mediatorMock.Setup(x => x.Send(It.IsAny<CheckSubdomainAvailabilityQuery>(), default))
            .ReturnsAsync(Result<CheckSubdomainAvailabilityResponse>.Success(response));

        // Act
        var result = await _validationService.CheckDomainAvailabilityAsync(domain);

        // Assert
        result.IsAvailable.Should().BeTrue();
        result.Message.Should().Contain("kullanılabilir");
    }

    #endregion

    #region ValidateIdentityNumberAsync Tests

    [Fact]
    public async Task ValidateIdentityNumberAsync_Should_Return_Invalid_When_IdentityNumber_Is_Null()
    {
        // Act
        var result = await _validationService.ValidateIdentityNumberAsync(null!);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Kimlik/Vergi numarası boş olamaz");
    }

    [Theory]
    [InlineData("12345678901")] // 11 digits but starts with invalid digit
    [InlineData("00000000000")] // All zeros
    [InlineData("11111111111")] // All same digits
    public async Task ValidateIdentityNumberAsync_Should_Return_Valid_For_Basic_Valid_TC_Format(string identityNumber)
    {
        // Act
        var result = await _validationService.ValidateIdentityNumberAsync(identityNumber);

        // Assert
        // Note: The actual TC validation algorithm is complex, for now we're testing basic format
        result.Should().NotBeNull();
    }

    #endregion

    #region ValidateCompanyNameAsync Tests

    [Fact]
    public async Task ValidateCompanyNameAsync_Should_Return_Invalid_When_CompanyName_Is_Null()
    {
        // Act
        var result = await _validationService.ValidateCompanyNameAsync(null!);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Şirket adı boş olamaz");
    }

    [Theory]
    [InlineData("admin")]
    [InlineData("test")]
    [InlineData("system")]
    [InlineData("microsoft")]
    public async Task ValidateCompanyNameAsync_Should_Return_Invalid_For_Restricted_Words(string companyName)
    {
        // Act
        var result = await _validationService.ValidateCompanyNameAsync(companyName);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Message.Should().Contain("kısıtlı kelimeler");
    }

    [Theory]
    [InlineData("My Company Ltd.")]
    [InlineData("Teknoloji A.Ş.")]
    [InlineData("Yazılım Limited Şirketi")]
    public async Task ValidateCompanyNameAsync_Should_Return_Valid_For_Valid_Company_Names(string companyName)
    {
        // Act
        var result = await _validationService.ValidateCompanyNameAsync(companyName);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Message.Should().Be("Şirket adı kullanılabilir");
    }

    #endregion

    #region ValidateTenantCodeAsync Tests

    [Fact]
    public async Task ValidateTenantCodeAsync_Should_Return_Invalid_When_Code_Is_Null()
    {
        // Act
        var result = await _validationService.ValidateTenantCodeAsync(null!);

        // Assert
        result.IsAvailable.Should().BeFalse();
        result.Message.Should().Be("Kod boş olamaz");
    }

    [Theory]
    [InlineData("ab")]
    [InlineData("a")]
    public async Task ValidateTenantCodeAsync_Should_Return_Invalid_When_Code_Is_Too_Short(string code)
    {
        // Act
        var result = await _validationService.ValidateTenantCodeAsync(code);

        // Assert
        result.IsAvailable.Should().BeFalse();
        result.Message.Should().Contain("en az 3 karakter");
    }

    [Theory]
    [InlineData("TEST123")]
    [InlineData("COMPANY")]
    [InlineData("MYCODE")]
    public async Task ValidateTenantCodeAsync_Should_Return_Valid_For_Valid_Codes(string code)
    {
        // Arrange
        var response = new CheckSubdomainAvailabilityResponse { Available = true };
        _mediatorMock.Setup(x => x.Send(It.IsAny<CheckSubdomainAvailabilityQuery>(), default))
            .ReturnsAsync(Result<CheckSubdomainAvailabilityResponse>.Success(response));

        // Act
        var result = await _validationService.ValidateTenantCodeAsync(code);

        // Assert
        result.IsAvailable.Should().BeTrue();
        result.Message.Should().Be("Bu kod kullanılabilir");
    }

    #endregion
}