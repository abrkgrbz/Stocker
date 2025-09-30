using FluentAssertions;
using FluentValidation.TestHelper;
using Stocker.Application.Features.Tenants.Commands.CreateTenant;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Tenants.Validators;

public class CreateTenantCommandValidatorTests
{
    private readonly CreateTenantCommandValidator _validator;

    public CreateTenantCommandValidatorTests()
    {
        _validator = new CreateTenantCommandValidator();
    }

    [Fact]
    public void Should_Have_Error_When_Name_Is_Empty()
    {
        // Arrange
        var command = new CreateTenantCommand { Name = string.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Tenant name is required");
    }

    [Fact]
    public void Should_Have_Error_When_Name_Exceeds_MaxLength()
    {
        // Arrange
        var command = new CreateTenantCommand { Name = new string('a', 101) };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Tenant name must not exceed 100 characters");
    }

    [Fact]
    public void Should_Have_Error_When_Code_Is_Empty()
    {
        // Arrange
        var command = new CreateTenantCommand { Code = string.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Code)
            .WithErrorMessage("Tenant code is required");
    }

    [Fact]
    public void Should_Have_Error_When_Code_Contains_Invalid_Characters()
    {
        // Arrange
        var command = new CreateTenantCommand { Code = "Test_Code!" };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Code)
            .WithErrorMessage("Tenant code can only contain lowercase letters, numbers and hyphens");
    }

    [Theory]
    [InlineData("test-code")]
    [InlineData("test123")]
    [InlineData("test-123-code")]
    public void Should_Not_Have_Error_When_Code_Is_Valid(string code)
    {
        // Arrange
        var command = new CreateTenantCommand { Code = code };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Should_Have_Error_When_Domain_Is_Empty()
    {
        // Arrange
        var command = new CreateTenantCommand { Domain = string.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Domain)
            .WithErrorMessage("Domain is required");
    }

    [Theory]
    [InlineData("not-a-domain")]
    [InlineData("invalid domain")]
    [InlineData("domain.")]
    [InlineData(".domain.com")]
    public void Should_Have_Error_When_Domain_Is_Invalid(string domain)
    {
        // Arrange
        var command = new CreateTenantCommand { Domain = domain };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Domain)
            .WithErrorMessage("Invalid domain format");
    }

    [Theory]
    [InlineData("example.com")]
    [InlineData("subdomain.example.com")]
    [InlineData("test.example.co.uk")]
    public void Should_Not_Have_Error_When_Domain_Is_Valid(string domain)
    {
        // Arrange
        var command = new CreateTenantCommand { Domain = domain };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Domain);
    }

    [Fact]
    public void Should_Have_Error_When_PackageId_Is_Empty()
    {
        // Arrange
        var command = new CreateTenantCommand { PackageId = Guid.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PackageId)
            .WithErrorMessage("Package selection is required");
    }

    [Fact]
    public void Should_Have_Error_When_ContactEmail_Is_Invalid()
    {
        // Arrange
        var command = new CreateTenantCommand { ContactEmail = "not-an-email" };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ContactEmail)
            .WithErrorMessage("Invalid email format");
    }

    [Fact]
    public void Should_Not_Have_Error_When_ContactEmail_Is_Empty()
    {
        // Arrange
        var command = new CreateTenantCommand { ContactEmail = string.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.ContactEmail);
    }

    [Fact]
    public void Should_Pass_Validation_With_Valid_Data()
    {
        // Arrange
        var command = new CreateTenantCommand
        {
            Name = "Test Company",
            Code = "test-company",
            Domain = "test.example.com",
            PackageId = Guid.NewGuid(),
            ContactEmail = "contact@example.com"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }
}