using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Payslip entity
/// </summary>
public interface IPayslipRepository : IHRRepository<Payslip>
{
    /// <summary>
    /// Gets a payslip by ID with all related data
    /// </summary>
    System.Threading.Tasks.Task<Payslip?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all payslips with optional filters and pagination
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetAllAsync(
        int? employeeId = null,
        int? payrollId = null,
        int? year = null,
        int? month = null,
        PayslipStatus? status = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payslips by employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payslips by payroll
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetByPayrollAsync(int payrollId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payslips by period
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetByPeriodAsync(int year, int month, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a payslip by employee and period
    /// </summary>
    System.Threading.Tasks.Task<Payslip?> GetByEmployeeAndPeriodAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payslip by number
    /// </summary>
    System.Threading.Tasks.Task<Payslip?> GetByNumberAsync(string payslipNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payslips by status
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetByStatusAsync(PayslipStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new payslip
    /// </summary>
    System.Threading.Tasks.Task<Payslip> CreateAsync(Payslip payslip, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing payslip
    /// </summary>
    System.Threading.Tasks.Task<Payslip> UpdateAsync(Payslip payslip, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a payslip
    /// </summary>
    System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
