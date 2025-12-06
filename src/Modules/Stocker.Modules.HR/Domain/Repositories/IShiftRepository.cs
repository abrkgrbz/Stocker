using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Shift entity
/// </summary>
public interface IShiftRepository : IHRRepository<Shift>
{
    /// <summary>
    /// Gets a shift by code
    /// </summary>
    Task<Shift?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active shifts
    /// </summary>
    Task<IReadOnlyList<Shift>> GetActiveShiftsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets night shifts
    /// </summary>
    Task<IReadOnlyList<Shift>> GetNightShiftsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets flexible shifts
    /// </summary>
    Task<IReadOnlyList<Shift>> GetFlexibleShiftsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a shift with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeShiftId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of employees in a shift
    /// </summary>
    Task<int> GetEmployeeCountAsync(int shiftId, CancellationToken cancellationToken = default);
}
