using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Çalışma lokasyonu entity'si
/// </summary>
public class WorkLocation : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public Address? Address { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public decimal? Latitude { get; private set; }
    public decimal? Longitude { get; private set; }
    public int? GeofenceRadiusMeters { get; private set; }
    public string? TimeZone { get; private set; }
    public bool IsHeadquarters { get; private set; }
    public bool IsRemote { get; private set; }
    public int? Capacity { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation Properties
    public virtual ICollection<Employee> Employees { get; private set; }

    protected WorkLocation()
    {
        Code = string.Empty;
        Name = string.Empty;
        Employees = new List<Employee>();
    }

    public WorkLocation(
        string code,
        string name,
        string? description = null,
        bool isHeadquarters = false)
    {
        Code = code;
        Name = name;
        Description = description;
        IsHeadquarters = isHeadquarters;
        IsRemote = false;
        IsActive = true;
        Employees = new List<Employee>();
    }

    public void Update(
        string name,
        string? description,
        string? phone,
        string? email,
        int? capacity)
    {
        Name = name;
        Description = description;
        Phone = phone;
        Email = email;
        Capacity = capacity;
    }

    public void SetAddress(Address? address)
    {
        Address = address;
    }

    public void SetGeolocation(decimal? latitude, decimal? longitude, int? geofenceRadiusMeters = null)
    {
        Latitude = latitude;
        Longitude = longitude;
        GeofenceRadiusMeters = geofenceRadiusMeters;
    }

    public void SetTimeZone(string? timeZone)
    {
        TimeZone = timeZone;
    }

    public void SetAsHeadquarters(bool isHeadquarters)
    {
        IsHeadquarters = isHeadquarters;
    }

    public void SetAsRemote(bool isRemote)
    {
        IsRemote = isRemote;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public bool IsWithinGeofence(decimal latitude, decimal longitude)
    {
        if (!Latitude.HasValue || !Longitude.HasValue || !GeofenceRadiusMeters.HasValue)
            return true; // No geofence set

        var distance = CalculateDistance(latitude, longitude);
        return distance <= GeofenceRadiusMeters.Value;
    }

    private double CalculateDistance(decimal lat, decimal lng)
    {
        // Haversine formula for distance calculation
        const double R = 6371000; // Earth's radius in meters
        var lat1 = (double)Latitude!.Value * Math.PI / 180;
        var lat2 = (double)lat * Math.PI / 180;
        var deltaLat = ((double)lat - (double)Latitude.Value) * Math.PI / 180;
        var deltaLng = ((double)lng - (double)Longitude!.Value) * Math.PI / 180;

        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) *
                Math.Sin(deltaLng / 2) * Math.Sin(deltaLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return R * c;
    }
}
