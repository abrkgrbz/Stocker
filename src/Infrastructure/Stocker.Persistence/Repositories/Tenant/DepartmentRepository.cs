using Microsoft.EntityFrameworkCore;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Repositories.Tenant;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly TenantDbContext _context;

    public DepartmentRepository(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<Department?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == id && d.TenantId == tenantId && d.IsActive, cancellationToken);
    }

    public async Task<List<Department>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Departments
            .Where(d => d.TenantId == tenantId && d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Department?> GetByNameAsync(string name, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Departments
            .FirstOrDefaultAsync(d => d.Name == name && d.TenantId == tenantId && d.IsActive, cancellationToken);
    }

    public async Task AddAsync(Department department, CancellationToken cancellationToken = default)
    {
        await _context.Departments.AddAsync(department, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Department department, CancellationToken cancellationToken = default)
    {
        _context.Departments.Update(department);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Department department, CancellationToken cancellationToken = default)
    {
        department.Deactivate();
        _context.Departments.Update(department);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> GetEmployeeCountAsync(Guid departmentId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.TenantUsers
            .Where(u => u.DepartmentId == departmentId && u.TenantId == tenantId)
            .CountAsync(cancellationToken);
    }
}
