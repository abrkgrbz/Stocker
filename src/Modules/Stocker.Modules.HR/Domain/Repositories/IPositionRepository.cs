using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Position entity
/// </summary>
public interface IPositionRepository : IHRRepository<Position>
{
    /// <summary>
    /// Gets a position with its employees
    /// </summary>
    Task<Position?> GetWithEmployeesAsync(int positionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a position by code
    /// </summary>
    Task<Position?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets positions by department
    /// </summary>
    Task<IReadOnlyList<Position>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets positions by level
    /// </summary>
    Task<IReadOnlyList<Position>> GetByLevelAsync(int level, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active positions
    /// </summary>
    Task<IReadOnlyList<Position>> GetActivePositionsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets vacant positions
    /// </summary>
    Task<IReadOnlyList<Position>> GetVacantPositionsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets positions with available headcount
    /// </summary>
    Task<IReadOnlyList<Position>> GetWithAvailableHeadcountAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets positions by department with stats
    /// </summary>
    Task<IReadOnlyList<Position>> GetPositionsByDepartmentWithStatsAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a position with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludePositionId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a position with the given title exists in the department
    /// </summary>
    Task<bool> ExistsWithTitleInDepartmentAsync(string title, int departmentId, int? excludePositionId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of employees in a position
    /// </summary>
    Task<int> GetEmployeeCountAsync(int positionId, CancellationToken cancellationToken = default);
}
