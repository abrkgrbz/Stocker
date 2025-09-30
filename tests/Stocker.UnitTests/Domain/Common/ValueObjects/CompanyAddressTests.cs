using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.Common.ValueObjects;

public class CompanyAddressTests
{
    [Fact]
    public void Create_WithValidData_ShouldReturnSuccess()
    {
        // Arrange
        var country = "Türkiye";
        var city = "İstanbul";
        var district = "Kadıköy";
        var postalCode = "34710";
        var addressLine = "Moda Caddesi No: 123";

        // Act
        var result = CompanyAddress.Create(country, city, district, postalCode, addressLine);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Country.Should().Be(country);
        result.Value.City.Should().Be(city);
        result.Value.District.Should().Be(district);
        result.Value.PostalCode.Should().Be(postalCode);
        result.Value.AddressLine.Should().Be(addressLine);
    }

    [Fact]
    public void Create_WithoutPostalCode_ShouldReturnSuccess()
    {
        // Arrange
        var country = "Türkiye";
        var city = "İstanbul";
        var district = "Beşiktaş";
        var addressLine = "Barbaros Bulvarı No: 45";

        // Act
        var result = CompanyAddress.Create(country, city, district, null, addressLine);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.PostalCode.Should().BeNull();
    }

    [Fact]
    public void Create_WithEmptyCountry_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create("", "İstanbul", "Kadıköy", "34710", "Test Address");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidCountry");
        result.Error.Description.Should().Be("Ülke bilgisi boş olamaz");
    }

    [Fact]
    public void Create_WithNullCountry_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create(null, "İstanbul", "Kadıköy", "34710", "Test Address");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidCountry");
    }

    [Fact]
    public void Create_WithWhitespaceCountry_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create("   ", "İstanbul", "Kadıköy", "34710", "Test Address");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidCountry");
    }

    [Fact]
    public void Create_WithEmptyCity_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create("Türkiye", "", "Kadıköy", "34710", "Test Address");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidCity");
        result.Error.Description.Should().Be("Şehir bilgisi boş olamaz");
    }

    [Fact]
    public void Create_WithNullCity_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create("Türkiye", null, "Kadıköy", "34710", "Test Address");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidCity");
    }

    [Fact]
    public void Create_WithEmptyDistrict_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create("Türkiye", "İstanbul", "", "34710", "Test Address");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidDistrict");
        result.Error.Description.Should().Be("İlçe bilgisi boş olamaz");
    }

    [Fact]
    public void Create_WithNullDistrict_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create("Türkiye", "İstanbul", null, "34710", "Test Address");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidDistrict");
    }

    [Fact]
    public void Create_WithEmptyAddressLine_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidAddressLine");
        result.Error.Description.Should().Be("Adres bilgisi boş olamaz");
    }

    [Fact]
    public void Create_WithNullAddressLine_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", null);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidAddressLine");
    }

    [Fact]
    public void Create_WithWhitespaceAddressLine_ShouldReturnFailure()
    {
        // Act
        var result = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "   ");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Address.InvalidAddressLine");
    }

    [Fact]
    public void ToString_WithPostalCode_ShouldFormatCorrectly()
    {
        // Arrange
        var address = CompanyAddress.Create(
            "Türkiye",
            "İstanbul",
            "Kadıköy",
            "34710",
            "Moda Caddesi No: 123").Value;

        // Act
        var result = address.ToString();

        // Assert
        result.Should().Be("Moda Caddesi No: 123, Kadıköy, İstanbul, 34710, Türkiye");
    }

    [Fact]
    public void ToString_WithoutPostalCode_ShouldFormatCorrectly()
    {
        // Arrange
        var address = CompanyAddress.Create(
            "Türkiye",
            "İstanbul",
            "Beşiktaş",
            null,
            "Barbaros Bulvarı No: 45").Value;

        // Act
        var result = address.ToString();

        // Assert
        result.Should().Be("Barbaros Bulvarı No: 45, Beşiktaş, İstanbul, Türkiye");
    }

    [Fact]
    public void ToString_WithEmptyPostalCode_ShouldFormatCorrectly()
    {
        // Arrange
        var address = CompanyAddress.Create(
            "Türkiye",
            "İstanbul",
            "Şişli",
            "",
            "Mecidiyeköy Yolu No: 12").Value;

        // Act
        var result = address.ToString();

        // Assert
        result.Should().Be("Mecidiyeköy Yolu No: 12, Şişli, İstanbul, Türkiye");
    }

    [Fact]
    public void GetEqualityComponents_ShouldReturnAllComponents()
    {
        // Arrange
        var address = CompanyAddress.Create(
            "Türkiye",
            "İstanbul",
            "Kadıköy",
            "34710",
            "Test Address").Value;

        // Act
        var components = address.GetEqualityComponents().ToList();

        // Assert
        components.Should().HaveCount(5);
        components[0].Should().Be("Türkiye");
        components[1].Should().Be("İstanbul");
        components[2].Should().Be("Kadıköy");
        components[3].Should().Be("34710");
        components[4].Should().Be("Test Address");
    }

    [Fact]
    public void GetEqualityComponents_WithNullPostalCode_ShouldReturnEmptyString()
    {
        // Arrange
        var address = CompanyAddress.Create(
            "Türkiye",
            "İstanbul",
            "Kadıköy",
            null,
            "Test Address").Value;

        // Act
        var components = address.GetEqualityComponents().ToList();

        // Assert
        components.Should().HaveCount(5);
        components[3].Should().Be(string.Empty);
    }

    [Fact]
    public void Equals_WithSameValues_ShouldReturnTrue()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;
        var address2 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;

        // Act
        var areEqual = address1.Equals(address2);

        // Assert
        areEqual.Should().BeTrue();
    }

    [Fact]
    public void Equals_WithDifferentCountry_ShouldReturnFalse()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;
        var address2 = CompanyAddress.Create("Germany", "İstanbul", "Kadıköy", "34710", "Test").Value;

        // Act
        var areEqual = address1.Equals(address2);

        // Assert
        areEqual.Should().BeFalse();
    }

    [Fact]
    public void Equals_WithDifferentCity_ShouldReturnFalse()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;
        var address2 = CompanyAddress.Create("Türkiye", "Ankara", "Kadıköy", "34710", "Test").Value;

        // Act
        var areEqual = address1.Equals(address2);

        // Assert
        areEqual.Should().BeFalse();
    }

    [Fact]
    public void Equals_WithDifferentDistrict_ShouldReturnFalse()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;
        var address2 = CompanyAddress.Create("Türkiye", "İstanbul", "Beşiktaş", "34710", "Test").Value;

        // Act
        var areEqual = address1.Equals(address2);

        // Assert
        areEqual.Should().BeFalse();
    }

    [Fact]
    public void Equals_WithDifferentPostalCode_ShouldReturnFalse()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;
        var address2 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34720", "Test").Value;

        // Act
        var areEqual = address1.Equals(address2);

        // Assert
        areEqual.Should().BeFalse();
    }

    [Fact]
    public void Equals_WithDifferentAddressLine_ShouldReturnFalse()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test 1").Value;
        var address2 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test 2").Value;

        // Act
        var areEqual = address1.Equals(address2);

        // Assert
        areEqual.Should().BeFalse();
    }

    [Fact]
    public void Equals_WithBothNullPostalCode_ShouldReturnTrue()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", null, "Test").Value;
        var address2 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", null, "Test").Value;

        // Act
        var areEqual = address1.Equals(address2);

        // Assert
        areEqual.Should().BeTrue();
    }

    [Fact]
    public void GetHashCode_WithSameValues_ShouldReturnSameHash()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;
        var address2 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;

        // Act
        var hash1 = address1.GetHashCode();
        var hash2 = address2.GetHashCode();

        // Assert
        hash1.Should().Be(hash2);
    }

    [Fact]
    public void GetHashCode_WithDifferentValues_ShouldReturnDifferentHash()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test 1").Value;
        var address2 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test 2").Value;

        // Act
        var hash1 = address1.GetHashCode();
        var hash2 = address2.GetHashCode();

        // Assert
        hash1.Should().NotBe(hash2);
    }

    [Fact]
    public void OperatorEquals_WithSameValues_ShouldReturnTrue()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;
        var address2 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test").Value;

        // Act & Assert
        (address1 == address2).Should().BeTrue();
    }

    [Fact]
    public void OperatorNotEquals_WithDifferentValues_ShouldReturnTrue()
    {
        // Arrange
        var address1 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test 1").Value;
        var address2 = CompanyAddress.Create("Türkiye", "İstanbul", "Kadıköy", "34710", "Test 2").Value;

        // Act & Assert
        (address1 != address2).Should().BeTrue();
    }

    [Fact]
    public void Create_WithInternationalAddress_ShouldReturnSuccess()
    {
        // Arrange
        var country = "United States";
        var city = "New York";
        var district = "Manhattan";
        var postalCode = "10001";
        var addressLine = "350 Fifth Avenue";

        // Act
        var result = CompanyAddress.Create(country, city, district, postalCode, addressLine);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Country.Should().Be(country);
        result.Value.City.Should().Be(city);
        result.Value.District.Should().Be(district);
        result.Value.PostalCode.Should().Be(postalCode);
        result.Value.AddressLine.Should().Be(addressLine);
    }

    [Fact]
    public void Create_WithLongAddress_ShouldReturnSuccess()
    {
        // Arrange
        var country = "Türkiye";
        var city = "İstanbul";
        var district = "Ataşehir";
        var postalCode = "34746";
        var addressLine = "Ataşehir Bulvarı, Metropol İstanbul Sitesi, C Blok, Kat: 25, Daire: 150, Batı Ataşehir";

        // Act
        var result = CompanyAddress.Create(country, city, district, postalCode, addressLine);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.AddressLine.Should().Be(addressLine);
    }
}