using FluentAssertions;
using Stocker.Domain.Master.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.Master.ValueObjects;

public class TenantIdentifierTests
{
    [Fact]
    public void Create_WithValidIdentifier_ShouldCreateTenantIdentifier()
    {
        // Arrange
        var identifier = "my-tenant-123";

        // Act
        var tenantIdentifier = TenantIdentifier.Create(identifier);

        // Assert
        tenantIdentifier.Should().NotBeNull();
        tenantIdentifier.Value.Should().Be(identifier);
        tenantIdentifier.ToString().Should().Be(identifier);
    }

    [Fact]
    public void Create_WithUppercase_ShouldNormalizeToLowercase()
    {
        // Arrange
        var identifier = "MY-TENANT-123";
        var expected = "my-tenant-123";

        // Act
        var tenantIdentifier = TenantIdentifier.Create(identifier);

        // Assert
        tenantIdentifier.Value.Should().Be(expected);
    }

    [Fact]
    public void Create_WithWhitespace_ShouldTrimWhitespace()
    {
        // Arrange
        var identifier = "  my-tenant  ";
        var expected = "my-tenant";

        // Act
        var tenantIdentifier = TenantIdentifier.Create(identifier);

        // Assert
        tenantIdentifier.Value.Should().Be(expected);
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("tenant")]
    [InlineData("my-tenant")]
    [InlineData("tenant123")]
    [InlineData("123tenant")]
    [InlineData("a1b2c3")]
    [InlineData("tenant-with-multiple-dashes")]
    [InlineData("abcdefghijklmnopqrstuvwxyz0123456789-abcdefghijklmnopqrstuvw")]
    public void Create_WithValidIdentifiers_ShouldSucceed(string identifier)
    {
        // Act
        var tenantIdentifier = TenantIdentifier.Create(identifier);

        // Assert
        tenantIdentifier.Should().NotBeNull();
        tenantIdentifier.Value.Should().Be(identifier.ToLowerInvariant());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithNullOrWhitespace_ShouldThrowArgumentException(string identifier)
    {
        // Act
        var action = () => TenantIdentifier.Create(identifier);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Tenant identifier cannot be empty.*")
            .WithParameterName("value");
    }

    [Theory]
    [InlineData("ab")] // Too short
    [InlineData("a")] // Too short
    public void Create_WithTooShortIdentifier_ShouldThrowArgumentException(string identifier)
    {
        // Act
        var action = () => TenantIdentifier.Create(identifier);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Tenant identifier must be between 3 and 63 characters.*")
            .WithParameterName("value");
    }

    [Fact]
    public void Create_WithTooLongIdentifier_ShouldThrowArgumentException()
    {
        // Arrange
        var identifier = new string('a', 64); // 64 characters, too long

        // Act
        var action = () => TenantIdentifier.Create(identifier);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Tenant identifier must be between 3 and 63 characters.*")
            .WithParameterName("value");
    }

    [Theory]
    [InlineData("-tenant")] // Starts with hyphen
    [InlineData("tenant-")] // Ends with hyphen
    [InlineData("-tenant-")] // Starts and ends with hyphen
    [InlineData("my_tenant")] // Contains underscore
    [InlineData("my tenant")] // Contains space
    [InlineData("my.tenant")] // Contains dot
    [InlineData("my@tenant")] // Contains special character
    [InlineData("my/tenant")] // Contains slash
    public void Create_WithInvalidCharacters_ShouldThrowArgumentException(string identifier)
    {
        // Act
        var action = () => TenantIdentifier.Create(identifier);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Tenant identifier can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.*")
            .WithParameterName("value");
    }

    [Fact]
    public void Create_WithExactlyThreeCharacters_ShouldSucceed()
    {
        // Arrange
        var identifier = "abc";

        // Act
        var tenantIdentifier = TenantIdentifier.Create(identifier);

        // Assert
        tenantIdentifier.Value.Should().Be(identifier);
    }

    [Fact]
    public void Create_WithExactlySixtyThreeCharacters_ShouldSucceed()
    {
        // Arrange
        var identifier = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz1"; // 63 chars

        // Act
        var tenantIdentifier = TenantIdentifier.Create(identifier);

        // Assert
        tenantIdentifier.Value.Should().Be(identifier);
        tenantIdentifier.Value.Length.Should().Be(63);
    }

    [Fact]
    public void Equals_WithSameValue_ShouldReturnTrue()
    {
        // Arrange
        var identifier1 = TenantIdentifier.Create("my-tenant");
        var identifier2 = TenantIdentifier.Create("my-tenant");

        // Act & Assert
        identifier1.Should().Be(identifier2);
        identifier1.GetHashCode().Should().Be(identifier2.GetHashCode());
    }

    [Fact]
    public void Equals_WithDifferentValue_ShouldReturnFalse()
    {
        // Arrange
        var identifier1 = TenantIdentifier.Create("tenant1");
        var identifier2 = TenantIdentifier.Create("tenant2");

        // Act & Assert
        identifier1.Should().NotBe(identifier2);
        identifier1.GetHashCode().Should().NotBe(identifier2.GetHashCode());
    }

    [Fact]
    public void Equals_WithDifferentCase_ShouldReturnTrue()
    {
        // Arrange
        var identifier1 = TenantIdentifier.Create("My-Tenant");
        var identifier2 = TenantIdentifier.Create("my-tenant");

        // Act & Assert
        identifier1.Should().Be(identifier2); // Both normalized to lowercase
        identifier1.GetHashCode().Should().Be(identifier2.GetHashCode());
    }

    [Fact]
    public void ToString_ShouldReturnValue()
    {
        // Arrange
        var value = "my-tenant";
        var identifier = TenantIdentifier.Create(value);

        // Act
        var result = identifier.ToString();

        // Assert
        result.Should().Be(value);
    }

    [Fact]
    public void GetEqualityComponents_ShouldReturnValue()
    {
        // Arrange
        var value = "my-tenant";
        var identifier = TenantIdentifier.Create(value);

        // Act
        var components = identifier.GetEqualityComponents().ToList();

        // Assert
        components.Should().HaveCount(1);
        components[0].Should().Be(value);
    }

    [Theory]
    [InlineData("tenant123", "tenant123")]
    [InlineData("TENANT123", "tenant123")]
    [InlineData("  tenant123  ", "tenant123")]
    [InlineData("Tenant-123", "tenant-123")]
    public void Create_WithVariousInputs_ShouldNormalizeCorrectly(string input, string expected)
    {
        // Act
        var identifier = TenantIdentifier.Create(input);

        // Assert
        identifier.Value.Should().Be(expected);
    }

    [Fact]
    public void Create_WithNumericOnly_ShouldSucceed()
    {
        // Arrange
        var identifier = "123456";

        // Act
        var tenantIdentifier = TenantIdentifier.Create(identifier);

        // Assert
        tenantIdentifier.Value.Should().Be(identifier);
    }

    [Fact]
    public void Create_WithAlphaOnly_ShouldSucceed()
    {
        // Arrange
        var identifier = "tenant";

        // Act
        var tenantIdentifier = TenantIdentifier.Create(identifier);

        // Assert
        tenantIdentifier.Value.Should().Be(identifier);
    }

    [Fact]
    public void Create_WithMixedAlphaNumeric_ShouldSucceed()
    {
        // Arrange
        var identifier = "tenant123abc";

        // Act
        var tenantIdentifier = TenantIdentifier.Create(identifier);

        // Assert
        tenantIdentifier.Value.Should().Be(identifier);
    }
}