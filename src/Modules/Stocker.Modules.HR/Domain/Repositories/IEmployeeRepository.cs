using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Employee entity
/// </summary>
public interface IEmployeeRepository : IHRRepository<Employee>
{
    /// <summary>
    /// Gets an employee with all related data
    /// </summary>
    Task<Employee?> GetWithDetailsAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an employee by code
    /// </summary>
    Task<Employee?> GetByCodeAsync(string employeeCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an employee by email
    /// </summary>
    Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an employee by national ID
    /// </summary>
    Task<Employee?> GetByNationalIdAsync(string nationalId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees by department
    /// </summary>
    Task<IReadOnlyList<Employee>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees by position
    /// </summary>
    Task<IReadOnlyList<Employee>> GetByPositionAsync(int positionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees by manager
    /// </summary>
    Task<IReadOnlyList<Employee>> GetByManagerAsync(int managerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees by status
    /// </summary>
    Task<IReadOnlyList<Employee>> GetByStatusAsync(EmployeeStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active employees
    /// </summary>
    Task<IReadOnlyList<Employee>> GetActiveEmployeesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees with probation ending soon
    /// </summary>
    Task<IReadOnlyList<Employee>> GetProbationEndingSoonAsync(int daysThreshold = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees with work anniversary in date range
    /// </summary>
    Task<IReadOnlyList<Employee>> GetWorkAnniversariesAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees with birthday in date range
    /// </summary>
    Task<IReadOnlyList<Employee>> GetBirthdaysAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees by shift
    /// </summary>
    Task<IReadOnlyList<Employee>> GetByShiftAsync(int shiftId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees by work location
    /// </summary>
    Task<IReadOnlyList<Employee>> GetByWorkLocationAsync(int workLocationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches employees by name, code, or email
    /// </summary>
    Task<IReadOnlyList<Employee>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the organization chart starting from an employee
    /// </summary>
    Task<Employee?> GetOrganizationChartAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if an employee with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeEmployeeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if an employee with the given email exists
    /// </summary>
    Task<bool> ExistsWithEmailAsync(string email, int? excludeEmployeeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of employees by department
    /// </summary>
    Task<int> GetCountByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of employees by position
    /// </summary>
    Task<int> GetCountByPositionAsync(int positionId, CancellationToken cancellationToken = default);
}
