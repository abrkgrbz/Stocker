using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities.GeoLocation;

/// <summary>
/// İlçe entity'si - Şehirlerin alt birimleri
/// District entity - Sub-units of cities
/// </summary>
public sealed class District : Entity
{
    /// <summary>
    /// Şehir ID / City ID
    /// </summary>
    public Guid CityId { get; private set; }

    /// <summary>
    /// İlçe adı / District name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Posta kodu / Postal code
    /// </summary>
    public string? PostalCode { get; private set; }

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
    /// Merkez ilçe mi? / Is central district?
    /// </summary>
    public bool IsCentral { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Sıralama / Display order
    /// </summary>
    public int DisplayOrder { get; private set; }

    /// <summary>
    /// Şehir / City
    /// </summary>
    public City City { get; private set; } = null!;

    private District() { } // EF Constructor

    private District(
        Guid id,
        Guid cityId,
        string name,
        string? postalCode,
        bool isCentral,
        int displayOrder = 0) : base(id)
    {
        CityId = cityId;
        Name = name;
        PostalCode = postalCode;
        IsCentral = isCentral;
        DisplayOrder = displayOrder;
        IsActive = true;
    }

    public static District Create(
        Guid cityId,
        string name,
        string? postalCode = null,
        bool isCentral = false,
        int displayOrder = 0)
    {
        return new District(
            Guid.NewGuid(),
            cityId,
            name,
            postalCode,
            isCentral,
            displayOrder);
    }

    public static District CreateWithId(
        Guid id,
        Guid cityId,
        string name,
        string? postalCode = null,
        bool isCentral = false,
        int displayOrder = 0)
    {
        return new District(id, cityId, name, postalCode, isCentral, displayOrder);
    }

    public void Update(string name, string? postalCode, bool isCentral)
    {
        Name = name;
        PostalCode = postalCode;
        IsCentral = isCentral;
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
}
