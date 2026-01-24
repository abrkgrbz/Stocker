using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Discount entity
/// </summary>
public class DiscountRepository : BaseRepository<Discount>, IDiscountRepository
{
    public DiscountRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<Discount?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(d => d.Code == code, cancellationToken);
    }

    public async Task<IReadOnlyList<Discount>> GetActiveDiscountsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Where(d => d.IsActive &&
                        (!d.StartDate.HasValue || d.StartDate.Value <= now) &&
                        (!d.EndDate.HasValue || d.EndDate.Value >= now))
            .OrderBy(d => d.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Discount>> GetByTypeAsync(DiscountType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.Type == type)
            .OrderBy(d => d.Priority)
            .ToListAsync(cancellationToken);
    }
}
