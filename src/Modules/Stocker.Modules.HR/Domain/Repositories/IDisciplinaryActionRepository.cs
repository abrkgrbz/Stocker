using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for DisciplinaryAction entity
/// </summary>
public interface IDisciplinaryActionRepository : IHRRepository<DisciplinaryAction>
{
    /// <summary>
    /// Gets disciplinary actions by employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<DisciplinaryAction>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending disciplinary actions
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<DisciplinaryAction>> GetPendingActionsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets disciplinary actions by severity
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<DisciplinaryAction>> GetBySeverityAsync(SeverityLevel severity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employee warning count
    /// </summary>
    System.Threading.Tasks.Task<int> GetEmployeeWarningCountAsync(int employeeId, CancellationToken cancellationToken = default);
}
