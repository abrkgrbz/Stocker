using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Promotion entity
/// </summary>
public class PromotionRepository : BaseRepository<Promotion>, IPromotionRepository
{
    public PromotionRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.Code == code, cancellationToken);
    }

    public async Task<IReadOnlyList<Promotion>> GetActivePromotionsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Where(p => p.Status == PromotionStatus.Active &&
                        p.StartDate <= now && p.EndDate >= now)
            .OrderBy(p => p.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Promotion>> GetByStatusAsync(PromotionStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Status == status)
            .OrderBy(p => p.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Promotion>> GetByTypeAsync(PromotionType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Type == type)
            .OrderBy(p => p.Priority)
            .ToListAsync(cancellationToken);
    }
}
