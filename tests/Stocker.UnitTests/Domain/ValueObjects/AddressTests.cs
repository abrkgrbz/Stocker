using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.ValueObjects;

public class AddressTests
{
    [Fact]
    public void Create_WithRequiredFields_ShouldCreateAddress()
    {
        // Arrange
        var street = "123 Main Street";
        var city = "Istanbul";
        var country = "Turkey";

        // Act
        var address = Address.Create(street, city, country);

        // Assert
        address.Should().NotBeNull();
        address.Street.Should().Be(street);
        address.City.Should().Be(city);
        address.Country.Should().Be(country);
        address.PostalCode.Should().BeNull();
        address.State.Should().BeNull();
        address.Building.Should().BeNull();
        address.Floor.Should().BeNull();
        address.Apartment.Should().BeNull();
    }

    [Fact]
    public void Create_WithAllFields_ShouldCreateCompleteAddress()
    {
        // Arrange
        var street = "123 Main Street";
        var city = "Istanbul";
        var country = "Turkey";
        var postalCode = "34000";
        var building = "A Block";
        var floor = "5";
        var apartment = "12";
        var state = "Istanbul";

        // Act
        var address = Address.Create(street, city, country, postalCode, building, floor, apartment, state);

        // Assert
        address.Should().NotBeNull();
        address.Street.Should().Be(street);
        address.City.Should().Be(city);
        address.Country.Should().Be(country);
        address.PostalCode.Should().Be(postalCode);
        address.Building.Should().Be(building);
        address.Floor.Should().Be(floor);
        address.Apartment.Should().Be(apartment);
        address.State.Should().Be(state);
    }

    [Fact]
    public void Create_WithEmptyStreet_ShouldThrowArgumentException()
    {
        // Act & Assert
        var action = () => Address.Create("", "Istanbul", "Turkey");
        action.Should().Throw<ArgumentException>()
            .WithMessage("Street cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyCity_ShouldThrowArgumentException()
    {
        // Act & Assert
        var action = () => Address.Create("123 Main St", "", "Turkey");
        action.Should().Throw<ArgumentException>()
            .WithMessage("City cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyCountry_ShouldThrowArgumentException()
    {
        // Act & Assert
        var action = () => Address.Create("123 Main St", "Istanbul", "");
        action.Should().Throw<ArgumentException>()
            .WithMessage("Country cannot be empty.*");
    }

    [Fact]
    public void ToString_WithBasicAddress_ShouldFormatCorrectly()
    {
        // Arrange
        var address = Address.Create("123 Main Street", "Istanbul", "Turkey", "34000");

        // Act
        var result = address.ToString();

        // Assert
        result.Should().Contain("123 Main Street");
        result.Should().Contain("Istanbul");
        result.Should().Contain("Turkey");
        result.Should().Contain("34000");
    }

    [Fact]
    public void ToString_WithFullAddress_ShouldFormatWithAllComponents()
    {
        // Arrange
        var address = Address.Create(
            "123 Main Street", 
            "Istanbul", 
            "Turkey", 
            "34000",
            "A Block",
            "5",
            "12",
            "Istanbul"
        );

        // Act
        var result = address.ToString();

        // Assert
        result.Should().Contain("123 Main Street");
        result.Should().Contain("Building: A Block");
        result.Should().Contain("Floor: 5");
        result.Should().Contain("Apt: 12");
        result.Should().Contain("Istanbul");
        result.Should().Contain("34000");
        result.Should().Contain("Turkey");
    }

    [Fact]
    public void Addresses_WithSameValues_ShouldBeEqual()
    {
        // Arrange
        var address1 = Address.Create("123 Main St", "Istanbul", "Turkey", "34000");
        var address2 = Address.Create("123 Main St", "Istanbul", "Turkey", "34000");

        // Assert
        address1.Should().Be(address2);
    }

    [Fact]
    public void Addresses_WithDifferentValues_ShouldNotBeEqual()
    {
        // Arrange
        var address1 = Address.Create("123 Main St", "Istanbul", "Turkey");
        var address2 = Address.Create("456 Other St", "Istanbul", "Turkey");

        // Assert
        address1.Should().NotBe(address2);
    }

    [Fact]
    public void Addresses_WithDifferentOptionalFields_ShouldNotBeEqual()
    {
        // Arrange
        var address1 = Address.Create("123 Main St", "Istanbul", "Turkey", "34000");
        var address2 = Address.Create("123 Main St", "Istanbul", "Turkey", "34001");

        // Assert
        address1.Should().NotBe(address2);
    }

    [Fact]
    public void Addresses_WithNullOptionalFields_ShouldBeEqualIfOtherFieldsMatch()
    {
        // Arrange
        var address1 = Address.Create("123 Main St", "Istanbul", "Turkey");
        var address2 = Address.Create("123 Main St", "Istanbul", "Turkey", null);

        // Assert
        address1.Should().Be(address2);
    }
}