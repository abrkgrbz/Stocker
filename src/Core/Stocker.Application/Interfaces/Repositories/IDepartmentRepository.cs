using Stocker.Domain.Tenant.Entities;

namespace Stocker.Application.Interfaces.Repositories;

public interface IDepartmentRepository
{
    Task<Department?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<Department>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<Department?> GetByNameAsync(string name, Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(Department department, CancellationToken cancellationToken = default);
    Task UpdateAsync(Department department, CancellationToken cancellationToken = default);
    Task DeleteAsync(Department department, CancellationToken cancellationToken = default);
    Task<int> GetEmployeeCountAsync(Guid departmentId, Guid tenantId, CancellationToken cancellationToken = default);
}
