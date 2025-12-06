using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for LeaveType entity
/// </summary>
public class LeaveTypeRepository : BaseRepository<LeaveType>, ILeaveTypeRepository
{
    public LeaveTypeRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<LeaveType?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(lt => !lt.IsDeleted)
            .FirstOrDefaultAsync(lt => lt.Code == code, cancellationToken);
    }

    public async Task<IReadOnlyList<LeaveType>> GetActiveLeaveTypesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(lt => !lt.IsDeleted && lt.IsActive)
            .OrderBy(lt => lt.DisplayOrder)
            .ThenBy(lt => lt.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LeaveType>> GetPaidLeaveTypesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(lt => !lt.IsDeleted && lt.IsActive && lt.IsPaid)
            .OrderBy(lt => lt.DisplayOrder)
            .ThenBy(lt => lt.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LeaveType>> GetCarryForwardLeaveTypesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(lt => !lt.IsDeleted && lt.IsActive && lt.IsCarryForward)
            .OrderBy(lt => lt.DisplayOrder)
            .ThenBy(lt => lt.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeLeaveTypeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(lt => !lt.IsDeleted && lt.Code == code);

        if (excludeLeaveTypeId.HasValue)
            query = query.Where(lt => lt.Id != excludeLeaveTypeId.Value);

        return await query.AnyAsync(cancellationToken);
    }
}
