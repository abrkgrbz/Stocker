using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Overtime entity
/// </summary>
public interface IOvertimeRepository : IHRRepository<Overtime>
{
    /// <summary>
    /// Gets an overtime record by ID with all related data
    /// </summary>
    System.Threading.Tasks.Task<Overtime?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all overtime records with optional filters and pagination
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetAllAsync(
        int? employeeId = null,
        OvertimeStatus? status = null,
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        OvertimeType? overtimeType = null,
        bool? isPaid = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets overtime records by employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets overtime records by status
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetByStatusAsync(OvertimeStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets overtime records by date range
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending overtime records for approval
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetPendingApprovalsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unpaid overtime records
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetUnpaidAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new overtime record
    /// </summary>
    System.Threading.Tasks.Task<Overtime> CreateAsync(Overtime overtime, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing overtime record
    /// </summary>
    System.Threading.Tasks.Task<Overtime> UpdateAsync(Overtime overtime, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an overtime record
    /// </summary>
    System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
