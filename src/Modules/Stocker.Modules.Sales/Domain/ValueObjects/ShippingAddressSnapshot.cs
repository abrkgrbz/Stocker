using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.ValueObjects;

/// <summary>
/// Sipariş anında müşteri adresinin kopyasını saklayan Value Object.
/// Müşteri adresi değişse bile sipariş adresi değişmez.
/// 
/// Shipping Address Snapshot - Immutable copy of customer address at order time.
/// Even if customer address changes later, order address remains unchanged.
/// </summary>
public sealed class ShippingAddressSnapshot : ValueObject
{
    /// <summary>Alıcı adı / Recipient name</summary>
    public string RecipientName { get; private set; } = string.Empty;
    
    /// <summary>Alıcı telefonu / Recipient phone</summary>
    public string? RecipientPhone { get; private set; }
    
    /// <summary>Şirket adı (B2B için) / Company name (for B2B)</summary>
    public string? CompanyName { get; private set; }
    
    /// <summary>Adres satırı 1 / Address line 1</summary>
    public string AddressLine1 { get; private set; } = string.Empty;
    
    /// <summary>Adres satırı 2 (apartman, daire vb.) / Address line 2</summary>
    public string? AddressLine2 { get; private set; }
    
    /// <summary>Mahalle / District</summary>
    public string? District { get; private set; }
    
    /// <summary>İlçe / Town</summary>
    public string? Town { get; private set; }
    
    /// <summary>İl/Şehir / City</summary>
    public string City { get; private set; } = string.Empty;
    
    /// <summary>Eyalet/Bölge / State/Region</summary>
    public string? State { get; private set; }
    
    /// <summary>Ülke / Country</summary>
    public string Country { get; private set; } = "Türkiye";
    
    /// <summary>Posta kodu / Postal code</summary>
    public string? PostalCode { get; private set; }
    
    /// <summary>Vergi kimlik numarası (B2B için) / Tax ID (for B2B)</summary>
    public string? TaxId { get; private set; }
    
    /// <summary>Vergi dairesi (B2B için) / Tax office (for B2B)</summary>
    public string? TaxOffice { get; private set; }

    // EF Core için parametresiz constructor
    private ShippingAddressSnapshot() { }

    private ShippingAddressSnapshot(
        string recipientName,
        string? recipientPhone,
        string? companyName,
        string addressLine1,
        string? addressLine2,
        string? district,
        string? town,
        string city,
        string? state,
        string country,
        string? postalCode,
        string? taxId,
        string? taxOffice)
    {
        RecipientName = recipientName;
        RecipientPhone = recipientPhone;
        CompanyName = companyName;
        AddressLine1 = addressLine1;
        AddressLine2 = addressLine2;
        District = district;
        Town = town;
        City = city;
        State = state;
        Country = country;
        PostalCode = postalCode;
        TaxId = taxId;
        TaxOffice = taxOffice;
    }

    /// <summary>
    /// Yeni bir ShippingAddressSnapshot oluşturur / Creates a new shipping address snapshot
    /// </summary>
    public static ShippingAddressSnapshot Create(
        string recipientName,
        string addressLine1,
        string city,
        string country = "Türkiye",
        string? recipientPhone = null,
        string? companyName = null,
        string? addressLine2 = null,
        string? district = null,
        string? town = null,
        string? state = null,
        string? postalCode = null,
        string? taxId = null,
        string? taxOffice = null)
    {
        if (string.IsNullOrWhiteSpace(recipientName))
            throw new ArgumentException("Alıcı adı gereklidir.", nameof(recipientName));

        if (string.IsNullOrWhiteSpace(addressLine1))
            throw new ArgumentException("Adres satırı gereklidir.", nameof(addressLine1));

        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("Şehir gereklidir.", nameof(city));

        return new ShippingAddressSnapshot(
            recipientName,
            recipientPhone,
            companyName,
            addressLine1,
            addressLine2,
            district,
            town,
            city,
            state,
            country,
            postalCode,
            taxId,
            taxOffice);
    }

    /// <summary>
    /// Basit adres oluşturur (B2C için) / Creates simple address (for B2C)
    /// </summary>
    public static ShippingAddressSnapshot CreateSimple(
        string recipientName,
        string addressLine1,
        string city,
        string? phone = null)
    {
        return Create(
            recipientName: recipientName,
            addressLine1: addressLine1,
            city: city,
            recipientPhone: phone);
    }

    /// <summary>
    /// Kurumsal adres oluşturur (B2B için) / Creates corporate address (for B2B)
    /// </summary>
    public static ShippingAddressSnapshot CreateCorporate(
        string companyName,
        string contactName,
        string addressLine1,
        string city,
        string taxId,
        string taxOffice,
        string? phone = null,
        string? postalCode = null)
    {
        return Create(
            recipientName: contactName,
            addressLine1: addressLine1,
            city: city,
            recipientPhone: phone,
            companyName: companyName,
            postalCode: postalCode,
            taxId: taxId,
            taxOffice: taxOffice);
    }

    /// <summary>
    /// String'den adres oluşturur (legacy destek) / Creates from string (legacy support)
    /// </summary>
    public static ShippingAddressSnapshot? CreateFromString(string? fullAddress, string? recipientName = null)
    {
        if (string.IsNullOrWhiteSpace(fullAddress))
            return null;

        return new ShippingAddressSnapshot(
            recipientName: recipientName ?? "Belirtilmemiş",
            recipientPhone: null,
            companyName: null,
            addressLine1: fullAddress,
            addressLine2: null,
            district: null,
            town: null,
            city: "Belirtilmemiş",
            state: null,
            country: "Türkiye",
            postalCode: null,
            taxId: null,
            taxOffice: null);
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return RecipientName;
        yield return RecipientPhone ?? string.Empty;
        yield return CompanyName ?? string.Empty;
        yield return AddressLine1;
        yield return AddressLine2 ?? string.Empty;
        yield return District ?? string.Empty;
        yield return Town ?? string.Empty;
        yield return City;
        yield return State ?? string.Empty;
        yield return Country;
        yield return PostalCode ?? string.Empty;
        yield return TaxId ?? string.Empty;
        yield return TaxOffice ?? string.Empty;
    }

    /// <summary>
    /// Tam adres metnini döndürür / Returns full address text
    /// </summary>
    public override string ToString()
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(CompanyName))
            parts.Add(CompanyName);
        
        parts.Add(RecipientName);
        
        if (!string.IsNullOrWhiteSpace(RecipientPhone))
            parts.Add($"Tel: {RecipientPhone}");
        
        parts.Add(AddressLine1);
        
        if (!string.IsNullOrWhiteSpace(AddressLine2))
            parts.Add(AddressLine2);
        
        if (!string.IsNullOrWhiteSpace(District))
            parts.Add(District);
        
        if (!string.IsNullOrWhiteSpace(Town))
            parts.Add(Town);
        
        parts.Add(City);
        
        if (!string.IsNullOrWhiteSpace(State))
            parts.Add(State);
        
        if (!string.IsNullOrWhiteSpace(PostalCode))
            parts.Add(PostalCode);
        
        parts.Add(Country);

        return string.Join(", ", parts);
    }

    /// <summary>
    /// Kısa adres metnini döndürür / Returns short address text
    /// </summary>
    public string ToShortString()
    {
        var city = !string.IsNullOrWhiteSpace(Town) ? $"{Town}/{City}" : City;
        return $"{AddressLine1}, {city}";
    }

    /// <summary>
    /// Fatura için adres metnini döndürür / Returns address for invoice
    /// </summary>
    public string ToInvoiceFormat()
    {
        var lines = new List<string>();

        if (!string.IsNullOrWhiteSpace(CompanyName))
            lines.Add(CompanyName);
        else
            lines.Add(RecipientName);

        lines.Add(AddressLine1);

        if (!string.IsNullOrWhiteSpace(AddressLine2))
            lines.Add(AddressLine2);

        var locationParts = new List<string>();
        if (!string.IsNullOrWhiteSpace(District))
            locationParts.Add(District);
        if (!string.IsNullOrWhiteSpace(Town))
            locationParts.Add(Town);
        
        if (locationParts.Any())
            lines.Add(string.Join(" ", locationParts));

        lines.Add($"{City} {PostalCode}".Trim());
        lines.Add(Country);

        if (!string.IsNullOrWhiteSpace(TaxId))
            lines.Add($"VKN: {TaxId}");
        if (!string.IsNullOrWhiteSpace(TaxOffice))
            lines.Add($"Vergi Dairesi: {TaxOffice}");

        return string.Join("\n", lines);
    }
}
