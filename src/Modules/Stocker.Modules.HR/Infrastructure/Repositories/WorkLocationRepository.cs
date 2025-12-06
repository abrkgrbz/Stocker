using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for WorkLocation entity
/// </summary>
public class WorkLocationRepository : BaseRepository<WorkLocation>, IWorkLocationRepository
{
    public WorkLocationRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<WorkLocation?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(w => !w.IsDeleted && w.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WorkLocation>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(w => !w.IsDeleted && w.IsActive)
            .OrderBy(w => w.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<WorkLocation?> GetHeadquartersAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(w => !w.IsDeleted && w.IsHeadquarters && w.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WorkLocation>> GetRemoteLocationsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(w => !w.IsDeleted && w.IsRemote && w.IsActive)
            .OrderBy(w => w.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WorkLocation>> GetWithGeofencingAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(w => !w.IsDeleted &&
                   w.IsActive &&
                   w.GeofenceRadiusMeters.HasValue &&
                   w.GeofenceRadiusMeters.Value > 0)
            .OrderBy(w => w.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeLocationId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(w => !w.IsDeleted && w.Code == code);

        if (excludeLocationId.HasValue)
        {
            query = query.Where(w => w.Id != excludeLocationId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<int> GetEmployeeCountAsync(int workLocationId, CancellationToken cancellationToken = default)
    {
        return await Context.Employees
            .CountAsync(e => !e.IsDeleted && e.WorkLocationId == workLocationId, cancellationToken);
    }
}
