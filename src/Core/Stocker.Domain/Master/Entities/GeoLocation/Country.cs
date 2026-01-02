using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities.GeoLocation;

/// <summary>
/// Ülke entity'si - Coğrafi hiyerarşinin en üst seviyesi
/// Country entity - Top level of geographic hierarchy
/// </summary>
public sealed class Country : Entity
{
    private readonly List<City> _cities = new();

    /// <summary>
    /// Ülke adı (Türkçe) / Country name (Turkish)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Ülke adı (İngilizce) / Country name (English)
    /// </summary>
    public string NameEn { get; private set; } = string.Empty;

    /// <summary>
    /// ISO 3166-1 alpha-2 kodu (TR, US, DE vb.) / ISO country code
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// ISO 3166-1 alpha-3 kodu (TUR, USA, DEU vb.)
    /// </summary>
    public string Code3 { get; private set; } = string.Empty;

    /// <summary>
    /// Telefon kodu (+90, +1 vb.) / Phone code
    /// </summary>
    public string PhoneCode { get; private set; } = string.Empty;

    /// <summary>
    /// Para birimi kodu (TRY, USD vb.) / Currency code
    /// </summary>
    public string CurrencyCode { get; private set; } = "TRY";

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Sıralama / Display order
    /// </summary>
    public int DisplayOrder { get; private set; }

    /// <summary>
    /// Şehirler / Cities
    /// </summary>
    public IReadOnlyList<City> Cities => _cities.AsReadOnly();

    private Country() { } // EF Constructor

    private Country(
        Guid id,
        string name,
        string nameEn,
        string code,
        string code3,
        string phoneCode,
        string currencyCode,
        int displayOrder = 0) : base(id)
    {
        Name = name;
        NameEn = nameEn;
        Code = code;
        Code3 = code3;
        PhoneCode = phoneCode;
        CurrencyCode = currencyCode;
        DisplayOrder = displayOrder;
        IsActive = true;
    }

    public static Country Create(
        string name,
        string nameEn,
        string code,
        string code3,
        string phoneCode,
        string currencyCode = "TRY",
        int displayOrder = 0)
    {
        return new Country(
            Guid.NewGuid(),
            name,
            nameEn,
            code,
            code3,
            phoneCode,
            currencyCode,
            displayOrder);
    }

    public static Country CreateWithId(
        Guid id,
        string name,
        string nameEn,
        string code,
        string code3,
        string phoneCode,
        string currencyCode = "TRY",
        int displayOrder = 0)
    {
        return new Country(id, name, nameEn, code, code3, phoneCode, currencyCode, displayOrder);
    }

    public void Update(string name, string nameEn, string phoneCode, string currencyCode)
    {
        Name = name;
        NameEn = nameEn;
        PhoneCode = phoneCode;
        CurrencyCode = currencyCode;
    }

    public void SetDisplayOrder(int order) => DisplayOrder = order;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void AddCity(City city)
    {
        if (!_cities.Any(c => c.Id == city.Id))
        {
            _cities.Add(city);
        }
    }
}
