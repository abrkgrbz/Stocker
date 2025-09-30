using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Results;
using Xunit;

namespace Stocker.UnitTests.Domain.ValueObjects;

public class EmailTests
{
    [Theory]
    [InlineData("user@example.com")]
    [InlineData("test.user@example.com")]
    [InlineData("user+tag@example.com")]
    [InlineData("user123@example.co.uk")]
    public void Create_WithValidEmail_ShouldReturnSuccessResult(string email)
    {
        // Act
        var result = Email.Create(email);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Value.Should().Be(email.ToLowerInvariant());
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]

    public void Create_WithEmptyOrNull_ShouldReturnFailureResult(string? email)
    {
        // Act
        var result = Email.Create(email);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Email.Empty");
        result.Error.Type.Should().Be(ErrorType.Validation);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("invalid@")]
    [InlineData("@example.com")]
    [InlineData("user@")]
    [InlineData("user.example.com")]
    [InlineData("user@example")]
    public void Create_WithInvalidFormat_ShouldReturnFailureResult(string email)
    {
        // Act
        var result = Email.Create(email);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Email.Invalid");
        result.Error.Type.Should().Be(ErrorType.Validation);
    }

    [Fact]
    public void GetDomain_ShouldReturnDomainPart()
    {
        // Arrange
        var emailResult = Email.Create("user@example.com");

        // Act
        var domain = emailResult.Value.GetDomain();

        // Assert
        domain.Should().Be("example.com");
    }

    [Fact]
    public void GetLocalPart_ShouldReturnLocalPart()
    {
        // Arrange
        var emailResult = Email.Create("user@example.com");

        // Act
        var localPart = emailResult.Value.GetLocalPart();

        // Assert
        localPart.Should().Be("user");
    }

    [Fact]
    public void ToString_ShouldReturnEmailValue()
    {
        // Arrange
        var email = "user@example.com";
        var emailResult = Email.Create(email);

        // Act
        var stringValue = emailResult.Value.ToString();

        // Assert
        stringValue.Should().Be(email.ToLowerInvariant());
    }

    [Fact]
    public void Emails_WithSameValue_ShouldBeEqual()
    {
        // Arrange
        var email1 = Email.Create("user@example.com").Value;
        var email2 = Email.Create("USER@EXAMPLE.COM").Value;

        // Assert
        email1.Should().Be(email2);
    }

    [Fact]
    public void Emails_WithDifferentValues_ShouldNotBeEqual()
    {
        // Arrange
        var email1 = Email.Create("user1@example.com").Value;
        var email2 = Email.Create("user2@example.com").Value;

        // Assert
        email1.Should().NotBe(email2);
    }
}