using FluentAssertions;
using FluentValidation.TestHelper;
using Stocker.Application.Features.Tenants.Commands.CreateTenant;
using Stocker.Domain.Master.Enums;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommandValidatorTests
{
    private readonly CreateTenantCommandValidator _validator;

    public CreateTenantCommandValidatorTests()
    {
        _validator = new CreateTenantCommandValidator();
    }

    [Fact]
    public void Should_HaveError_WhenNameIsEmpty()
    {
        // Arrange
        var command = new CreateTenantCommand { Name = string.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_HaveError_WhenNameIsTooLong()
    {
        // Arrange
        var command = new CreateTenantCommand { Name = new string('a', 201) };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_HaveError_WhenCodeIsEmpty()
    {
        // Arrange
        var command = new CreateTenantCommand { Code = string.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Should_HaveError_WhenCodeIsTooLong()
    {
        // Arrange
        var command = new CreateTenantCommand { Code = new string('a', 51) };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Should_HaveError_WhenDomainIsEmpty()
    {
        // Arrange
        var command = new CreateTenantCommand { Domain = string.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Domain);
    }

    [Fact]
    public void Should_HaveError_WhenDomainIsTooLong()
    {
        // Arrange
        var command = new CreateTenantCommand { Domain = new string('a', 256) };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Domain);
    }

    [Fact]
    public void Should_HaveError_WhenContactEmailIsInvalid()
    {
        // Arrange
        var command = new CreateTenantCommand { ContactEmail = "invalid-email" };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ContactEmail);
    }

    [Fact]
    public void Should_NotHaveError_WhenContactEmailIsNull()
    {
        // Arrange
        var command = new CreateTenantCommand
        {
            Name = "Test Company",
            Code = "test",
            Domain = "test.example.com",
            ContactEmail = null,
            PackageId = Guid.NewGuid(),
            BillingCycle = BillingCycle.Aylik
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.ContactEmail);
    }

    [Fact]
    public void Should_HaveError_WhenPackageIdIsEmpty()
    {
        // Arrange
        var command = new CreateTenantCommand { PackageId = Guid.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PackageId);
    }

    [Fact]
    public void Should_NotHaveError_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateTenantCommand
        {
            Name = "Test Company",
            Code = "test",
            Domain = "test.example.com",
            ContactEmail = "contact@example.com",
            PackageId = Guid.NewGuid(),
            BillingCycle = BillingCycle.Yillik
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        if (!result.IsValid)
        {
            foreach (var error in result.Errors)
            {
                Console.WriteLine($"Property: {error.PropertyName}, Error: {error.ErrorMessage}");
            }
        }
        result.IsValid.Should().BeTrue();
    }
}