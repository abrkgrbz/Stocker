using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Position entity
/// </summary>
public class PositionRepository : BaseRepository<Position>, IPositionRepository
{
    public PositionRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Position?> GetWithEmployeesAsync(int positionId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employees.Where(e => !e.IsDeleted))
            .Include(p => p.Department)
            .Where(p => !p.IsDeleted && p.Id == positionId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Position>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.DepartmentId == departmentId)
            .OrderBy(p => p.Level)
            .ThenBy(p => p.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<Position?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Department)
            .Where(p => !p.IsDeleted && p.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Position>> GetActivePositionsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Department)
            .Where(p => !p.IsDeleted && p.IsActive)
            .OrderBy(p => p.Level)
            .ThenBy(p => p.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Position>> GetByLevelAsync(int level, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Department)
            .Where(p => !p.IsDeleted && p.Level == level)
            .OrderBy(p => p.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Position>> GetVacantPositionsAsync(CancellationToken cancellationToken = default)
    {
        // Get positions where current employees count is less than headcount
        var positions = await DbSet
            .Include(p => p.Employees.Where(e => !e.IsDeleted))
            .Include(p => p.Department)
            .Where(p => !p.IsDeleted && p.IsActive && p.HeadCount.HasValue)
            .ToListAsync(cancellationToken);

        return positions
            .Where(p => p.Employees.Count < p.HeadCount!.Value)
            .OrderBy(p => p.Level)
            .ThenBy(p => p.Title)
            .ToList();
    }

    public async Task<int> GetEmployeeCountAsync(int positionId, CancellationToken cancellationToken = default)
    {
        return await Context.Employees
            .CountAsync(e => !e.IsDeleted && e.PositionId == positionId, cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludePositionId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(p => !p.IsDeleted && p.Code == code);

        if (excludePositionId.HasValue)
        {
            query = query.Where(p => p.Id != excludePositionId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithTitleInDepartmentAsync(string title, int departmentId, int? excludePositionId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(p => !p.IsDeleted && p.Title == title && p.DepartmentId == departmentId);

        if (excludePositionId.HasValue)
        {
            query = query.Where(p => p.Id != excludePositionId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Position>> GetWithAvailableHeadcountAsync(CancellationToken cancellationToken = default)
    {
        var positions = await DbSet
            .Include(p => p.Employees.Where(e => !e.IsDeleted))
            .Include(p => p.Department)
            .Where(p => !p.IsDeleted && p.IsActive && p.HeadCount.HasValue)
            .ToListAsync(cancellationToken);

        return positions
            .Where(p => p.Employees.Count < p.HeadCount!.Value)
            .OrderBy(p => p.Level)
            .ThenBy(p => p.Title)
            .ToList();
    }

    public async Task<IReadOnlyList<Position>> GetPositionsByDepartmentWithStatsAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employees.Where(e => !e.IsDeleted))
            .Where(p => !p.IsDeleted && p.DepartmentId == departmentId)
            .OrderBy(p => p.Level)
            .ThenBy(p => p.Title)
            .ToListAsync(cancellationToken);
    }
}
