using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for LeaveType entity
/// </summary>
public interface ILeaveTypeRepository : IHRRepository<LeaveType>
{
    /// <summary>
    /// Gets a leave type by code
    /// </summary>
    Task<LeaveType?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active leave types
    /// </summary>
    Task<IReadOnlyList<LeaveType>> GetActiveLeaveTypesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets paid leave types
    /// </summary>
    Task<IReadOnlyList<LeaveType>> GetPaidLeaveTypesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leave types that allow carry forward
    /// </summary>
    Task<IReadOnlyList<LeaveType>> GetCarryForwardLeaveTypesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a leave type with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeLeaveTypeId = null, CancellationToken cancellationToken = default);
}
