using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for CommissionPlan entity
/// </summary>
public class CommissionRepository : BaseRepository<CommissionPlan>, ICommissionRepository
{
    public CommissionRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<CommissionPlan?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Tiers)
            .FirstOrDefaultAsync(c => c.Name == name, cancellationToken);
    }

    public async Task<IReadOnlyList<CommissionPlan>> GetActiveCommissionsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Tiers)
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommissionPlan>> GetByTypeAsync(CommissionType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Tiers)
            .Where(c => c.Type == type)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommissionPlan>> GetBySalesPersonIdAsync(Guid salesPersonId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Tiers)
            .Where(c => c.IsActive && c.ApplicableSalesPersons != null && c.ApplicableSalesPersons.Contains(salesPersonId.ToString()))
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }
}
