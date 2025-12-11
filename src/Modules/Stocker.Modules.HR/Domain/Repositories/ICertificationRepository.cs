using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Certification entity
/// </summary>
public interface ICertificationRepository : IHRRepository<Certification>
{
    /// <summary>
    /// Gets certifications by employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Certification>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active certifications
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Certification>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expiring certifications
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Certification>> GetExpiringCertificationsAsync(int daysThreshold = 90, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expired certifications
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Certification>> GetExpiredCertificationsAsync(CancellationToken cancellationToken = default);
}
