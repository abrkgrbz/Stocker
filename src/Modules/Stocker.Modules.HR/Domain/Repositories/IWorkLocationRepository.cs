using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for WorkLocation entity
/// </summary>
public interface IWorkLocationRepository : IHRRepository<WorkLocation>
{
    /// <summary>
    /// Gets a work location by code
    /// </summary>
    Task<WorkLocation?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active work locations
    /// </summary>
    Task<IReadOnlyList<WorkLocation>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets headquarters location
    /// </summary>
    Task<WorkLocation?> GetHeadquartersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets remote work locations
    /// </summary>
    Task<IReadOnlyList<WorkLocation>> GetRemoteLocationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets locations with geofencing enabled
    /// </summary>
    Task<IReadOnlyList<WorkLocation>> GetWithGeofencingAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if location code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeLocationId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employee count for a location
    /// </summary>
    Task<int> GetEmployeeCountAsync(int workLocationId, CancellationToken cancellationToken = default);
}
