using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Results;
using Xunit;

namespace Stocker.UnitTests.Domain.ValueObjects;

public class PhoneNumberTests
{
    [Theory]
    [InlineData("+1234567890")]
    [InlineData("+905551234567")]
    [InlineData("+442071234567")]
    [InlineData("1234567890")]
    [InlineData("+1 234 567 8900")] // With spaces
    [InlineData("+1-234-567-8900")] // With dashes
    [InlineData("+1 (234) 567-8900")] // With parentheses
    public void Create_WithValidPhoneNumber_ShouldReturnSuccessResult(string phoneNumber)
    {
        // Act
        var result = PhoneNumber.Create(phoneNumber);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Value.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]

    public void Create_WithEmptyOrNull_ShouldReturnFailureResult(string? phoneNumber)
    {
        // Act
        var result = PhoneNumber.Create(phoneNumber);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("PhoneNumber.Empty");
        result.Error.Type.Should().Be(ErrorType.Validation);
    }

    [Theory]
    [InlineData("abc123")]
    [InlineData("++1234567890")]
    [InlineData("+")]
    [InlineData("0000000")]
    [InlineData("+0123456789")] // Leading zero after country code
    public void Create_WithInvalidFormat_ShouldReturnFailureResult(string phoneNumber)
    {
        // Act
        var result = PhoneNumber.Create(phoneNumber);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("PhoneNumber.Invalid");
        result.Error.Type.Should().Be(ErrorType.Validation);
    }

    [Fact]
    public void Create_WithSpacesAndDashes_ShouldCleanAndReturnSuccess()
    {
        // Arrange
        var phoneWithFormatting = "+1 (234) 567-8900";

        // Act
        var result = PhoneNumber.Create(phoneWithFormatting);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Value.Should().Be("+12345678900"); // Cleaned version
    }

    [Fact]
    public void ToString_ShouldReturnPhoneNumberValue()
    {
        // Arrange
        var phoneNumber = "+1234567890";
        var phoneResult = PhoneNumber.Create(phoneNumber);

        // Act
        var stringValue = phoneResult.Value.ToString();

        // Assert
        stringValue.Should().Be(phoneNumber);
    }

    [Fact]
    public void PhoneNumbers_WithSameValue_ShouldBeEqual()
    {
        // Arrange
        var phone1 = PhoneNumber.Create("+1 234 567 8900").Value;
        var phone2 = PhoneNumber.Create("+1-234-567-8900").Value;

        // Assert
        phone1.Should().Be(phone2); // Both should be cleaned to same value
    }

    [Fact]
    public void PhoneNumbers_WithDifferentValues_ShouldNotBeEqual()
    {
        // Arrange
        var phone1 = PhoneNumber.Create("+1234567890").Value;
        var phone2 = PhoneNumber.Create("+9876543210").Value;

        // Assert
        phone1.Should().NotBe(phone2);
    }
}