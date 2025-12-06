using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Payroll entity
/// </summary>
public interface IPayrollRepository : IHRRepository<Payroll>
{
    /// <summary>
    /// Gets a payroll with its items
    /// </summary>
    Task<Payroll?> GetWithItemsAsync(int payrollId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payroll by number
    /// </summary>
    Task<Payroll?> GetByNumberAsync(string payrollNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payroll for an employee for a specific period
    /// </summary>
    Task<Payroll?> GetByEmployeeAndPeriodAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payrolls by employee
    /// </summary>
    Task<IReadOnlyList<Payroll>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payrolls for a specific period
    /// </summary>
    Task<IReadOnlyList<Payroll>> GetByPeriodAsync(int year, int month, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payrolls by status
    /// </summary>
    Task<IReadOnlyList<Payroll>> GetByStatusAsync(PayrollStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payrolls by department for a period
    /// </summary>
    Task<IReadOnlyList<Payroll>> GetByDepartmentAndPeriodAsync(int departmentId, int year, int month, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payroll summary for a period
    /// </summary>
    Task<(decimal TotalBaseSalary, decimal TotalEarnings, decimal TotalDeductions, decimal TotalNetSalary, decimal TotalEmployerCost)> GetPeriodSummaryAsync(int year, int month, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if payroll exists for an employee for a period
    /// </summary>
    Task<bool> ExistsForPeriodAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default);
}
