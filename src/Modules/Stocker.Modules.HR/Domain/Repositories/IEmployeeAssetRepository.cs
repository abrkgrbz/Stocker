using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for EmployeeAsset entity
/// </summary>
public interface IEmployeeAssetRepository : IHRRepository<EmployeeAsset>
{
    /// <summary>
    /// Gets assets by employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeAsset>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets currently assigned assets
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeAsset>> GetAssignedAssetsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets assets by serial number
    /// </summary>
    System.Threading.Tasks.Task<EmployeeAsset?> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets assets with expiring warranty
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeAsset>> GetExpiringWarrantyAssetsAsync(int daysThreshold = 30, CancellationToken cancellationToken = default);
}
