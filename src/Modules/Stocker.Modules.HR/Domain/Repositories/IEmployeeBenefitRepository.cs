using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for EmployeeBenefit entity
/// </summary>
public interface IEmployeeBenefitRepository : IHRRepository<EmployeeBenefit>
{
    /// <summary>
    /// Gets benefits by employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeBenefit>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active benefits
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeBenefit>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets total benefit value for employee
    /// </summary>
    System.Threading.Tasks.Task<decimal> GetTotalBenefitValueAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expiring benefits
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeBenefit>> GetExpiringBenefitsAsync(int daysThreshold = 30, CancellationToken cancellationToken = default);
}
