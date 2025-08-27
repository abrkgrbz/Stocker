using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Domain.Common.ValueObjects;

public sealed class CompanyAddress : ValueObject
{
    public string Country { get; }
    public string City { get; }
    public string District { get; }
    public string? PostalCode { get; }
    public string AddressLine { get; }

    private CompanyAddress(
        string country,
        string city,
        string district,
        string? postalCode,
        string addressLine)
    {
        Country = country;
        City = city;
        District = district;
        PostalCode = postalCode;
        AddressLine = addressLine;
    }

    public static Result<CompanyAddress> Create(
        string country,
        string city,
        string district,
        string? postalCode,
        string addressLine)
    {
        if (string.IsNullOrWhiteSpace(country))
        {
            return Result<CompanyAddress>.Failure(
                Error.Validation("Address.InvalidCountry", "Ülke bilgisi boş olamaz"));
        }

        if (string.IsNullOrWhiteSpace(city))
        {
            return Result<CompanyAddress>.Failure(
                Error.Validation("Address.InvalidCity", "Şehir bilgisi boş olamaz"));
        }

        if (string.IsNullOrWhiteSpace(district))
        {
            return Result<CompanyAddress>.Failure(
                Error.Validation("Address.InvalidDistrict", "İlçe bilgisi boş olamaz"));
        }

        if (string.IsNullOrWhiteSpace(addressLine))
        {
            return Result<CompanyAddress>.Failure(
                Error.Validation("Address.InvalidAddressLine", "Adres bilgisi boş olamaz"));
        }

        return Result<CompanyAddress>.Success(
            new CompanyAddress(country, city, district, postalCode, addressLine));
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Country;
        yield return City;
        yield return District;
        yield return PostalCode ?? string.Empty;
        yield return AddressLine;
    }

    public override string ToString()
    {
        var parts = new List<string> { AddressLine, District, City };
        
        if (!string.IsNullOrWhiteSpace(PostalCode))
            parts.Add(PostalCode);
            
        parts.Add(Country);
        
        return string.Join(", ", parts);
    }
}