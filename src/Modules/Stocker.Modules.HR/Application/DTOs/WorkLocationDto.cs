namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for WorkLocation entity
/// </summary>
public class WorkLocationDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int? GeofenceRadiusMeters { get; set; }
    public string? TimeZone { get; set; }
    public bool IsHeadquarters { get; set; }
    public bool IsRemote { get; set; }
    public int? Capacity { get; set; }
    public int EmployeeCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating a work location
/// </summary>
public class CreateWorkLocationDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int? GeofenceRadiusMeters { get; set; }
    public string? TimeZone { get; set; }
    public bool IsHeadquarters { get; set; }
    public bool IsRemote { get; set; }
    public int? Capacity { get; set; }
}

/// <summary>
/// DTO for updating a work location
/// </summary>
public class UpdateWorkLocationDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int? GeofenceRadiusMeters { get; set; }
    public string? TimeZone { get; set; }
    public bool IsHeadquarters { get; set; }
    public bool IsRemote { get; set; }
    public int? Capacity { get; set; }
}

/// <summary>
/// DTO for geofence check result
/// </summary>
public class GeofenceCheckResultDto
{
    public int WorkLocationId { get; set; }
    public string WorkLocationName { get; set; } = string.Empty;
    public bool IsWithinGeofence { get; set; }
    public double? DistanceMeters { get; set; }
    public int? GeofenceRadiusMeters { get; set; }
}
