using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Department entity
/// </summary>
public class DepartmentRepository : BaseRepository<Department>, IDepartmentRepository
{
    public DepartmentRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Department?> GetWithSubDepartmentsAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.SubDepartments.Where(sd => !sd.IsDeleted))
            .Where(d => !d.IsDeleted && d.Id == departmentId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Department?> GetWithEmployeesAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.Employees.Where(e => !e.IsDeleted))
            .Where(d => !d.IsDeleted && d.Id == departmentId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Department?> GetWithPositionsAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.Positions.Where(p => !p.IsDeleted))
            .Where(d => !d.IsDeleted && d.Id == departmentId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Department>> GetRootDepartmentsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted && d.ParentDepartmentId == null)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Department>> GetSubDepartmentsAsync(int parentDepartmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted && d.ParentDepartmentId == parentDepartmentId)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Department?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted && d.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Department>> GetActiveDepartmentsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted && d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Department>> GetDepartmentTreeAsync(CancellationToken cancellationToken = default)
    {
        // Get all active departments with their subdepartments loaded
        return await DbSet
            .Include(d => d.SubDepartments.Where(sd => !sd.IsDeleted))
            .Where(d => !d.IsDeleted && d.ParentDepartmentId == null)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetEmployeeCountAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await Context.Employees
            .CountAsync(e => !e.IsDeleted && e.DepartmentId == departmentId, cancellationToken);
    }

    public async Task<bool> ExistsWithNameAsync(string name, int? parentDepartmentId = null, int? excludeDepartmentId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(d => !d.IsDeleted && d.Name == name);

        if (parentDepartmentId.HasValue)
        {
            query = query.Where(d => d.ParentDepartmentId == parentDepartmentId.Value);
        }
        else
        {
            query = query.Where(d => d.ParentDepartmentId == null);
        }

        if (excludeDepartmentId.HasValue)
        {
            query = query.Where(d => d.Id != excludeDepartmentId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeDepartmentId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(d => !d.IsDeleted && d.Code == code);

        if (excludeDepartmentId.HasValue)
        {
            query = query.Where(d => d.Id != excludeDepartmentId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    /// <summary>
    /// Tenant.Department ile eşleştirilmiş HR.Department'ı getirir
    /// </summary>
    public async Task<Department?> GetByTenantDepartmentIdAsync(Guid tenantDepartmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted && d.TenantDepartmentId == tenantDepartmentId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <summary>
    /// Tenant.Department ile eşleştirilmiş tüm HR.Department'ları getirir
    /// </summary>
    public async Task<IReadOnlyList<Department>> GetLinkedDepartmentsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted && d.TenantDepartmentId != null)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Tenant.Department ile eşleştirilmemiş HR.Department'ları getirir
    /// </summary>
    public async Task<IReadOnlyList<Department>> GetUnlinkedDepartmentsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted && d.TenantDepartmentId == null)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }
}
