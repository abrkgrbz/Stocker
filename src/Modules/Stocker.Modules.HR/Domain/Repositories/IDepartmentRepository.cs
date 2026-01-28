using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Department entity
/// </summary>
public interface IDepartmentRepository : IHRRepository<Department>
{
    /// <summary>
    /// Gets a department with its sub-departments
    /// </summary>
    Task<Department?> GetWithSubDepartmentsAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a department with its employees
    /// </summary>
    Task<Department?> GetWithEmployeesAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a department by code
    /// </summary>
    Task<Department?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets root departments (no parent)
    /// </summary>
    Task<IReadOnlyList<Department>> GetRootDepartmentsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets sub-departments of a department
    /// </summary>
    Task<IReadOnlyList<Department>> GetSubDepartmentsAsync(int parentDepartmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the full department tree
    /// </summary>
    Task<IReadOnlyList<Department>> GetDepartmentTreeAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a department with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeDepartmentId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of employees in a department
    /// </summary>
    Task<int> GetEmployeeCountAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a department by its linked TenantDepartmentId
    /// </summary>
    Task<Department?> GetByTenantDepartmentIdAsync(Guid tenantDepartmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all departments that are linked to Tenant departments
    /// </summary>
    Task<IReadOnlyList<Department>> GetLinkedDepartmentsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all departments that are NOT linked to any Tenant department
    /// </summary>
    Task<IReadOnlyList<Department>> GetUnlinkedDepartmentsAsync(CancellationToken cancellationToken = default);
}
