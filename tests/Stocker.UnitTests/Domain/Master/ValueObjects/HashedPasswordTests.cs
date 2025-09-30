using FluentAssertions;
using Stocker.Domain.Master.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.Master.ValueObjects;

public class HashedPasswordTests
{
    [Fact]
    public void Create_WithValidPassword_ShouldCreateHashedPassword()
    {
        // Arrange
        var plainPassword = "MySecurePassword123!";

        // Act
        var hashedPassword = HashedPassword.Create(plainPassword);

        // Assert
        hashedPassword.Should().NotBeNull();
        hashedPassword.Hash.Should().NotBeNullOrWhiteSpace();
        hashedPassword.Salt.Should().NotBeNullOrWhiteSpace();
        hashedPassword.Hash.Should().NotBe(plainPassword);
    }

    [Fact]
    public void Create_WithSamePassword_ShouldCreateDifferentHashes()
    {
        // Arrange
        var plainPassword = "SamePassword123!";

        // Act
        var hashedPassword1 = HashedPassword.Create(plainPassword);
        var hashedPassword2 = HashedPassword.Create(plainPassword);

        // Assert
        hashedPassword1.Hash.Should().NotBe(hashedPassword2.Hash);
        hashedPassword1.Salt.Should().NotBe(hashedPassword2.Salt); // Different salts
    }

    [Fact]
    public void Create_WithNullPassword_ShouldThrowArgumentException()
    {
        // Act
        var action = () => HashedPassword.Create(null);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Password cannot be empty.*")
            .WithParameterName("plainPassword");
    }

    [Fact]
    public void Create_WithEmptyPassword_ShouldThrowArgumentException()
    {
        // Act
        var action = () => HashedPassword.Create("");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Password cannot be empty.*")
            .WithParameterName("plainPassword");
    }

    [Fact]
    public void Create_WithWhitespacePassword_ShouldThrowArgumentException()
    {
        // Act
        var action = () => HashedPassword.Create("   ");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Password cannot be empty.*")
            .WithParameterName("plainPassword");
    }

    [Theory]
    [InlineData("short")]
    [InlineData("1234567")]
    [InlineData("seven77")]
    public void Create_WithShortPassword_ShouldThrowArgumentException(string password)
    {
        // Act
        var action = () => HashedPassword.Create(password);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Password must be at least 8 characters long.*")
            .WithParameterName("plainPassword");
    }

    [Theory]
    [InlineData("12345678")]
    [InlineData("password")]
    [InlineData("MySecurePassword123!")]
    [InlineData("Very$ecure&Long*Password#2024")]
    public void Create_WithValidPasswords_ShouldSucceed(string password)
    {
        // Act
        var hashedPassword = HashedPassword.Create(password);

        // Assert
        hashedPassword.Should().NotBeNull();
        hashedPassword.Hash.Should().NotBeNullOrWhiteSpace();
        hashedPassword.Salt.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void Verify_WithCorrectPassword_ShouldReturnTrue()
    {
        // Arrange
        var plainPassword = "CorrectPassword123!";
        var hashedPassword = HashedPassword.Create(plainPassword);

        // Act
        var result = hashedPassword.Verify(plainPassword);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Verify_WithIncorrectPassword_ShouldReturnFalse()
    {
        // Arrange
        var plainPassword = "CorrectPassword123!";
        var hashedPassword = HashedPassword.Create(plainPassword);

        // Act
        var result = hashedPassword.Verify("WrongPassword123!");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Verify_WithNullPassword_ShouldReturnFalse()
    {
        // Arrange
        var hashedPassword = HashedPassword.Create("ValidPassword123!");

        // Act
        var result = hashedPassword.Verify(null);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Verify_WithEmptyPassword_ShouldReturnFalse()
    {
        // Arrange
        var hashedPassword = HashedPassword.Create("ValidPassword123!");

        // Act
        var result = hashedPassword.Verify("");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void FromHash_WithValidHashAndSalt_ShouldCreateHashedPassword()
    {
        // Arrange
        var hash = Convert.ToBase64String(new byte[32]); // 256 bits
        var salt = Convert.ToBase64String(new byte[16]); // 128 bits

        // Act
        var hashedPassword = HashedPassword.FromHash(hash, salt);

        // Assert
        hashedPassword.Should().NotBeNull();
        hashedPassword.Hash.Should().Be(hash);
        hashedPassword.Salt.Should().Be(salt);
    }

    [Fact]
    public void FromHash_WithNullHash_ShouldThrowArgumentException()
    {
        // Arrange
        var salt = Convert.ToBase64String(new byte[16]);

        // Act
        var action = () => HashedPassword.FromHash(null, salt);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Hash cannot be empty.*")
            .WithParameterName("hash");
    }

    [Fact]
    public void FromHash_WithNullSalt_ShouldThrowArgumentException()
    {
        // Arrange
        var hash = Convert.ToBase64String(new byte[32]);

        // Act
        var action = () => HashedPassword.FromHash(hash, null);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Salt cannot be empty.*")
            .WithParameterName("salt");
    }

    [Fact]
    public void Value_ShouldReturnCombinedHashAndSalt()
    {
        // Arrange
        var hashedPassword = HashedPassword.Create("TestPassword123!");

        // Act
        var value = hashedPassword.Value;

        // Assert
        value.Should().NotBeNullOrWhiteSpace();
        // The combined value should be valid Base64
        var action = () => Convert.FromBase64String(value);
        action.Should().NotThrow();
        
        // The decoded bytes should have the expected length (salt + hash)
        var bytes = Convert.FromBase64String(value);
        bytes.Length.Should().Be(16 + 32); // SaltSize + KeySize
    }

    [Fact]
    public void CreateFromHash_WithCombinedFormat_ShouldCreateHashedPassword()
    {
        // Arrange
        var originalPassword = "TestPassword123!";
        var original = HashedPassword.Create(originalPassword);
        var combinedHash = original.Value;

        // Act
        var restored = HashedPassword.CreateFromHash(combinedHash);

        // Assert
        restored.Should().NotBeNull();
        restored.Hash.Should().Be(original.Hash);
        restored.Salt.Should().Be(original.Salt);
        restored.Verify(originalPassword).Should().BeTrue();
    }

    [Fact]
    public void CreateFromHash_WithColonFormat_ShouldCreateHashedPassword()
    {
        // Arrange
        var hash = Convert.ToBase64String(new byte[32]);
        var salt = Convert.ToBase64String(new byte[16]);
        var colonFormat = $"{hash}:{salt}";

        // Act
        var hashedPassword = HashedPassword.CreateFromHash(colonFormat);

        // Assert
        hashedPassword.Should().NotBeNull();
        hashedPassword.Hash.Should().Be(hash);
        hashedPassword.Salt.Should().Be(salt);
    }

    [Fact]
    public void CreateFromHash_WithInvalidBase64_ShouldHandleGracefully()
    {
        // Arrange
        var invalidBase64 = "not-valid-base64!@#$";

        // Act
        var hashedPassword = HashedPassword.CreateFromHash(invalidBase64);

        // Assert
        hashedPassword.Should().NotBeNull(); // Falls back to treating as hash with empty salt
        hashedPassword.Hash.Should().Be(invalidBase64);
    }

    [Fact]
    public void CreateFromHash_WithNull_ShouldThrowArgumentException()
    {
        // Act
        var action = () => HashedPassword.CreateFromHash(null);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Hashed password cannot be empty.*")
            .WithParameterName("hashedPassword");
    }

    [Fact]
    public void CreateFromHash_WithEmpty_ShouldThrowArgumentException()
    {
        // Act
        var action = () => HashedPassword.CreateFromHash("");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Hashed password cannot be empty.*")
            .WithParameterName("hashedPassword");
    }

    [Fact]
    public void GetEqualityComponents_ShouldReturnHashAndSalt()
    {
        // Arrange
        var hashedPassword = HashedPassword.Create("TestPassword123!");

        // Act
        var components = hashedPassword.GetEqualityComponents().ToList();

        // Assert
        components.Should().HaveCount(2);
        components[0].Should().Be(hashedPassword.Hash);
        components[1].Should().Be(hashedPassword.Salt);
    }

    [Fact]
    public void Equals_WithSameHashAndSalt_ShouldReturnTrue()
    {
        // Arrange
        var hash = Convert.ToBase64String(new byte[32]);
        var salt = Convert.ToBase64String(new byte[16]);
        var password1 = HashedPassword.FromHash(hash, salt);
        var password2 = HashedPassword.FromHash(hash, salt);

        // Act & Assert
        password1.Should().Be(password2);
        password1.GetHashCode().Should().Be(password2.GetHashCode());
    }

    [Fact]
    public void Equals_WithDifferentHash_ShouldReturnFalse()
    {
        // Arrange
        var salt = Convert.ToBase64String(new byte[16]);
        var password1 = HashedPassword.FromHash(Convert.ToBase64String(new byte[32]), salt);
        var password2 = HashedPassword.FromHash(Convert.ToBase64String(new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32 }), salt);

        // Act & Assert
        password1.Should().NotBe(password2);
    }

    [Fact]
    public void Verify_WithInvalidBase64Salt_ShouldReturnFalse()
    {
        // Arrange
        var hashedPassword = HashedPassword.Create("ValidPassword123!");
        // Corrupt the salt
        var corruptedSaltProperty = typeof(HashedPassword).GetProperty("Salt");
        corruptedSaltProperty.SetValue(hashedPassword, "invalid-base64!@#");

        // Act
        var result = hashedPassword.Verify("ValidPassword123!");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Verify_WithInvalidBase64Hash_ShouldReturnFalse()
    {
        // Arrange
        var hashedPassword = HashedPassword.Create("ValidPassword123!");
        // Corrupt the hash
        var corruptedHashProperty = typeof(HashedPassword).GetProperty("Hash");
        corruptedHashProperty.SetValue(hashedPassword, "invalid-base64!@#");

        // Act
        var result = hashedPassword.Verify("ValidPassword123!");

        // Assert
        result.Should().BeFalse();
    }

    [Theory]
    [InlineData("Password123!", "Password123!")]
    [InlineData("AnotherPass@2024", "AnotherPass@2024")]
    [InlineData("SuperSecure$123", "SuperSecure$123")]
    public void Verify_MultipleTimes_ShouldAlwaysReturnTrue(string password, string verifyPassword)
    {
        // Arrange
        var hashedPassword = HashedPassword.Create(password);

        // Act & Assert
        for (int i = 0; i < 5; i++)
        {
            hashedPassword.Verify(verifyPassword).Should().BeTrue($"Verification {i + 1} failed");
        }
    }

    [Fact]
    public void Create_WithVeryLongPassword_ShouldSucceed()
    {
        // Arrange
        var longPassword = new string('a', 1000) + "ValidEnding123!";

        // Act
        var hashedPassword = HashedPassword.Create(longPassword);

        // Assert
        hashedPassword.Should().NotBeNull();
        hashedPassword.Verify(longPassword).Should().BeTrue();
    }
}