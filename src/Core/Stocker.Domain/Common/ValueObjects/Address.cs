using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Common.ValueObjects;

public sealed class Address : ValueObject
{
    public string Street { get; private set; }
    public string? Building { get; private set; }
    public string? Floor { get; private set; }
    public string? Apartment { get; private set; }
    public string City { get; private set; }
    public string? State { get; private set; }
    public string Country { get; private set; }
    public string? PostalCode { get; private set; }

    // EF Core requires parameterless constructor for owned types
    private Address()
    {
        Street = string.Empty;
        City = string.Empty;
        Country = string.Empty;
    }

    private Address(
        string street,
        string? building,
        string? floor,
        string? apartment,
        string city,
        string? state,
        string country,
        string? postalCode)
    {
        Street = street;
        Building = building;
        Floor = floor;
        Apartment = apartment;
        City = city;
        State = state;
        Country = country;
        PostalCode = postalCode;
    }

    public static Address Create(
        string street, 
        string city, 
        string country, 
        string? postalCode = null,
        string? building = null,
        string? floor = null,
        string? apartment = null,
        string? state = null)
    {
        if (string.IsNullOrWhiteSpace(street))
        {
            throw new ArgumentException("Street cannot be empty.", nameof(street));
        }

        if (string.IsNullOrWhiteSpace(city))
        {
            throw new ArgumentException("City cannot be empty.", nameof(city));
        }

        if (string.IsNullOrWhiteSpace(country))
        {
            throw new ArgumentException("Country cannot be empty.", nameof(country));
        }

        return new Address(street, building, floor, apartment, city, state, country, postalCode);
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return Building ?? string.Empty;
        yield return Floor ?? string.Empty;
        yield return Apartment ?? string.Empty;
        yield return City;
        yield return State ?? string.Empty;
        yield return Country;
        yield return PostalCode ?? string.Empty;
    }

    public override string ToString()
    {
        var parts = new List<string> { Street };
        
        if (!string.IsNullOrWhiteSpace(Building))
            parts.Add($"Building: {Building}");
        
        if (!string.IsNullOrWhiteSpace(Floor))
            parts.Add($"Floor: {Floor}");
            
        if (!string.IsNullOrWhiteSpace(Apartment))
            parts.Add($"Apt: {Apartment}");
            
        parts.Add(City);
        
        if (!string.IsNullOrWhiteSpace(State))
            parts.Add(State);
            
        if (!string.IsNullOrWhiteSpace(PostalCode))
            parts.Add(PostalCode);
            
        parts.Add(Country);
        
        return string.Join(", ", parts);
    }
}