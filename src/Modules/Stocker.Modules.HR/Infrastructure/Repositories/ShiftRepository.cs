using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Shift entity
/// </summary>
public class ShiftRepository : BaseRepository<Shift>, IShiftRepository
{
    public ShiftRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Shift?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Shift>> GetActiveShiftsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.IsActive)
            .OrderBy(s => s.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Shift>> GetNightShiftsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.IsNightShift)
            .OrderBy(s => s.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Shift>> GetFlexibleShiftsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.IsFlexible)
            .OrderBy(s => s.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeShiftId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(s => !s.IsDeleted && s.Code == code);

        if (excludeShiftId.HasValue)
        {
            query = query.Where(s => s.Id != excludeShiftId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<int> GetEmployeeCountAsync(int shiftId, CancellationToken cancellationToken = default)
    {
        return await Context.Employees
            .CountAsync(e => !e.IsDeleted && e.ShiftId == shiftId, cancellationToken);
    }
}
