using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities.GeoLocation;

/// <summary>
/// Şehir/İl entity'si - Türkiye için 81 il
/// City/Province entity - 81 provinces for Turkey
/// </summary>
public sealed class City : Entity
{
    private readonly List<District> _districts = new();

    /// <summary>
    /// Ülke ID / Country ID
    /// </summary>
    public Guid CountryId { get; private set; }

    /// <summary>
    /// Şehir adı / City name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Plaka kodu (01-81) / License plate code
    /// </summary>
    public string PlateCode { get; private set; } = string.Empty;

    /// <summary>
    /// Telefon alan kodu (212, 312 vb.) / Area code
    /// </summary>
    public string? AreaCode { get; private set; }

    /// <summary>
    /// Bölge (Marmara, Ege vb.) / Region
    /// </summary>
    public string? Region { get; private set; }

    /// <summary>
    /// Enlem / Latitude
    /// </summary>
    public decimal? Latitude { get; private set; }

    /// <summary>
    /// Boylam / Longitude
    /// </summary>
    public decimal? Longitude { get; private set; }

    /// <summary>
    /// Nüfus / Population
    /// </summary>
    public int? Population { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Sıralama (plaka koduna göre) / Display order
    /// </summary>
    public int DisplayOrder { get; private set; }

    /// <summary>
    /// Ülke / Country
    /// </summary>
    public Country Country { get; private set; } = null!;

    /// <summary>
    /// İlçeler / Districts
    /// </summary>
    public IReadOnlyList<District> Districts => _districts.AsReadOnly();

    private City() { } // EF Constructor

    private City(
        Guid id,
        Guid countryId,
        string name,
        string plateCode,
        string? areaCode,
        string? region,
        int displayOrder = 0) : base(id)
    {
        CountryId = countryId;
        Name = name;
        PlateCode = plateCode;
        AreaCode = areaCode;
        Region = region;
        DisplayOrder = displayOrder;
        IsActive = true;
    }

    public static City Create(
        Guid countryId,
        string name,
        string plateCode,
        string? areaCode = null,
        string? region = null,
        int displayOrder = 0)
    {
        return new City(
            Guid.NewGuid(),
            countryId,
            name,
            plateCode,
            areaCode,
            region,
            displayOrder);
    }

    public static City CreateWithId(
        Guid id,
        Guid countryId,
        string name,
        string plateCode,
        string? areaCode = null,
        string? region = null,
        int displayOrder = 0)
    {
        return new City(id, countryId, name, plateCode, areaCode, region, displayOrder);
    }

    public void Update(string name, string? areaCode, string? region)
    {
        Name = name;
        AreaCode = areaCode;
        Region = region;
    }

    public void SetCoordinates(decimal latitude, decimal longitude)
    {
        Latitude = latitude;
        Longitude = longitude;
    }

    public void SetPopulation(int population) => Population = population;
    public void SetDisplayOrder(int order) => DisplayOrder = order;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void AddDistrict(District district)
    {
        if (!_districts.Any(d => d.Id == district.Id))
        {
            _districts.Add(district);
        }
    }
}
